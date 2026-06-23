import "server-only";

/**
 * Organization analytics (server-only, RLS-scoped to the org via is_org_member).
 * Callers MUST pass an orgId they're authorized for (resolved by requireOrganizer
 * → guard.orgId); never a client-supplied id. Date range filters on missions
 * (starts_at); attendance/certificates are scoped to those missions by membership
 * — see docs/analytics-definitions.md.
 */
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
import { resolveDateRange, applyRange, type DateRange } from "./date-range";
import type { MissionStatus } from "@/types/database";

const ACTIVE_STATUSES: MissionStatus[] = ["published", "paused", "closed", "archived", "cancelled"];

export interface OrgMissionPerformance {
  missionId: string;
  title: string;
  slug: string;
  status: MissionStatus;
  startsAt: string;
  categoryId: string | null;
  capacity: number | null;
  approved: number;
  checkedIn: number;
  completed: number;
  noShow: number;
  hours: number;
  certificates: number;
  fillRate: number | null; // completed / capacity, 0–1
  noShowRate: number | null; // noShow / (completed + noShow), 0–1
}

export interface OrgImpactSummary {
  missionsHosted: number;
  totalHours: number;
  certificatesIssued: number;
  uniqueVolunteers: number;
  completedAttendances: number;
  noShowCount: number;
  causesSupported: number;
  avgCompletionRate: number | null; // mean of per-mission (completed/(completed+noShow))
}

export interface OrgVolunteerEngagement {
  uniqueVolunteers: number;
  returningVolunteers: number; // completed ≥2 distinct missions for this org
  returningRate: number | null; // returning / unique, 0–1
  avgHoursPerVolunteer: number | null;
  noShowCount: number;
}

export interface OrgCategorySlice {
  categoryId: string;
  name: string;
  iconKey: string | null;
  accentColor: string | null;
  missions: number;
  completed: number;
  hours: number;
  pct: number; // share of total org hours, 0–100
}

export interface OrganizationReport {
  summary: OrgImpactSummary;
  performance: OrgMissionPerformance[];
  engagement: OrgVolunteerEngagement;
  categories: OrgCategorySlice[];
}

type MissionRow = { id: string; title: string; slug: string; status: MissionStatus; starts_at: string; volunteer_capacity: number | null; category_id: string | null };

interface OrgActivity {
  performance: OrgMissionPerformance[];
  completedPairs: { volunteerId: string; missionId: string }[];
  hoursByVolunteer: Map<string, number>;
  missionsById: Map<string, MissionRow>;
}

