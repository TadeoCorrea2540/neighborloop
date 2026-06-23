"use server";

/**
 * Organizer attendance, check-in-token, and certificate actions. Each:
 * requireOrganizer() → ownership (mission/record belongs to the org) → mutate →
 * revalidate → typed ActionResult. Volunteers can't reach these (guard + RLS).
 * New tables go through getServerDb() (not yet in generated types).
 */
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
import { requireOrganizer, UUID_RE, type ActionResult } from "@/lib/auth/require-organizer";
import { createNotification } from "@/lib/data/notifications";

// ---------- helpers ----------
function roundQuarter(hours: number): number {
  return Math.max(0, Math.round(hours * 4) / 4);
}

async function ownedMission(
  orgId: string,
  missionId: string
): Promise<{ id: string; estimatedHours: number | null } | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("missions")
    .select("id, estimated_hours, organization_id")
    .eq("id", missionId)
    .maybeSingle();
  const m = data as { id: string; estimated_hours: number | null; organization_id: string } | null;
  if (!m || m.organization_id !== orgId) return null;
  return { id: m.id, estimatedHours: m.estimated_hours };
}

async function approvedApplicationId(missionId: string, volunteerId: string): Promise<string | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("applications")
    .select("id")
    .eq("mission_id", missionId)
    .eq("volunteer_id", volunteerId)
    .eq("status", "approved")
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

interface OwnedAttendance {
  id: string;
  missionId: string;
  volunteerId: string;
  status: string;
  checkedInAt: string | null;
}
async function ownedAttendance(orgId: string, attendanceId: string): Promise<OwnedAttendance | null> {
  const { data } = await getServerDb()
    .from("attendance_records")
    .select("id, mission_id, volunteer_id, organization_id, status, checked_in_at")
    .eq("id", attendanceId)
    .maybeSingle();
  const a = data as { id: string; mission_id: string; volunteer_id: string; organization_id: string; status: string; checked_in_at: string | null } | null;
  if (!a || a.organization_id !== orgId) return null;
  return { id: a.id, missionId: a.mission_id, volunteerId: a.volunteer_id, status: a.status, checkedInAt: a.checked_in_at };
}

/** Mission title + slug for notification copy (best-effort). */
async function missionMeta(missionId: string): Promise<{ title: string; slug: string }> {
  const { data } = await getServerSupabase().from("missions").select("title, slug").eq("id", missionId).maybeSingle();
  const m = data as { title: string; slug: string } | null;
  return { title: m?.title ?? "your mission", slug: m?.slug ?? "" };
}

function revalidateMission(missionId: string) {
  revalidatePath("/manage/attendance");
  revalidatePath(`/manage/missions/${missionId}/attendance`);
}

// ---------- create/upsert by (mission, volunteer) ----------
async function upsertStatus(
  missionId: string,
  volunteerId: string,
  status: "checked_in" | "no_show" | "excused",
  method: "organizer" | "manual"
): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId) || !UUID_RE.test(volunteerId))
    return { ok: false, code: "validation", error: "Invalid mission or volunteer." };

  const mission = await ownedMission(guard.orgId, missionId);
  if (!mission) return { ok: false, code: "forbidden", error: "You don’t manage this mission." };

  const appId = await approvedApplicationId(missionId, volunteerId);
  if (!appId) return { ok: false, code: "forbidden", error: "This volunteer isn’t approved for this mission." };

  const db = getServerDb();
  const { data: existing } = await db
    .from("attendance_records")
    .select("id, checked_in_at")
    .eq("mission_id", missionId)
    .eq("volunteer_id", volunteerId)
    .maybeSingle();
  const row = existing as { id: string; checked_in_at: string | null } | null;

  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = { status };
  if (status === "checked_in") {
    patch.check_in_method = method;
    patch.checked_in_at = row?.checked_in_at ?? nowIso;
  }

  if (row) {
    const { error } = await db.from("attendance_records").update(patch).eq("id", row.id);
    if (error) return { ok: false, code: "unknown", error: "Couldn’t update attendance." };
  } else {
    const { error } = await db.from("attendance_records").insert({
      mission_id: missionId,
      application_id: appId,
      volunteer_id: volunteerId,
      organization_id: guard.orgId,
      ...patch,
    });
    if (error) return { ok: false, code: "unknown", error: "Couldn’t record attendance." };
  }
  revalidateMission(missionId);
  return { ok: true };
}

