"use server";

/**
 * Organizer mission actions. The trusted path for create/edit/publish/status +
 * private details. Each re-checks organizer role + org membership + per-mission
 * ownership server-side; RLS (is_org_manager) is the final gate.
 */
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireOrganizer, UUID_RE, type ActionResult } from "@/lib/auth/require-organizer";
import { slugWithSuffix } from "@/lib/slug";
import { uploadFile, readFile, IMAGE_TYPES } from "@/lib/storage/upload";
import { BUCKETS, missionCoverPath } from "@/lib/storage/storage-paths";
import { createNotificationsForUsers } from "@/lib/data/notifications";
import type { MissionStatus } from "@/types/database";

// ---------- FormData parsing ----------
function str(fd: FormData, k: string): string | null {
  const v = (fd.get(k) ?? "").toString().trim();
  return v || null;
}
function num(fd: FormData, k: string): number | null {
  const v = (fd.get(k) ?? "").toString().trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function bool(fd: FormData, k: string): boolean {
  return fd.get(k) != null;
}
function list(fd: FormData, k: string): string[] {
  const v = (fd.get(k) ?? "").toString();
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
}
function dt(fd: FormData, k: string): string | null {
  const v = (fd.get(k) ?? "").toString().trim();
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

interface MissionInput {
  title: string | null;
  summary: string | null;
  description: string | null;
  category_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  is_virtual: boolean;
  location_label: string | null;
  city: string | null;
  country_code: string | null;
  volunteer_capacity: number | null;
  minimum_age: number | null;
  estimated_hours: number | null;
  difficulty: string | null;
  is_beginner_friendly: boolean;
  application_mode: string;
  skills: string[];
  materials_needed: string[];
  perks: string[];
  safety_notes: string | null;
  // cover_image_path is managed only via uploadMissionCoverAction — never set
  // from the form, so saving the form can't wipe an uploaded cover.
}

function parseMission(fd: FormData): MissionInput {
  return {
    title: str(fd, "title"),
    summary: str(fd, "summary"),
    description: str(fd, "description"),
    category_id: str(fd, "category_id"),
    starts_at: dt(fd, "starts_at"),
    ends_at: dt(fd, "ends_at"),
    timezone: str(fd, "timezone") ?? "UTC",
    is_virtual: bool(fd, "is_virtual"),
    location_label: str(fd, "location_label"),
    city: str(fd, "city"),
    country_code: str(fd, "country_code"),
    volunteer_capacity: num(fd, "volunteer_capacity"),
    minimum_age: num(fd, "minimum_age"),
    estimated_hours: num(fd, "estimated_hours"),
    difficulty: str(fd, "difficulty"),
    is_beginner_friendly: bool(fd, "is_beginner_friendly"),
    application_mode: str(fd, "application_mode") ?? "request",
    skills: list(fd, "skills"),
    materials_needed: list(fd, "materials_needed"),
    perks: list(fd, "perks"),
    safety_notes: str(fd, "safety_notes"),
  };
}

/** Shared DB-check validation so we never hit a raw 23514. */
function checkConstraints(m: MissionInput): string | null {
  if (m.ends_at && m.starts_at && m.ends_at <= m.starts_at)
    return "End time must be after the start time.";
  if (m.volunteer_capacity != null && m.volunteer_capacity <= 0)
    return "Volunteer capacity must be a positive number.";
  if (m.minimum_age != null && (m.minimum_age < 0 || m.minimum_age > 120))
    return "Minimum age must be between 0 and 120.";
  if (m.estimated_hours != null && m.estimated_hours < 0)
    return "Estimated hours can't be negative.";
  return null;
}

async function assertOwnsMission(
  orgId: string,
  missionId: string
): Promise<{ ok: true; status: MissionStatus } | { ok: false }> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("missions")
    .select("id, status, organization_id")
    .eq("id", missionId)
    .maybeSingle();
  const row = data as { id: string; status: MissionStatus; organization_id: string } | null;
  if (!row || row.organization_id !== orgId) return { ok: false };
  return { ok: true, status: row.status };
}

function revalidateManage() {
  revalidatePath("/manage/missions");
  revalidatePath("/manage/dashboard");
}
function revalidatePublic() {
  revalidatePath("/explore");
  revalidatePath("/", "layout"); // home featured + org pages
}

// ---------- create draft ----------
export async function createMissionDraftAction(
  fd: FormData
): Promise<ActionResult<{ missionId: string; slug: string }>> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;

  const m = parseMission(fd);
  if (!m.title) return { ok: false, code: "validation", error: "Please add a mission title." };
  if (!m.summary) return { ok: false, code: "validation", error: "Please add a short summary." };
  if (!m.starts_at) return { ok: false, code: "validation", error: "Please choose a start date & time." };
  const checkErr = checkConstraints(m);
  if (checkErr) return { ok: false, code: "validation", error: checkErr };

  const supabase = getServerSupabase();
  // Generate a unique slug; retry once on the (astronomically unlikely) collision.
  for (let attempt = 0; attempt < 2; attempt++) {
    const slug = slugWithSuffix(m.title);
    const { data, error } = await supabase
      .from("missions")
      .insert({ organization_id: guard.orgId, status: "draft", slug, ...m, title: m.title, summary: m.summary, starts_at: m.starts_at })
      .select("id, slug")
      .single();
    if (!error && data) {
      revalidateManage();
      return { ok: true, missionId: (data as { id: string }).id, slug: (data as { slug: string }).slug };
    }
    if (error && error.code !== "23505") {
      return { ok: false, code: error.code === "23514" ? "validation" : "unknown", error: "Couldn’t save this mission. Please check the fields and try again." };
    }
  }
  return { ok: false, code: "conflict", error: "Couldn’t generate a unique link for this mission. Try again." };
}

