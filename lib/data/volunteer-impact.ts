/**
 * Volunteer impact reads (server-only). Real completed-mission + hours data
 * from attendance_records (status='completed') for the current volunteer.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";

export interface CompletedMission {
  attendanceId: string;
  missionId: string;
  missionTitle: string;
  organizationName: string;
  startsAt: string | null;
  hoursCredited: number;
  certificateId: string | null;
}

export interface VolunteerImpactSummary {
  completedCount: number;
  totalHours: number;
  certificatesCount: number;
  causes: string[];
  recentCompleted: CompletedMission[];
}

type CompletedAttRow = {
  id: string;
  mission_id: string;
  hours_credited: number | null;
};

async function loadCompleted(userId: string): Promise<CompletedMission[]> {
  const db = getServerDb();
  const { data: attData } = await db
    .from("attendance_records")
    .select("id, mission_id, hours_credited")
    .eq("volunteer_id", userId)
    .eq("status", "completed")
    .order("updated_at", { ascending: false });
  const atts = (attData ?? []) as CompletedAttRow[];
  if (atts.length === 0) return [];

  const missionIds = Array.from(new Set(atts.map((a) => a.mission_id)));
  const supabase = getServerSupabase();
  const { data: missions } = await supabase
    .from("missions")
    .select("id, title, organization_id, starts_at, category_id")
    .in("id", missionIds);
  const mById = new Map(((missions ?? []) as { id: string; title: string; organization_id: string; starts_at: string; category_id: string | null }[]).map((m) => [m.id, m]));

  const orgIds = Array.from(new Set(((missions ?? []) as { organization_id: string }[]).map((m) => m.organization_id)));
  const { data: orgs } = orgIds.length
    ? await supabase.from("organizations").select("id, name").in("id", orgIds)
    : { data: [] as { id: string; name: string }[] };
  const oName = new Map(((orgs ?? []) as { id: string; name: string }[]).map((o) => [o.id, o.name]));

  const { data: certData } = await db
    .from("certificates")
    .select("id, attendance_record_id")
    .eq("volunteer_id", userId);
  const certByAtt = new Map(((certData ?? []) as { id: string; attendance_record_id: string }[]).map((c) => [c.attendance_record_id, c.id]));

  return atts.map((a) => {
    const m = mById.get(a.mission_id);
    return {
      attendanceId: a.id,
      missionId: a.mission_id,
      missionTitle: m?.title ?? "Mission",
      organizationName: m ? oName.get(m.organization_id) ?? "Organization" : "Organization",
      startsAt: m?.starts_at ?? null,
      hoursCredited: a.hours_credited != null ? Number(a.hours_credited) : 0,
      certificateId: certByAtt.get(a.id) ?? null,
    };
  });
}

export async function getVolunteerAttendanceHistory(userId: string): Promise<CompletedMission[]> {
  return loadCompleted(userId);
}

export async function getVolunteerImpactSummary(userId: string): Promise<VolunteerImpactSummary> {
  const completed = await loadCompleted(userId);
  const totalHours = completed.reduce((n, c) => n + c.hoursCredited, 0);
  const certificatesCount = completed.filter((c) => c.certificateId).length;

  // Causes = distinct categories of completed missions.
  let causes: string[] = [];
  if (completed.length > 0) {
    const supabase = getServerSupabase();
    const { data: missions } = await supabase
      .from("missions")
      .select("category_id")
      .in("id", completed.map((c) => c.missionId));
    const catIds = Array.from(new Set(((missions ?? []) as { category_id: string | null }[]).map((m) => m.category_id).filter(Boolean) as string[]));
    if (catIds.length) {
      const { data: cats } = await supabase.from("mission_categories").select("name").in("id", catIds);
      causes = ((cats ?? []) as { name: string }[]).map((c) => c.name);
    }
  }

  return {
    completedCount: completed.length,
    totalHours: Math.round(totalHours * 100) / 100,
    certificatesCount,
    causes,
    recentCompleted: completed.slice(0, 5),
  };
}
