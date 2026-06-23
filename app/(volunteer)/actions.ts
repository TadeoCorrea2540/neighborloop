"use server";

/**
 * Volunteer write actions. The TRUSTED path for save/apply/withdraw/profile.
 * Every action re-checks auth + role server-side (never trusts client ids) and
 * relies on RLS as the final gate. Returns typed results (no raw Postgres) so
 * the client can show a toast or route to /auth.
 */
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";
import { createNotificationsForUsers } from "@/lib/data/notifications";
import { createReminder } from "@/lib/data/reminders";
import type { ApplicationStatus } from "@/types/database";

export type ActionCode =
  | "auth"
  | "role"
  | "duplicate"
  | "closed"
  | "external"
  | "full"
  | "validation"
  | "unknown";

export type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string; code: ActionCode };

type VolunteerGuard = { ok: true; userId: string } | { ok: false; error: string; code: "auth" | "role" };

/** Non-redirecting guard: returns a code so the client decides (toast vs /auth). */
async function requireVolunteer(): Promise<VolunteerGuard> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in to continue." };
  const role = await getCurrentUserRole();
  if (role !== "volunteer") {
    return {
      ok: false,
      code: "role",
      error:
        role === "organizer"
          ? "Organizer accounts manage missions — volunteer actions need a volunteer account."
          : "This action is only available to volunteer accounts.",
    };
  }
  return { ok: true, userId: user.id };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function revalidateVolunteer() {
  revalidatePath("/explore");
  revalidatePath("/dashboard");
  revalidatePath("/my-missions");
}

// ---------------------------------------------------------------- save / unsave
export async function saveMissionAction(missionId: string): Promise<ActionResult> {
  const guard = await requireVolunteer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("saved_missions")
    .insert({ mission_id: missionId, user_id: guard.userId });

  // 23505 = already saved → idempotent success.
  if (error && error.code !== "23505") {
    return { ok: false, code: "unknown", error: "Couldn’t save this mission. Please try again." };
  }

  // Seed a "before it starts" reminder for newly-saved missions (best-effort, no cron).
  if (!error) {
    const { data: m } = await supabase.from("missions").select("starts_at, organization_id").eq("id", missionId).maybeSingle();
    const startsAt = (m as { starts_at: string | null } | null)?.starts_at;
    if (startsAt) {
      const at = Date.parse(startsAt) - 24 * 3_600_000;
      if (at > Date.now()) {
        await createReminder({
          type: "saved_mission_before_deadline",
          scheduledFor: new Date(at).toISOString(),
          missionId,
          userId: guard.userId,
          organizationId: (m as { organization_id: string }).organization_id,
        });
      }
    }
  }

  revalidateVolunteer();
  return { ok: true };
}

export async function unsaveMissionAction(missionId: string): Promise<ActionResult> {
  const guard = await requireVolunteer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("saved_missions")
    .delete()
    .eq("mission_id", missionId)
    .eq("user_id", guard.userId);

  if (error) return { ok: false, code: "unknown", error: "Couldn’t update saved missions." };
  revalidateVolunteer();
  return { ok: true };
}

// ---------------------------------------------------------------- apply
type SpotCountRpc = {
  rpc: (
    fn: "get_mission_spot_counts",
    args: { p_mission_ids: string[] }
  ) => Promise<{ data: { mission_id: string; approved_count: number }[] | null; error: unknown }>;
};