/** One trip to the DB; every org metric derives from this. */
async function loadOrgActivity(orgId: string, range: DateRange, cf?: string, ct?: string): Promise<OrgActivity> {
  const supabase = getServerSupabase();
  const r = resolveDateRange(range, cf, ct);

  const missionsQuery = applyRange(
    supabase
      .from("missions")
      .select("id, title, slug, status, starts_at, volunteer_capacity, category_id")
      .eq("organization_id", orgId)
      .in("status", ACTIVE_STATUSES),
    "starts_at",
    r,
  ).order("starts_at", { ascending: false });
  const { data: missionsData } = await missionsQuery;
  const missions = (missionsData ?? []) as MissionRow[];
  const missionsById = new Map(missions.map((m) => [m.id, m]));

  if (missions.length === 0) {
    return { performance: [], completedPairs: [], hoursByVolunteer: new Map(), missionsById };
  }

  const ids = missions.map((m) => m.id);
  const db = getServerDb();
  const [{ data: appData }, { data: attData }, { data: certData }] = await Promise.all([
    supabase.from("applications").select("mission_id, status").in("mission_id", ids),
    db.from("attendance_records").select("mission_id, volunteer_id, status, hours_credited").in("mission_id", ids),
    db.from("certificates").select("mission_id").in("mission_id", ids),
  ]);

  const approved = new Map<string, number>();
  for (const a of (appData ?? []) as { mission_id: string; status: string }[]) {
    if (a.status === "approved") approved.set(a.mission_id, (approved.get(a.mission_id) ?? 0) + 1);
  }

  const checkedIn = new Map<string, number>();
  const completed = new Map<string, number>();
  const noShow = new Map<string, number>();
  const hours = new Map<string, number>();
  const completedPairs: { volunteerId: string; missionId: string }[] = [];
  const hoursByVolunteer = new Map<string, number>();
  for (const a of (attData ?? []) as { mission_id: string; volunteer_id: string; status: string; hours_credited: number | null }[]) {
    if (a.status === "checked_in" || a.status === "checked_out") {
      checkedIn.set(a.mission_id, (checkedIn.get(a.mission_id) ?? 0) + 1);
    } else if (a.status === "completed") {
      completed.set(a.mission_id, (completed.get(a.mission_id) ?? 0) + 1);
      const h = a.hours_credited != null ? Number(a.hours_credited) : 0;
      hours.set(a.mission_id, (hours.get(a.mission_id) ?? 0) + h);
      completedPairs.push({ volunteerId: a.volunteer_id, missionId: a.mission_id });
      hoursByVolunteer.set(a.volunteer_id, (hoursByVolunteer.get(a.volunteer_id) ?? 0) + h);
    } else if (a.status === "no_show") {
      noShow.set(a.mission_id, (noShow.get(a.mission_id) ?? 0) + 1);
    }
  }

  const certs = new Map<string, number>();
  for (const c of (certData ?? []) as { mission_id: string }[]) {
    certs.set(c.mission_id, (certs.get(c.mission_id) ?? 0) + 1);
  }

  const performance: OrgMissionPerformance[] = missions.map((m) => {
    const comp = completed.get(m.id) ?? 0;
    const ns = noShow.get(m.id) ?? 0;
    const cap = m.volunteer_capacity;
    return {
      missionId: m.id,
      title: m.title,
      slug: m.slug,
      status: m.status,
      startsAt: m.starts_at,
      categoryId: m.category_id,
      capacity: cap,
      approved: approved.get(m.id) ?? 0,
      checkedIn: checkedIn.get(m.id) ?? 0,
      completed: comp,
      noShow: ns,
      hours: Math.round((hours.get(m.id) ?? 0) * 100) / 100,
      certificates: certs.get(m.id) ?? 0,
      fillRate: cap && cap > 0 ? Math.min(1, comp / cap) : null,
      noShowRate: comp + ns > 0 ? ns / (comp + ns) : null,
    };
  });

  return { performance, completedPairs, hoursByVolunteer, missionsById };
}

function summarize(a: OrgActivity): OrgImpactSummary {
  const totalHours = a.performance.reduce((n, p) => n + p.hours, 0);
  const completedAttendances = a.performance.reduce((n, p) => n + p.completed, 0);
  const noShowCount = a.performance.reduce((n, p) => n + p.noShow, 0);
  const certificatesIssued = a.performance.reduce((n, p) => n + p.certificates, 0);
  const uniqueVolunteers = new Set(a.completedPairs.map((c) => c.volunteerId)).size;
  const causeIds = new Set<string>();
  for (const pair of a.completedPairs) {
    const cat = a.missionsById.get(pair.missionId)?.category_id;
    if (cat) causeIds.add(cat);
  }
  const ratesWithData = a.performance.filter((p) => p.noShowRate != null);
  const avgCompletionRate = ratesWithData.length
    ? ratesWithData.reduce((n, p) => n + (1 - (p.noShowRate as number)), 0) / ratesWithData.length
    : null;
  return {
    missionsHosted: a.performance.length,
    totalHours: Math.round(totalHours * 100) / 100,
    certificatesIssued,
    uniqueVolunteers,
    completedAttendances,
    noShowCount,
    causesSupported: causeIds.size,
    avgCompletionRate,
  };
}

function engagement(a: OrgActivity): OrgVolunteerEngagement {
  const missionsByVolunteer = new Map<string, Set<string>>();
  for (const pair of a.completedPairs) {
    const set = missionsByVolunteer.get(pair.volunteerId) ?? new Set<string>();
    set.add(pair.missionId);
    missionsByVolunteer.set(pair.volunteerId, set);
  }
  const uniqueVolunteers = missionsByVolunteer.size;
  let returning = 0;
  for (const set of Array.from(missionsByVolunteer.values())) if (set.size >= 2) returning += 1;
  const totalHours = a.performance.reduce((n, p) => n + p.hours, 0);
  return {
    uniqueVolunteers,
    returningVolunteers: returning,
    returningRate: uniqueVolunteers > 0 ? returning / uniqueVolunteers : null,
    avgHoursPerVolunteer: uniqueVolunteers > 0 ? Math.round((totalHours / uniqueVolunteers) * 100) / 100 : null,
    noShowCount: a.performance.reduce((n, p) => n + p.noShow, 0),
  };
}

