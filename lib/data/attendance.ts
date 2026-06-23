/**
 * Attendance reads (server-only, RLS-scoped). Organizers see their own org's
 * records (RLS is_org_member); volunteers see their own. New tables aren't in
 * generated types yet, so attendance_records/certificates go through getServerDb().
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
import type { MissionStatus } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/attendance] ${context}: ${message}`);
}

export type AttendanceStatus =
  | "registered" | "checked_in" | "checked_out" | "completed" | "no_show" | "cancelled" | "excused";
export type CheckInMethod = "manual" | "qr" | "organizer" | "self_reported";

export interface AttendanceMissionSummary {
  id: string;
  title: string;
  slug: string;
  status: MissionStatus;
  startsAt: string;
  approvedCount: number;
  checkedInCount: number;
  completedCount: number;
  noShowCount: number;
}

export interface AttendanceRosterRow {
  applicationId: string;
  volunteerId: string;
  displayName: string;
  attendanceId: string | null;
  status: AttendanceStatus;
  checkInMethod: CheckInMethod | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  hoursCredited: number | null;
  organizerNote: string | null;
  certificateId: string | null;
}

type AttRow = {
  id: string;
  mission_id: string;
  volunteer_id: string;
  status: AttendanceStatus;
  check_in_method: CheckInMethod | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  hours_credited: number | null;
  organizer_note: string | null;
};

export async function getOrganizationAttendanceMissions(
  organizationId: string
): Promise<AttendanceMissionSummary[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("missions")
    .select("id, title, slug, status, starts_at")
    .eq("organization_id", organizationId)
    .in("status", ["published", "paused", "closed", "archived"])
    .order("starts_at", { ascending: false });
  if (error) fail("getOrganizationAttendanceMissions", error.message);
  const missions = (data ?? []) as { id: string; title: string; slug: string; status: MissionStatus; starts_at: string }[];
  if (missions.length === 0) return [];

  const ids = missions.map((m) => m.id);
  const [{ data: appData }, { data: attData }] = await Promise.all([
    supabase.from("applications").select("mission_id, status").in("mission_id", ids),
    getServerDb().from("attendance_records").select("mission_id, status").in("mission_id", ids),
  ]);

  const approved = new Map<string, number>();
  for (const a of (appData ?? []) as { mission_id: string; status: string }[]) {
    if (a.status === "approved") approved.set(a.mission_id, (approved.get(a.mission_id) ?? 0) + 1);
  }
  const checkedIn = new Map<string, number>();
  const completed = new Map<string, number>();
  const noShow = new Map<string, number>();
  for (const a of (attData ?? []) as { mission_id: string; status: AttendanceStatus }[]) {
    if (a.status === "checked_in" || a.status === "checked_out") checkedIn.set(a.mission_id, (checkedIn.get(a.mission_id) ?? 0) + 1);
    else if (a.status === "completed") completed.set(a.mission_id, (completed.get(a.mission_id) ?? 0) + 1);
    else if (a.status === "no_show") noShow.set(a.mission_id, (noShow.get(a.mission_id) ?? 0) + 1);
  }

  return missions.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    status: m.status,
    startsAt: m.starts_at,
    approvedCount: approved.get(m.id) ?? 0,
    checkedInCount: checkedIn.get(m.id) ?? 0,
    completedCount: completed.get(m.id) ?? 0,
    noShowCount: noShow.get(m.id) ?? 0,
  }));
}

export interface MissionAttendanceView {
  mission: { id: string; title: string; slug: string; status: MissionStatus; startsAt: string; estimatedHours: number | null; volunteerCapacity: number | null };
  roster: AttendanceRosterRow[];
}

/**
 * The current volunteer's own attendance for a mission (RLS: volunteer reads
 * own). Used on the mission detail page so a completed volunteer sees a
 * completion state instead of apply/withdraw.
 */
export async function getVolunteerAttendanceForMission(
  userId: string,
  missionId: string
): Promise<{ status: AttendanceStatus; hoursCredited: number | null; certificateId: string | null } | null> {
  const db = getServerDb();
  const { data } = await db
    .from("attendance_records")
    .select("id, status, hours_credited")
    .eq("mission_id", missionId)
    .eq("volunteer_id", userId)
    .maybeSingle();
  const row = data as { id: string; status: AttendanceStatus; hours_credited: number | null } | null;
  if (!row) return null;

  const { data: cert } = await db
    .from("certificates")
    .select("id")
    .eq("attendance_record_id", row.id)
    .maybeSingle();

  return {
    status: row.status,
    hoursCredited: row.hours_credited != null ? Number(row.hours_credited) : null,
    certificateId: (cert as { id: string } | null)?.id ?? null,
  };
}

export async function getMissionAttendanceList(
  organizationId: string,
  missionId: string
): Promise<MissionAttendanceView | null> {
  const supabase = getServerSupabase();
  const { data: missionRow } = await supabase
    .from("missions")
    .select("id, title, slug, status, starts_at, estimated_hours, volunteer_capacity, organization_id")
    .eq("id", missionId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  const m = missionRow as
    | { id: string; title: string; slug: string; status: MissionStatus; starts_at: string; estimated_hours: number | null; volunteer_capacity: number | null }
    | null;
  if (!m) return null;

  // Approved applicants for this mission (the people who can be marked attended).
  const { data: appData } = await supabase
    .from("applications")
    .select("id, volunteer_id, status")
    .eq("mission_id", missionId)
    .eq("status", "approved");
  const apps = (appData ?? []) as { id: string; volunteer_id: string; status: string }[];

  // Volunteer names (null-safe for private profiles).
  const volunteerIds = Array.from(new Set(apps.map((a) => a.volunteer_id)));
  const { data: profs } = volunteerIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", volunteerIds)
    : { data: [] as { id: string; display_name: string }[] };
  const nameById = new Map(((profs ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p.display_name]));

  // Attendance + certificates for this mission.
  const db = getServerDb();
  const [{ data: attData }, { data: certData }] = await Promise.all([
    db.from("attendance_records").select("id, mission_id, volunteer_id, status, check_in_method, checked_in_at, checked_out_at, hours_credited, organizer_note").eq("mission_id", missionId),
    db.from("certificates").select("id, attendance_record_id").eq("mission_id", missionId),
  ]);
  const attByVol = new Map(((attData ?? []) as AttRow[]).map((a) => [a.volunteer_id, a]));
  const certByAtt = new Map(((certData ?? []) as { id: string; attendance_record_id: string }[]).map((c) => [c.attendance_record_id, c.id]));

  const roster: AttendanceRosterRow[] = apps.map((app) => {
    const att = attByVol.get(app.volunteer_id);
    return {
      applicationId: app.id,
      volunteerId: app.volunteer_id,
      displayName: nameById.get(app.volunteer_id) ?? "Volunteer",
      attendanceId: att?.id ?? null,
      status: att?.status ?? "registered",
      checkInMethod: att?.check_in_method ?? null,
      checkedInAt: att?.checked_in_at ?? null,
      checkedOutAt: att?.checked_out_at ?? null,
      hoursCredited: att?.hours_credited ?? null,
      organizerNote: att?.organizer_note ?? null,
      certificateId: att ? certByAtt.get(att.id) ?? null : null,
    };
  });

  return {
    mission: {
      id: m.id, title: m.title, slug: m.slug, status: m.status,
      startsAt: m.starts_at, estimatedHours: m.estimated_hours, volunteerCapacity: m.volunteer_capacity,
    },
    roster,
  };
}