// ---------- update ----------
export async function updateMissionAction(missionId: string, fd: FormData): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const owns = await assertOwnsMission(guard.orgId, missionId);
  if (!owns.ok) return { ok: false, code: "forbidden", error: "You don’t have permission to edit this mission." };

  const m = parseMission(fd);
  if (!m.title) return { ok: false, code: "validation", error: "Please add a mission title." };
  if (!m.summary) return { ok: false, code: "validation", error: "Please add a short summary." };
  if (!m.starts_at) return { ok: false, code: "validation", error: "Please choose a start date & time." };
  const checkErr = checkConstraints(m);
  if (checkErr) return { ok: false, code: "validation", error: checkErr };

  const supabase = getServerSupabase();
  // Never change status, slug, or organization_id here.
  const { error } = await supabase
    .from("missions")
    .update({ ...m, title: m.title, summary: m.summary, starts_at: m.starts_at })
    .eq("id", missionId)
    .eq("organization_id", guard.orgId);
  if (error) return { ok: false, code: error.code === "23514" ? "validation" : "unknown", error: "Couldn’t save your changes." };

  revalidateManage();
  revalidatePath(`/manage/missions/${missionId}/edit`);
  if (owns.status === "published") revalidatePublic();
  return { ok: true };
}

// ---------- publish ----------
export async function publishMissionAction(missionId: string): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("missions")
    .select("*")
    .eq("id", missionId)
    .eq("organization_id", guard.orgId)
    .maybeSingle();
  const m = data as Record<string, unknown> | null;
  if (!m) return { ok: false, code: "forbidden", error: "You don’t have permission to publish this mission." };

  const status = m.status as MissionStatus;
  if (!["draft", "pending_review", "paused"].includes(status)) {
    return { ok: false, code: "transition", error: "This mission can’t be published from its current status." };
  }

  // Publish completeness (mission-level — verification is NOT required to publish).
  const missing: string[] = [];
  if (!m.title) missing.push("title");
  if (!m.summary) missing.push("summary");
  if (!m.description) missing.push("description");
  if (!m.category_id) missing.push("category");
  if (!m.starts_at) missing.push("start date");
  if (!m.is_virtual && !m.city) missing.push("city");
  if (!m.is_virtual && !m.location_label) missing.push("location");
  if (missing.length > 0) {
    return { ok: false, code: "validation", error: `This mission needs a few more details before publishing: ${missing.join(", ")}.` };
  }

  const patch: { status: MissionStatus; published_at?: string } = { status: "published" };
  if (!m.published_at) patch.published_at = new Date().toISOString();
  const { error } = await supabase.from("missions").update(patch).eq("id", missionId).eq("organization_id", guard.orgId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t publish this mission." };

  revalidateManage();
  revalidatePublic();
  revalidatePath(`/manage/missions/${missionId}/edit`);
  return { ok: true };
}

