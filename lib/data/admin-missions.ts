/**
 * Admin mission moderation reads (server-only, ADMIN-ONLY by RLS).
 * Returns ALL missions across every org (admin can read any). Adds approved /
 * pending application counts and an open-report count per mission.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { MissionStatus, ApplicationStatus } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/admin-missions] ${context}: ${message}`);
}

export interface AdminMissionItem {
  id: string;
  title: string;
  slug: string;
  status: MissionStatus;
  orgId: string;
  orgName: string;
  categoryName: string | null;
  startsAt: string;
  publishedAt: string | null;
  city: string | null;
  isVirtual: boolean;
  volunteerCapacity: number | null;
  approvedCount: number;
  pendingCount: number;
  reportCount: number;
}

type RawMission = {
  id: string;
  title: string;
  slug: string;
  status: MissionStatus;
  organization_id: string;
  starts_at: string;
  published_at: string | null;
  city: string | null;
  is_virtual: boolean;
  volunteer_capacity: number | null;
  organizations: { name: string } | null;
  mission_categories: { name: string } | null;
};

export interface MissionFilters {
  status?: MissionStatus;
  reportedOnly?: boolean;
}

export async function getAdminMissions(filters: MissionFilters = {}): Promise<AdminMissionItem[]> {
  const supabase = getServerSupabase();
  let query = supabase
    .from("missions")
    .select(
      "id, title, slug, status, organization_id, starts_at, published_at, city, is_virtual, volunteer_capacity, organizations(name), mission_categories(name)"
    )
    .order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) fail("getAdminMissions", error.message);
  const rows = (data ?? []) as unknown as RawMission[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [{ data: appRows }, { data: reportRows }] = await Promise.all([
    supabase.from("applications").select("mission_id, status").in("mission_id", ids),
    supabase.from("reports").select("mission_id, status").in("mission_id", ids),
  ]);

  const approved = new Map<string, number>();
  const pending = new Map<string, number>();
  for (const a of (appRows ?? []) as { mission_id: string; status: ApplicationStatus }[]) {
    if (a.status === "approved") approved.set(a.mission_id, (approved.get(a.mission_id) ?? 0) + 1);
    else if (a.status === "pending" || a.status === "waitlisted")
      pending.set(a.mission_id, (pending.get(a.mission_id) ?? 0) + 1);
  }
  const reports = new Map<string, number>();
  for (const r of (reportRows ?? []) as { mission_id: string; status: string }[]) {
    if (r.status === "open" || r.status === "reviewing")
      reports.set(r.mission_id, (reports.get(r.mission_id) ?? 0) + 1);
  }

  const items = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    status: r.status,
    orgId: r.organization_id,
    orgName: r.organizations?.name ?? "Organization",
    categoryName: r.mission_categories?.name ?? null,
    startsAt: r.starts_at,
    publishedAt: r.published_at,
    city: r.city,
    isVirtual: r.is_virtual,
    volunteerCapacity: r.volunteer_capacity,
    approvedCount: approved.get(r.id) ?? 0,
    pendingCount: pending.get(r.id) ?? 0,
    reportCount: reports.get(r.id) ?? 0,
  }));

  return filters.reportedOnly ? items.filter((m) => m.reportCount > 0) : items;
}

/** Minimal owner-agnostic mission lookup for moderation actions. */
export async function getMissionStatusForAdmin(
  missionId: string
): Promise<{ status: MissionStatus; slug: string } | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("missions")
    .select("status, slug")
    .eq("id", missionId)
    .maybeSingle();
  return (data as { status: MissionStatus; slug: string } | null) ?? null;
}