export async function applyToMissionAction(
  missionId: string,
  message?: string
): Promise<ActionResult<{ status: ApplicationStatus; applicationId: string }>> {
  const guard = await requireVolunteer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const note = (message ?? "").trim().slice(0, 1000) || null;
  const supabase = getServerSupabase();

  // Gating fields (RLS returns published/public only).
  const missionRes = await supabase
    .from("missions")
    .select("id, status, application_mode, volunteer_capacity, organization_id, title")
    .eq("id", missionId)
    .maybeSingle();
  const mission = missionRes.data as
    | { id: string; status: string; application_mode: string; volunteer_capacity: number | null; organization_id: string; title: string }
    | null;
  if (!mission || mission.status !== "published") {
    return { ok: false, code: "closed", error: "This mission isn’t accepting volunteers." };
  }
  if (mission.application_mode === "external") {
    return { ok: false, code: "external", error: "This organizer takes applications on their own site." };
  }

  // Decide initial status.
  let status: ApplicationStatus = "pending";
  if (mission.application_mode === "open") {
    let approved = 0;
    const rpc = getServerSupabase() as unknown as SpotCountRpc;
    const counts = await rpc.rpc("get_mission_spot_counts", { p_mission_ids: [missionId] });
    approved = counts.data?.[0]?.approved_count ?? 0;
    const hasSpace = mission.volunteer_capacity == null || mission.volunteer_capacity - approved > 0;
    status = hasSpace ? "approved" : "waitlisted";
  }

  // Re-apply support: a withdrawn/declined/cancelled row must be reactivated, not
  // re-inserted (unique (mission_id, volunteer_id) would block it).
  const existingRes = await supabase
    .from("applications")
    .select("id, status")
    .eq("mission_id", missionId)
    .eq("volunteer_id", guard.userId)
    .maybeSingle();
  const existing = existingRes.data as { id: string; status: ApplicationStatus } | null;

  if (existing) {
    const reusable: ApplicationStatus[] = ["withdrawn", "declined", "cancelled"];
    if (!reusable.includes(existing.status)) {
      return { ok: false, code: "duplicate", error: "You’ve already applied to this mission." };
    }
    const { error } = await supabase
      .from("applications")
      .update({
        status,
        message: note,
        applied_at: new Date().toISOString(),
        reviewed_at: status === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("volunteer_id", guard.userId);
    if (error) return { ok: false, code: "unknown", error: "Couldn’t submit your application." };
    await notifyOrganizersOfApplication(mission.organization_id, missionId, mission.title);
    revalidateVolunteer();
    return { ok: true, status, applicationId: existing.id };
  }

  const insertRes = await supabase
    .from("applications")
    .insert({
      mission_id: missionId,
      volunteer_id: guard.userId,
      message: note,
      status,
      ...(status !== "pending" ? { reviewed_at: new Date().toISOString() } : {}),
    })
    .select("id")
    .single();
  if (insertRes.error) {
    if (insertRes.error.code === "23505") {
      return { ok: false, code: "duplicate", error: "You’ve already applied to this mission." };
    }
    return { ok: false, code: "unknown", error: "Couldn’t submit your application. Please try again." };
  }
  await notifyOrganizersOfApplication(mission.organization_id, missionId, mission.title);
  revalidateVolunteer();
  return { ok: true, status, applicationId: (insertRes.data as { id: string }).id };
}

/**
 * Notify the org owner that a new application arrived (best-effort). We resolve
 * the owner from the organizations row (readable for public orgs) rather than
 * organization_members, which the applying volunteer can't read (RLS).
 */
async function notifyOrganizersOfApplication(orgId: string, missionId: string, title: string): Promise<void> {
  const supabase = getServerSupabase();
  const { data } = await supabase.from("organizations").select("owner_id").eq("id", orgId).maybeSingle();
  const ownerId = (data as { owner_id: string } | null)?.owner_id;
  if (!ownerId) return;
  await createNotificationsForUsers([ownerId], {
    type: "application_submitted",
    title: "New application",
    body: `A volunteer applied to “${title}”.`,
    linkUrl: `/manage/missions/${missionId}/applications`,
    entityType: "mission",
    entityId: missionId,
  });
}

// ---------------------------------------------------------------- withdraw
export async function withdrawApplicationAction(applicationId: string): Promise<ActionResult> {
  const guard = await requireVolunteer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(applicationId)) return { ok: false, code: "validation", error: "Invalid application." };

  const supabase = getServerSupabase();
  const appRes = await supabase
    .from("applications")
    .select("id, status, volunteer_id")
    .eq("id", applicationId)
    .maybeSingle();
  const app = appRes.data as { id: string; status: ApplicationStatus; volunteer_id: string } | null;
  if (!app || app.volunteer_id !== guard.userId) {
    return { ok: false, code: "validation", error: "Application not found." };
  }
  const withdrawable: ApplicationStatus[] = ["pending", "approved", "waitlisted"];
  if (!withdrawable.includes(app.status)) {
    return { ok: false, code: "validation", error: "This application can no longer be withdrawn." };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "withdrawn" })
    .eq("id", applicationId)
    .eq("volunteer_id", guard.userId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t withdraw your application." };
  revalidateVolunteer();
  return { ok: true };
}

// ---------------------------------------------------------------- profile
function parseList(formData: FormData, key: string): string[] {
  const all = formData.getAll(key).map(String);
  if (all.length > 1) return all.map((s) => s.trim()).filter(Boolean);
  const single = (all[0] ?? "").trim();
  if (!single) return [];
  return single
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function updateVolunteerProfileAction(formData: FormData): Promise<ActionResult> {
  const guard = await requireVolunteer();
  if (!guard.ok) return guard;

  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!displayName) return { ok: false, code: "validation", error: "Please enter a display name." };

  // Non-PII fields only — never email/role/id/phone/age.
  const update = {
    display_name: displayName.slice(0, 80),
    bio: (String(formData.get("bio") ?? "").trim() || null)?.slice(0, 600) ?? null,
    city: String(formData.get("city") ?? "").trim().slice(0, 120) || null,
    country_code: String(formData.get("country_code") ?? "").trim().slice(0, 8) || null,
    interests: parseList(formData, "interests").slice(0, 24),
    is_profile_public: formData.get("is_profile_public") != null,
  };

  const supabase = getServerSupabase();
  const { error } = await supabase.from("profiles").update(update).eq("id", guard.userId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t save your profile. Please try again." };

  revalidatePath("/settings");
  revalidatePath("/impact");
  revalidatePath("/", "layout");
  return { ok: true };
}
