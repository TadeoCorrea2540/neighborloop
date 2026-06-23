import "server-only";

/**
 * Single-mission analytics (server-only). Ownership-scoped: pass the
 * authorized orgId (guard.orgId); returns null if the mission isn't in that org
 * (so an organizer can never read another org's mission). RLS also enforces this.
 * "Saved" is intentionally omitted from the funnel — saved_missions is private to
 * the volunteer and not org-readable.
 */
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
import type { MissionStatus } from "@/types/database";

export interface MissionFunnel {
  applied: number;
  approved: number;
  waitlisted: number;
  declined: number;
  withdrawn: number;
  checkedIn: number; // showed up (checked_in | checked_out | completed)
  completed: number;
  certificates: number;
}

export interface MissionAttendanceSummary {
  registered: number;
  checkedIn: number;
  checkedOut: number;
  completed: number;
  noShow: number;
  excused: number;
  cancelled: number;
}

export interface MissionAnalytics {
  mission: { id: string; title: string; slug: string; status: MissionStatus; startsAt: string; capacity: number | null };
  funnel: MissionFunnel;
  attendance: MissionAttendanceSummary;
  totalHours: number;
  capacityFillRate: number | null; // completed / capacity, 0–1
  noShowRate: number | null; // noShow / (completed + noShow), 0–1
  approvalRate: number | null; // approved / applied, 0–1
}

export async function getMissionAnalytics(orgId: string, missionId: string): Promise<MissionAnalytics | null> {
  const supabase = getServerSupabase();
  const { data: missionRow } = await supabase
    .from("missions")
    .select("id, title, slug, status, starts_at, volunteer_capacity, organization_id")
    .eq("id", missionId)
    .eq("organization_id", orgId)
    .maybeSingle();
  const m = missionRow as
    | { id: string; title: string; slug: string; status: MissionStatus; starts_at: string; volunteer_capacity: number | null }
    | null;
  if (!m) return null;

  const db = getServerDb();
  const [{ data: appData }, { data: attData }, { count: certCount }] = await Promise.all([
    supabase.from("applications").select("status").eq("mission_id", missionId),
    db.from("attendance_records").select("status, hours_credited").eq("mission_id", missionId),
    db.from("certificates").select("id", { count: "exact", head: true }).eq("mission_id", missionId),
  ]);

  const apps = (appData ?? []) as { status: string }[];
  const appBy = (s: string) => apps.filter((a) => a.status === s).length;

  const att = (attData ?? []) as { status: string; hours_credited: number | null }[];
  const attBy = (s: string) => att.filter((a) => a.status === s).length;
  const completed = attBy("completed");
  const noShow = attBy("no_show");
  const checkedInShown = att.filter((a) => a.status === "checked_in" || a.status === "checked_out" || a.status === "completed").length;
  const totalHours = att.filter((a) => a.status === "completed").reduce((n, a) => n + (a.hours_credited != null ? Number(a.hours_credited) : 0), 0);

  const applied = apps.length;
  const approved = appBy("approved");
  const cap = m.volunteer_capacity;

  return {
    mission: { id: m.id, title: m.title, slug: m.slug, status: m.status, startsAt: m.starts_at, capacity: cap },
    funnel: {
      applied,
      approved,
      waitlisted: appBy("waitlisted"),
      declined: appBy("declined"),
      withdrawn: appBy("withdrawn"),
      checkedIn: checkedInShown,
      completed,
      certificates: certCount ?? 0,
    },
    attendance: {
      registered: attBy("registered"),
      checkedIn: attBy("checked_in"),
      checkedOut: attBy("checked_out"),
      completed,
      noShow,
      excused: attBy("excused"),
      cancelled: attBy("cancelled"),
    },
    totalHours: Math.round(totalHours * 100) / 100,
    capacityFillRate: cap && cap > 0 ? Math.min(1, completed / cap) : null,
    noShowRate: completed + noShow > 0 ? noShow / (completed + noShow) : null,
    approvalRate: applied > 0 ? approved / applied : null,
  };
}