// ---------- status transitions ----------
async function changeStatus(
  missionId: string,
  from: MissionStatus[],
  to: MissionStatus,
  friendly: string
): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const owns = await assertOwnsMission(guard.orgId, missionId);
  if (!owns.ok) return { ok: false, code: "forbidden", error: "You don’t have permission to change this mission." };
  if (!from.includes(owns.status)) {
    return { ok: false, code: "transition", error: friendly };
  }

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("missions")
    .update({ status: to })
    .eq("id", missionId)
    .eq("organization_id", guard.orgId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t update this mission." };

  // Cancelling notifies approved volunteers (best-effort).
  if (to === "cancelled") {
    const { data: appRows } = await supabase
      .from("applications")
      .select("volunteer_id, missions!inner(title, slug)")
      .eq("mission_id", missionId)
      .eq("status", "approved");
    const rows = (appRows ?? []) as { volunteer_id: string; missions: { title: string; slug: string } | null }[];
    if (rows.length > 0) {
      const title = rows[0].missions?.title ?? "a mission";
      const slug = rows[0].missions?.slug ?? "";
      await createNotificationsForUsers(rows.map((r) => r.volunteer_id), {
        type: "mission_cancelled",
        title: "Mission cancelled",
        body: `“${title}” has been cancelled by the organizer.`,
        linkUrl: slug ? `/missions/${slug}` : "/my-missions",
        entityType: "mission",
        entityId: missionId,
      });
    }
  }

  revalidateManage();
  revalidatePublic(); // entering/leaving 'published' affects public pages
  revalidatePath(`/manage/missions/${missionId}/edit`);
  return { ok: true };
}

export const pauseMissionAction = (id: string) =>
  changeStatus(id, ["published"], "paused", "Only a published mission can be paused.");
export const resumeMissionAction = (id: string) =>
  changeStatus(id, ["paused"], "published", "Only a paused mission can be resumed.");
export const closeMissionAction = (id: string) =>
  changeStatus(id, ["published", "paused"], "closed", "Only an active mission can be closed.");
export const cancelMissionAction = (id: string) =>
  changeStatus(id, ["draft", "pending_review", "published", "paused"], "cancelled", "This mission can’t be cancelled from its current status.");
export const archiveMissionAction = (id: string) =>
  changeStatus(id, ["draft", "pending_review", "closed", "cancelled"], "archived", "Close or cancel the mission before archiving.");

// ---------- mission cover image upload ----------
export async function uploadMissionCoverAction(missionId: string, fd: FormData): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const owns = await assertOwnsMission(guard.orgId, missionId);
  if (!owns.ok) return { ok: false, code: "forbidden", error: "You don’t have permission to edit this mission." };

  const file = readFile(fd);
  if (!file) return { ok: false, code: "validation", error: "Please choose an image." };

  const up = await uploadFile({
    bucket: BUCKETS.missionMedia,
    path: missionCoverPath(guard.orgId, missionId, file.type),
    file,
    allowedTypes: IMAGE_TYPES,
    maxBytes: 5 * 1_048_576,
  });
  if (!up.ok) return { ok: false, code: "validation", error: up.error };

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("missions")
    .update({ cover_image_path: up.path })
    .eq("id", missionId)
    .eq("organization_id", guard.orgId);
  if (error) return { ok: false, code: "unknown", error: "Uploaded, but couldn’t save it to the mission." };

  revalidateManage();
  revalidatePath(`/manage/missions/${missionId}/edit`);
  if (owns.status === "published") revalidatePublic();
  return { ok: true };
}

// ---------- mission cover image removal ----------
export async function removeMissionCoverAction(missionId: string): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const owns = await assertOwnsMission(guard.orgId, missionId);
  if (!owns.ok) return { ok: false, code: "forbidden", error: "You don’t have permission to edit this mission." };

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("missions")
    .update({ cover_image_path: null })
    .eq("id", missionId)
    .eq("organization_id", guard.orgId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t remove the cover image." };

  revalidateManage();
  revalidatePath(`/manage/missions/${missionId}/edit`);
  if (owns.status === "published") revalidatePublic();
  return { ok: true };
}

// ---------- private details ----------
export async function upsertMissionPrivateDetailsAction(
  missionId: string,
  fd: FormData
): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const owns = await assertOwnsMission(guard.orgId, missionId);
  if (!owns.ok) return { ok: false, code: "forbidden", error: "You don’t have permission for this mission." };

  const supabase = getServerSupabase();
  const { error } = await supabase.from("mission_private_details").upsert(
    {
      mission_id: missionId,
      exact_address: str(fd, "exact_address"),
      private_meeting_instructions: str(fd, "private_meeting_instructions"),
      private_contact_name: str(fd, "private_contact_name"),
      private_contact_phone: str(fd, "private_contact_phone"),
      private_contact_email: str(fd, "private_contact_email"),
    },
    { onConflict: "mission_id" }
  );
  if (error) return { ok: false, code: "unknown", error: "Couldn’t save the private details." };

  revalidatePath(`/manage/missions/${missionId}/edit`);
  return { ok: true };
}