export const markCheckedInAction = (missionId: string, volunteerId: string) =>
  upsertStatus(missionId, volunteerId, "checked_in", "organizer");
export const markNoShowAction = (missionId: string, volunteerId: string) =>
  upsertStatus(missionId, volunteerId, "no_show", "organizer");
export const markExcusedAction = (missionId: string, volunteerId: string) =>
  upsertStatus(missionId, volunteerId, "excused", "organizer");

// ---------- check out (computes hours) ----------
export async function markCheckedOutAction(missionId: string, volunteerId: string): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId) || !UUID_RE.test(volunteerId))
    return { ok: false, code: "validation", error: "Invalid mission or volunteer." };
  const mission = await ownedMission(guard.orgId, missionId);
  if (!mission) return { ok: false, code: "forbidden", error: "You don’t manage this mission." };

  const db = getServerDb();
  const { data } = await db
    .from("attendance_records")
    .select("id, checked_in_at, status")
    .eq("mission_id", missionId)
    .eq("volunteer_id", volunteerId)
    .maybeSingle();
  const row = data as { id: string; checked_in_at: string | null; status: string } | null;
  if (!row || !row.checked_in_at)
    return { ok: false, code: "transition", error: "Check the volunteer in before checking them out." };

  const nowIso = new Date().toISOString();
  const hours = roundQuarter((Date.parse(nowIso) - Date.parse(row.checked_in_at)) / 3_600_000);
  const { error } = await db
    .from("attendance_records")
    .update({ status: "checked_out", checked_out_at: nowIso, hours_credited: hours })
    .eq("id", row.id);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t check out this volunteer." };
  revalidateMission(missionId);
  return { ok: true };
}

// ---------- complete / hours / note (by attendance id) ----------
export async function markCompletedAction(attendanceId: string, hours: number): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(attendanceId)) return { ok: false, code: "validation", error: "Invalid record." };
  if (!Number.isFinite(hours) || hours < 0) return { ok: false, code: "validation", error: "Hours must be 0 or more." };

  const att = await ownedAttendance(guard.orgId, attendanceId);
  if (!att) return { ok: false, code: "forbidden", error: "You don’t manage this record." };

  const { error } = await getServerDb()
    .from("attendance_records")
    .update({
      status: "completed",
      hours_credited: roundQuarter(hours),
      confirmed_by: guard.userId,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", attendanceId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t mark this complete." };

  const meta = await missionMeta(att.missionId);
  await createNotification(att.volunteerId, {
    type: "attendance_completed",
    title: "Attendance confirmed ✅",
    body: `Your ${roundQuarter(hours)} hour${roundQuarter(hours) === 1 ? "" : "s"} for “${meta.title}” are confirmed.`,
    linkUrl: "/impact",
    entityType: "mission",
    entityId: att.missionId,
  });

  revalidateMission(att.missionId);
  revalidatePath("/manage/dashboard");
  return { ok: true };
}

export async function updateHoursAction(attendanceId: string, hours: number): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(attendanceId)) return { ok: false, code: "validation", error: "Invalid record." };
  if (!Number.isFinite(hours) || hours < 0) return { ok: false, code: "validation", error: "Hours must be 0 or more." };
  const att = await ownedAttendance(guard.orgId, attendanceId);
  if (!att) return { ok: false, code: "forbidden", error: "You don’t manage this record." };
  const { error } = await getServerDb()
    .from("attendance_records")
    .update({ hours_credited: roundQuarter(hours) })
    .eq("id", attendanceId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t update hours." };
  revalidateMission(att.missionId);
  return { ok: true };
}

export async function updateNoteAction(attendanceId: string, note: string): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(attendanceId)) return { ok: false, code: "validation", error: "Invalid record." };
  const att = await ownedAttendance(guard.orgId, attendanceId);
  if (!att) return { ok: false, code: "forbidden", error: "You don’t manage this record." };
  const { error } = await getServerDb()
    .from("attendance_records")
    .update({ organizer_note: note.trim().slice(0, 1000) || null })
    .eq("id", attendanceId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t save the note." };
  revalidateMission(att.missionId);
  return { ok: true };
}

