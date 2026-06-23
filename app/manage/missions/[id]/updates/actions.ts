"use server";

/**
 * Organizer mission announcements. Org-manager only (guard + RLS). Inserts a
 * mission_update (visible to org members + approved volunteers via RLS) and
 * notifies approved volunteers (preference-gated, best-effort).
 */
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
import { requireOrganizer, UUID_RE, type ActionResult } from "@/lib/auth/require-organizer";
import { createNotificationsForUsers } from "@/lib/data/notifications";

const VALID_TYPES = ["general", "schedule_change", "location_change", "reminder", "attendance", "cancellation", "thank_you"];

export async function createMissionUpdateAction(missionId: string, fd: FormData): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const title = (fd.get("title") ?? "").toString().trim();
  const body = (fd.get("body") ?? "").toString().trim();
  const updateType = (fd.get("update_type") ?? "general").toString();
  if (!title) return { ok: false, code: "validation", error: "Please add a title." };
  if (!body) return { ok: false, code: "validation", error: "Please add an update message." };
  if (!VALID_TYPES.includes(updateType)) return { ok: false, code: "validation", error: "Invalid update type." };

  const supabase = getServerSupabase();
  // Ownership: the mission must belong to the organizer's org.
  const { data: missionRow } = await supabase
    .from("missions")
    .select("id, organization_id, title, slug")
    .eq("id", missionId)
    .maybeSingle();
  const mission = missionRow as { id: string; organization_id: string; title: string; slug: string } | null;
  if (!mission || mission.organization_id !== guard.orgId) {
    return { ok: false, code: "forbidden", error: "You don’t manage this mission." };
  }

  const { error } = await getServerDb().from("mission_updates").insert({
    mission_id: missionId,
    organization_id: guard.orgId,
    created_by: guard.userId,
    title: title.slice(0, 140),
    body: body.slice(0, 4000),
    update_type: updateType,
    audience: "approved_volunteers",
  });
  if (error) return { ok: false, code: "unknown", error: "Couldn’t post this update." };

  // Notify approved volunteers (organizer can read their own org's applications).
  const { data: appRows } = await supabase
    .from("applications")
    .select("volunteer_id")
    .eq("mission_id", missionId)
    .eq("status", "approved");
  const volunteerIds = ((appRows ?? []) as { volunteer_id: string }[]).map((a) => a.volunteer_id);
  await createNotificationsForUsers(volunteerIds, {
    type: "mission_update",
    title: `Update: ${mission.title}`,
    body: title,
    linkUrl: `/missions/${mission.slug}`,
    entityType: "mission",
    entityId: missionId,
  });

  revalidatePath(`/manage/missions/${missionId}/updates`);
  return { ok: true };
}
