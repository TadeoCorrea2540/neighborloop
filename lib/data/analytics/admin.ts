import "server-only";

/**
 * Admin/platform analytics (server-only). Admin RLS (is_admin) grants full read,
 * so these aggregate across the platform. Pages must still gate access with
 * requireRole(["admin"]) / requireAdmin. JS tallies are fine at current scale;
 * promote hot paths to SECURITY DEFINER SQL aggregates if data grows large.
 */
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";
import { resolveDateRange, applyRange, type DateRange } from "./date-range";

export interface AdminImpactAdditions {
  totalHours: number;
  certificatesIssued: number;
  completedAttendances: number;
  uniqueActiveVolunteers: number;
}

export interface OrgLeaderboardRow {
  orgId: string;
  name: string;
  slug: string;
  hours: number;
  completedAttendances: number;
}

export interface MissionLeaderboardRow {
  missionId: string;
  title: string;
  slug: string;
  orgName: string;
  hours: number;
  completedAttendances: number;
}

export interface CategoryParticipationRow {
  categoryId: string;
  name: string;
  iconKey: string | null;
  accentColor: string | null;
  missions: number;
  completedAttendances: number;
  hours: number;
}

export interface AdminModerationSummary {
  openReports: number;
  reviewingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  auditEvents: number;
}

type CompletedAtt = { organization_id: string; mission_id: string; volunteer_id: string; hours_credited: number | null };

async function loadCompletedAttendance(range: DateRange, cf?: string, ct?: string): Promise<CompletedAtt[]> {
  const db = getServerDb();
  const r = resolveDateRange(range, cf, ct);
  const q = applyRange(
    db.from("attendance_records").select("organization_id, mission_id, volunteer_id, hours_credited, confirmed_at").eq("status", "completed"),
    "confirmed_at",
    r,
  );
  const { data } = await q;
  return (data ?? []) as CompletedAtt[];
}

export async function getAdminImpactAdditions(range: DateRange = "all_time", cf?: string, ct?: string): Promise<AdminImpactAdditions> {
  const db = getServerDb();
  const r = resolveDateRange(range, cf, ct);
  const att = await loadCompletedAttendance(range, cf, ct);
  const totalHours = att.reduce((n, a) => n + (a.hours_credited != null ? Number(a.hours_credited) : 0), 0);
  const { count: certCount } = await applyRange(
    db.from("certificates").select("id", { count: "exact", head: true }),
    "issued_at",
    r,
  );
  return {
    totalHours: Math.round(totalHours * 100) / 100,
    certificatesIssued: certCount ?? 0,
    completedAttendances: att.length,
    uniqueActiveVolunteers: new Set(att.map((a) => a.volunteer_id)).size,
  };
}

export async function getTopOrganizationsByHours(range: DateRange = "all_time", limit = 8, cf?: string, ct?: string): Promise<OrgLeaderboardRow[]> {
  const att = await loadCompletedAttendance(range, cf, ct);
  const agg = new Map<string, { hours: number; completed: number }>();
  for (const a of att) {
    const cur = agg.get(a.organization_id) ?? { hours: 0, completed: 0 };
    cur.hours += a.hours_credited != null ? Number(a.hours_credited) : 0;
    cur.completed += 1;
    agg.set(a.organization_id, cur);
  }
  const top = Array.from(agg.entries()).sort((x, y) => y[1].hours - x[1].hours).slice(0, limit);
  if (top.length === 0) return [];
  const supabase = getServerSupabase();
  const { data: orgs } = await supabase.from("organizations").select("id, name, slug").in("id", top.map(([id]) => id));
  const info = new Map(((orgs ?? []) as { id: string; name: string; slug: string }[]).map((o) => [o.id, o]));
  return top.map(([orgId, v]) => ({
    orgId,
    name: info.get(orgId)?.name ?? "Organization",
    slug: info.get(orgId)?.slug ?? "",
    hours: Math.round(v.hours * 100) / 100,
    completedAttendances: v.completed,
  }));
}

