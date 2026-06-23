/**
 * Admin reports reads (server-only, ADMIN-ONLY by RLS).
 *
 * reports.internal_note and reporter identity are admin-only — never surfaced
 * publicly. Each report targets exactly one of mission / organization / user
 * (DB check constraint). Targets and the reporter are resolved with batched
 * profile/entity lookups (the table has several FKs to profiles, so a direct
 * embed would be ambiguous).
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";

function fail(context: string, message: string): never {
  throw new Error(`[data/admin-reports] ${context}: ${message}`);
}

export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ReportTargetType = "mission" | "organization" | "user";

export interface AdminReportItem {
  id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  targetSlug: string | null; // mission/org link target
  reporterName: string | null;
  internalNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

type RawReport = {
  id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  mission_id: string | null;
  organization_id: string | null;
  reported_user_id: string | null;
  reporter_id: string | null;
  internal_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const SELECT =
  "id, reason, details, status, mission_id, organization_id, reported_user_id, reporter_id, internal_note, created_at, reviewed_at";

function targetOf(r: RawReport): { type: ReportTargetType; id: string } {
  if (r.mission_id) return { type: "mission", id: r.mission_id };
  if (r.organization_id) return { type: "organization", id: r.organization_id };
  return { type: "user", id: r.reported_user_id as string };
}

async function resolveTargetsAndReporters(rows: RawReport[]): Promise<AdminReportItem[]> {
  if (rows.length === 0) return [];
  const supabase = getServerSupabase();

  const missionIds = rows.filter((r) => r.mission_id).map((r) => r.mission_id as string);
  const orgIds = rows.filter((r) => r.organization_id).map((r) => r.organization_id as string);
  const userIds = new Set<string>();
  for (const r of rows) {
    if (r.reported_user_id) userIds.add(r.reported_user_id);
    if (r.reporter_id) userIds.add(r.reporter_id);
  }

  const [missionsRes, orgsRes, profilesRes] = await Promise.all([
    missionIds.length
      ? supabase.from("missions").select("id, title, slug").in("id", missionIds)
      : Promise.resolve({ data: [] as { id: string; title: string; slug: string }[] }),
    orgIds.length
      ? supabase.from("organizations").select("id, name, slug").in("id", orgIds)
      : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
    userIds.size
      ? supabase.from("profiles").select("id, display_name").in("id", Array.from(userIds))
      : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
  ]);

  const missions = new Map(((missionsRes.data ?? []) as { id: string; title: string; slug: string }[]).map((m) => [m.id, m]));
  const orgs = new Map(((orgsRes.data ?? []) as { id: string; name: string; slug: string }[]).map((o) => [o.id, o]));
  const profiles = new Map(((profilesRes.data ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p]));

  return rows.map((r) => {
    const t = targetOf(r);
    let targetTitle = "Unknown";
    let targetSlug: string | null = null;
    if (t.type === "mission") {
      const m = missions.get(t.id);
      targetTitle = m?.title ?? "Mission";
      targetSlug = m?.slug ?? null;
    } else if (t.type === "organization") {
      const o = orgs.get(t.id);
      targetTitle = o?.name ?? "Organization";
      targetSlug = o?.slug ?? null;
    } else {
      targetTitle = profiles.get(t.id)?.display_name ?? "User";
    }
    return {
      id: r.id,
      reason: r.reason,
      details: r.details,
      status: r.status,
      targetType: t.type,
      targetId: t.id,
      targetTitle,
      targetSlug,
      reporterName: r.reporter_id ? profiles.get(r.reporter_id)?.display_name ?? null : null,
      internalNote: r.internal_note,
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at,
    };
  });
}

export interface ReportFilters {
  status?: ReportStatus;
  targetType?: ReportTargetType;
}

export async function getAdminReports(filters: ReportFilters = {}): Promise<AdminReportItem[]> {
  const supabase = getServerSupabase();
  let query = supabase.from("reports").select(SELECT).order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.targetType === "mission") query = query.not("mission_id", "is", null);
  if (filters.targetType === "organization") query = query.not("organization_id", "is", null);
  if (filters.targetType === "user") query = query.not("reported_user_id", "is", null);

  const { data, error } = await query;
  if (error) fail("getAdminReports", error.message);
  return resolveTargetsAndReporters((data ?? []) as unknown as RawReport[]);
}

export async function getOpenReportCount(): Promise<number> {
  const supabase = getServerSupabase();
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .in("status", ["open", "reviewing"]);
  return count ?? 0;
}

export async function getReportDetailById(id: string): Promise<AdminReportItem | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("reports").select(SELECT).eq("id", id).maybeSingle();
  if (error) fail("getReportDetailById", error.message);
  if (!data) return null;
  const [item] = await resolveTargetsAndReporters([data as unknown as RawReport]);
  return item ?? null;
}