async function categoriesOf(a: OrgActivity): Promise<OrgCategorySlice[]> {
  const agg = new Map<string, { missions: number; completed: number; hours: number }>();
  for (const p of a.performance) {
    if (!p.categoryId) continue;
    const cur = agg.get(p.categoryId) ?? { missions: 0, completed: 0, hours: 0 };
    cur.missions += 1;
    cur.completed += p.completed;
    cur.hours += p.hours;
    agg.set(p.categoryId, cur);
  }
  if (agg.size === 0) return [];
  const supabase = getServerSupabase();
  const { data: cats } = await supabase
    .from("mission_categories")
    .select("id, name, icon_key, accent_color")
    .in("id", Array.from(agg.keys()));
  const info = new Map(((cats ?? []) as { id: string; name: string; icon_key: string | null; accent_color: string | null }[]).map((c) => [c.id, c]));
  const totalHours = Array.from(agg.values()).reduce((n, v) => n + v.hours, 0);
  return Array.from(agg.entries())
    .map(([categoryId, v]) => {
      const c = info.get(categoryId);
      return {
        categoryId,
        name: c?.name ?? "Other",
        iconKey: c?.icon_key ?? null,
        accentColor: c?.accent_color ?? null,
        missions: v.missions,
        completed: v.completed,
        hours: Math.round(v.hours * 100) / 100,
        pct: totalHours > 0 ? Math.round((v.hours / totalHours) * 100) : 0,
      };
    })
    .sort((a2, b2) => b2.hours - a2.hours);
}

export async function getOrganizationImpactSummary(orgId: string, range: DateRange = "all_time", cf?: string, ct?: string): Promise<OrgImpactSummary> {
  return summarize(await loadOrgActivity(orgId, range, cf, ct));
}

export async function getOrganizationMissionPerformance(orgId: string, range: DateRange = "all_time", cf?: string, ct?: string): Promise<OrgMissionPerformance[]> {
  return (await loadOrgActivity(orgId, range, cf, ct)).performance;
}

export async function getOrganizationVolunteerEngagement(orgId: string, range: DateRange = "all_time", cf?: string, ct?: string): Promise<OrgVolunteerEngagement> {
  return engagement(await loadOrgActivity(orgId, range, cf, ct));
}

export async function getOrganizationCategoryBreakdown(orgId: string, range: DateRange = "all_time", cf?: string, ct?: string): Promise<OrgCategorySlice[]> {
  return categoriesOf(await loadOrgActivity(orgId, range, cf, ct));
}

export interface OrgVolunteerHoursRow {
  volunteerId: string;
  displayName: string;
  completedMissions: number;
  hours: number;
}

/** Per-volunteer completed hours for this org (org-member RLS already exposes the roster). */
export async function getOrganizationVolunteerHours(orgId: string, range: DateRange = "all_time", cf?: string, ct?: string): Promise<OrgVolunteerHoursRow[]> {
  const activity = await loadOrgActivity(orgId, range, cf, ct);
  const completedByVol = new Map<string, number>();
  for (const p of activity.completedPairs) completedByVol.set(p.volunteerId, (completedByVol.get(p.volunteerId) ?? 0) + 1);
  const volIds = Array.from(completedByVol.keys());
  if (volIds.length === 0) return [];
  const supabase = getServerSupabase();
  const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", volIds);
  const nameById = new Map(((profs ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p.display_name]));
  return volIds
    .map((id) => ({
      volunteerId: id,
      displayName: nameById.get(id) ?? "Volunteer",
      completedMissions: completedByVol.get(id) ?? 0,
      hours: Math.round((activity.hoursByVolunteer.get(id) ?? 0) * 100) / 100,
    }))
    .sort((a, b) => b.hours - a.hours);
}

/** Everything for the reports page in a single DB load. */
export async function getOrganizationReport(orgId: string, range: DateRange = "all_time", cf?: string, ct?: string): Promise<OrganizationReport> {
  const activity = await loadOrgActivity(orgId, range, cf, ct);
  return {
    summary: summarize(activity),
    performance: activity.performance,
    engagement: engagement(activity),
    categories: await categoriesOf(activity),
  };
}