export async function getTopMissionsByHours(range: DateRange = "all_time", limit = 8, cf?: string, ct?: string): Promise<MissionLeaderboardRow[]> {
  const att = await loadCompletedAttendance(range, cf, ct);
  const agg = new Map<string, { hours: number; completed: number }>();
  for (const a of att) {
    const cur = agg.get(a.mission_id) ?? { hours: 0, completed: 0 };
    cur.hours += a.hours_credited != null ? Number(a.hours_credited) : 0;
    cur.completed += 1;
    agg.set(a.mission_id, cur);
  }
  const top = Array.from(agg.entries()).sort((x, y) => y[1].hours - x[1].hours).slice(0, limit);
  if (top.length === 0) return [];
  const supabase = getServerSupabase();
  const { data: missions } = await supabase.from("missions").select("id, title, slug, organization_id").in("id", top.map(([id]) => id));
  const mInfo = new Map(((missions ?? []) as { id: string; title: string; slug: string; organization_id: string }[]).map((m) => [m.id, m]));
  const orgIds = Array.from(new Set(Array.from(mInfo.values()).map((m) => m.organization_id)));
  const { data: orgs } = orgIds.length ? await supabase.from("organizations").select("id, name").in("id", orgIds) : { data: [] as { id: string; name: string }[] };
  const orgName = new Map(((orgs ?? []) as { id: string; name: string }[]).map((o) => [o.id, o.name]));
  return top.map(([missionId, v]) => {
    const m = mInfo.get(missionId);
    return {
      missionId,
      title: m?.title ?? "Mission",
      slug: m?.slug ?? "",
      orgName: m ? orgName.get(m.organization_id) ?? "Organization" : "Organization",
      hours: Math.round(v.hours * 100) / 100,
      completedAttendances: v.completed,
    };
  });
}

export async function getCategoryParticipation(range: DateRange = "all_time", cf?: string, ct?: string): Promise<CategoryParticipationRow[]> {
  const att = await loadCompletedAttendance(range, cf, ct);
  if (att.length === 0) return [];
  const supabase = getServerSupabase();
  const missionIds = Array.from(new Set(att.map((a) => a.mission_id)));
  const { data: missions } = await supabase.from("missions").select("id, category_id").in("id", missionIds);
  const catByMission = new Map(((missions ?? []) as { id: string; category_id: string | null }[]).map((m) => [m.id, m.category_id]));

  const agg = new Map<string, { missions: Set<string>; completed: number; hours: number }>();
  for (const a of att) {
    const cat = catByMission.get(a.mission_id);
    if (!cat) continue;
    const cur = agg.get(cat) ?? { missions: new Set<string>(), completed: 0, hours: 0 };
    cur.missions.add(a.mission_id);
    cur.completed += 1;
    cur.hours += a.hours_credited != null ? Number(a.hours_credited) : 0;
    agg.set(cat, cur);
  }
  if (agg.size === 0) return [];
  const { data: cats } = await supabase.from("mission_categories").select("id, name, icon_key, accent_color").in("id", Array.from(agg.keys()));
  const info = new Map(((cats ?? []) as { id: string; name: string; icon_key: string | null; accent_color: string | null }[]).map((c) => [c.id, c]));
  return Array.from(agg.entries())
    .map(([categoryId, v]) => {
      const c = info.get(categoryId);
      return {
        categoryId,
        name: c?.name ?? "Other",
        iconKey: c?.icon_key ?? null,
        accentColor: c?.accent_color ?? null,
        missions: v.missions.size,
        completedAttendances: v.completed,
        hours: Math.round(v.hours * 100) / 100,
      };
    })
    .sort((a2, b2) => b2.hours - a2.hours);
}

export async function getAdminModerationSummary(range: DateRange = "all_time", cf?: string, ct?: string): Promise<AdminModerationSummary> {
  const supabase = getServerSupabase();
  const r = resolveDateRange(range, cf, ct);
  const { data: reportRows } = await applyRange(supabase.from("reports").select("status"), "created_at", r);
  const reports = (reportRows ?? []) as { status: string }[];
  const by = (s: string) => reports.filter((x) => x.status === s).length;
  const { count: auditCount } = await applyRange(
    supabase.from("audit_events").select("id", { count: "exact", head: true }),
    "created_at",
    r,
  );
  return {
    openReports: by("open"),
    reviewingReports: by("reviewing"),
    resolvedReports: by("resolved"),
    dismissedReports: by("dismissed"),
    auditEvents: auditCount ?? 0,
  };
}
