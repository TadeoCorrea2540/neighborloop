import "server-only";

/**
 * Volunteer analytics — additive to lib/data/volunteer-impact.ts (which stays
 * the source of truth for the core impact summary). These add a monthly
 * timeline, a richer cause breakdown, and milestone derivation. RLS scopes every
 * read to the volunteer's own records (volunteer_id = auth.uid()).
 */
import { getServerSupabase } from "@/lib/supabase/server";
import {
  getVolunteerAttendanceHistory,
  getVolunteerImpactSummary,
  type CompletedMission,
  type VolunteerImpactSummary,
} from "@/lib/data/volunteer-impact";
import { inRange, resolveDateRange, type DateRange } from "./date-range";

export interface VolunteerTimelinePoint {
  period: string; // "YYYY-MM"
  label: string; // "Mar 2026"
  hours: number;
  completed: number;
}

export interface VolunteerCauseSlice {
  categoryId: string;
  name: string;
  iconKey: string | null;
  accentColor: string | null;
  hours: number;
  completed: number;
  pct: number; // share of total completed hours, 0–100
}

export interface VolunteerMilestone {
  key: string;
  label: string;
  emoji: string;
  achieved: boolean;
  current: number;
  target: number;
}

const MONTH_LABEL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function periodOf(iso: string | null): string | null {
  if (!iso || iso.length < 7) return null;
  return iso.slice(0, 7); // YYYY-MM (UTC)
}

function periodLabel(period: string): string {
  const [y, m] = period.split("-");
  const idx = Number(m) - 1;
  return `${MONTH_LABEL[idx] ?? m} ${y}`;
}

/** Monthly completed-hours timeline for the volunteer, filtered by the range (on mission start). */
export async function getVolunteerTimeline(
  userId: string,
  range: DateRange = "all_time",
  customFrom?: string,
  customTo?: string,
): Promise<VolunteerTimelinePoint[]> {
  const completed = await getVolunteerAttendanceHistory(userId);
  const r = resolveDateRange(range, customFrom, customTo);
  const byPeriod = new Map<string, { hours: number; completed: number }>();
  for (const c of completed) {
    if (!inRange(c.startsAt, r)) continue;
    const p = periodOf(c.startsAt);
    if (!p) continue;
    const cur = byPeriod.get(p) ?? { hours: 0, completed: 0 };
    cur.hours += c.hoursCredited;
    cur.completed += 1;
    byPeriod.set(p, cur);
  }
  return Array.from(byPeriod.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([period, v]) => ({ period, label: periodLabel(period), hours: Math.round(v.hours * 100) / 100, completed: v.completed }));
}

/** Completed-hours breakdown by cause/category for the volunteer. */
export async function getVolunteerCauseBreakdown(userId: string): Promise<VolunteerCauseSlice[]> {
  const completed: CompletedMission[] = await getVolunteerAttendanceHistory(userId);
  if (completed.length === 0) return [];

  const supabase = getServerSupabase();
  const { data: missions } = await supabase
    .from("missions")
    .select("id, category_id")
    .in("id", completed.map((c) => c.missionId));
  const catByMission = new Map(((missions ?? []) as { id: string; category_id: string | null }[]).map((m) => [m.id, m.category_id]));

  const catIds = Array.from(new Set(Array.from(catByMission.values()).filter(Boolean) as string[]));
  if (catIds.length === 0) return [];
  const { data: cats } = await supabase
    .from("mission_categories")
    .select("id, name, icon_key, accent_color")
    .in("id", catIds);
  const catInfo = new Map(((cats ?? []) as { id: string; name: string; icon_key: string | null; accent_color: string | null }[]).map((c) => [c.id, c]));

  const agg = new Map<string, { hours: number; completed: number }>();
  for (const c of completed) {
    const catId = catByMission.get(c.missionId);
    if (!catId) continue;
    const cur = agg.get(catId) ?? { hours: 0, completed: 0 };
    cur.hours += c.hoursCredited;
    cur.completed += 1;
    agg.set(catId, cur);
  }

  const totalHours = Array.from(agg.values()).reduce((n, v) => n + v.hours, 0);
  return Array.from(agg.entries())
    .map(([categoryId, v]) => {
      const info = catInfo.get(categoryId);
      return {
        categoryId,
        name: info?.name ?? "Other",
        iconKey: info?.icon_key ?? null,
        accentColor: info?.accent_color ?? null,
        hours: Math.round(v.hours * 100) / 100,
        completed: v.completed,
        pct: totalHours > 0 ? Math.round((v.hours / totalHours) * 100) : 0,
      };
    })
    .sort((a, b) => b.hours - a.hours);
}

/** Pure milestone derivation from an already-loaded impact summary (no DB). */
export function milestonesFromSummary(s: VolunteerImpactSummary): VolunteerMilestone[] {
  const def: Omit<VolunteerMilestone, "achieved">[] = [
    { key: "first_mission", label: "First mission completed", emoji: "🌟", current: s.completedCount, target: 1 },
    { key: "five_missions", label: "5 missions completed", emoji: "🔥", current: s.completedCount, target: 5 },
    { key: "ten_hours", label: "10 volunteer hours", emoji: "⏱️", current: s.totalHours, target: 10 },
    { key: "fifty_hours", label: "50 volunteer hours", emoji: "💪", current: s.totalHours, target: 50 },
    { key: "hundred_hours", label: "100 volunteer hours", emoji: "🏆", current: s.totalHours, target: 100 },
    { key: "three_causes", label: "3 causes supported", emoji: "🌍", current: s.causes.length, target: 3 },
    { key: "certified", label: "Certificate earned", emoji: "🏅", current: s.certificatesCount, target: 1 },
  ];
  return def.map((d) => ({ ...d, achieved: d.current >= d.target }));
}

/** Milestones for a volunteer (loads the impact summary, then derives). */
export async function deriveVolunteerMilestones(userId: string): Promise<VolunteerMilestone[]> {
  return milestonesFromSummary(await getVolunteerImpactSummary(userId));
}