// ---------- certificates ----------
function certNumber(): string {
  const year = new Date().getUTCFullYear();
  return `NL-${year}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function issueCertificateAction(attendanceRecordId: string): Promise<ActionResult<{ certificateId: string }>> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(attendanceRecordId)) return { ok: false, code: "validation", error: "Invalid record." };

  const db = getServerDb();
  const { data } = await db
    .from("attendance_records")
    .select("id, mission_id, volunteer_id, organization_id, status, hours_credited")
    .eq("id", attendanceRecordId)
    .maybeSingle();
  const att = data as
    | { id: string; mission_id: string; volunteer_id: string; organization_id: string; status: string; hours_credited: number | null }
    | null;
  if (!att || att.organization_id !== guard.orgId)
    return { ok: false, code: "forbidden", error: "You don’t manage this record." };
  if (att.status !== "completed")
    return { ok: false, code: "transition", error: "Confirm attendance as completed before issuing a certificate." };
  if (att.hours_credited == null)
    return { ok: false, code: "validation", error: "Set the credited hours first." };

  const { data: existing } = await db.from("certificates").select("id").eq("attendance_record_id", att.id).maybeSingle();
  if (existing) return { ok: true, certificateId: (existing as { id: string }).id };

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: inserted, error } = await db
      .from("certificates")
      .insert({
        volunteer_id: att.volunteer_id,
        mission_id: att.mission_id,
        organization_id: att.organization_id,
        attendance_record_id: att.id,
        certificate_number: certNumber(),
        hours_credited: att.hours_credited,
        issued_by: guard.userId,
      })
      .select("id")
      .single();
    if (!error && inserted) {
      const certId = (inserted as { id: string }).id;
      const meta = await missionMeta(att.mission_id);
      await createNotification(att.volunteer_id, {
        type: "certificate_issued",
        title: "Certificate issued 🏅",
        body: `Your certificate for “${meta.title}” is ready.`,
        linkUrl: `/certificates/${certId}`,
        entityType: "certificate",
        entityId: certId,
      });
      revalidateMission(att.mission_id);
      revalidatePath("/impact");
      revalidatePath("/my-missions");
      return { ok: true, certificateId: certId };
    }
    if (error && error.code !== "23505") {
      return { ok: false, code: "unknown", error: "Couldn’t issue the certificate." };
    }
    // 23505 on attendance_record uniqueness → someone issued concurrently; fetch it.
    const { data: race } = await db.from("certificates").select("id").eq("attendance_record_id", att.id).maybeSingle();
    if (race) return { ok: true, certificateId: (race as { id: string }).id };
    // else cert-number collision → retry with a new number
  }
  return { ok: false, code: "conflict", error: "Couldn’t generate a unique certificate number. Try again." };
}

// ---------- check-in tokens / QR ----------
export async function generateCheckInTokenAction(
  missionId: string
): Promise<ActionResult<{ url: string; qrDataUrl: string }>> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };
  const mission = await ownedMission(guard.orgId, missionId);
  if (!mission) return { ok: false, code: "forbidden", error: "You don’t manage this mission." };

  const db = getServerDb();
  // Deactivate any existing active token (partial unique index allows one).
  await db.from("check_in_tokens").update({ is_active: false }).eq("mission_id", missionId).eq("is_active", true);

  const raw = `${randomBytes(16).toString("hex")}`;
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 3_600_000).toISOString(); // 30 days

  const { error } = await db.from("check_in_tokens").insert({
    mission_id: missionId,
    organization_id: guard.orgId,
    token_hash: tokenHash,
    token_type: "mission_check_in",
    is_active: true,
    expires_at: expiresAt,
    created_by: guard.userId,
  });
  if (error) return { ok: false, code: "unknown", error: "Couldn’t generate the check-in code." };

  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const url = `${proto}://${host}/check-in/${raw}`;
  const qrDataUrl = await QRCode.toDataURL(url, { width: 320, margin: 2 });

  revalidatePath(`/manage/missions/${missionId}/check-in`);
  return { ok: true, url, qrDataUrl };
}

export async function deactivateCheckInTokenAction(tokenId: string): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(tokenId)) return { ok: false, code: "validation", error: "Invalid token." };
  const db = getServerDb();
  const { data } = await db.from("check_in_tokens").select("id, mission_id, organization_id").eq("id", tokenId).maybeSingle();
  const t = data as { id: string; mission_id: string; organization_id: string } | null;
  if (!t || t.organization_id !== guard.orgId) return { ok: false, code: "forbidden", error: "You don’t manage this code." };
  const { error } = await db.from("check_in_tokens").update({ is_active: false }).eq("id", tokenId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t deactivate the code." };
  revalidatePath(`/manage/missions/${t.mission_id}/check-in`);
  return { ok: true };
}
