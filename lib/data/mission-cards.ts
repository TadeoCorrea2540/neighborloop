/**
 * Mission card view-model (server-safe). Joins each public mission with its
 * organization name, category emoji/accent, and live "spots left" — plus the
 * viewer's saved/application state when a userId is provided. Fixed query count
 * (no N+1): 1 categories read, 1 org-name `in` read, 1 spot-count RPC, and
 * (optional) 1 saved + 1 application read.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  getPublishedMissions,
  getMissionCategories,
  type MissionFilters,
} from "@/lib/data/missions";
import { getSavedMissionIdsForUser } from "@/lib/data/profiles";
import type { MissionSummary } from "@/types/domain";
import type { ApplicationStatus } from "@/types/database";

export interface MissionCard {
  mission: MissionSummary;
  organizationName: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  categoryIconKey: string | null;
  categoryAccentColor: string | null;
  /** null = unlimited capacity. */
  spotsLeft: number | null;
  isFull: boolean;
  isSaved: boolean;
  applicationStatus: ApplicationStatus | null;
}

// Minimal rpc typing so this compiles before `db:types` regenerates the function.
// IMPORTANT: call `client.rpc(...)` (method on the object) — never detach rpc.
type SpotCountRpc = {
  rpc: (
    fn: "get_mission_spot_counts",
    args: { p_mission_ids: string[] }
  ) => Promise<{ data: { mission_id: string; approved_count: number }[] | null; error: { message: string } | null }>;
};

async function approvedCounts(missionIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (missionIds.length === 0) return map;
  const supabase = getServerSupabase() as unknown as SpotCountRpc;
  const { data, error } = await supabase.rpc("get_mission_spot_counts", { p_mission_ids: missionIds });
  if (error) return map; // counts are best-effort; never break the page
  for (const row of data ?? []) map.set(row.mission_id, row.approved_count);
  return map;
}

export async function getMissionCards(
  missions: MissionSummary[],
  opts?: { userId?: string }
): Promise<MissionCard[]> {
  if (missions.length === 0) return [];
  const supabase = getServerSupabase();

  const missionIds = missions.map((m) => m.id);
  const orgIds = Array.from(new Set(missions.map((m) => m.organizationId)));

  const [categories, orgRes, counts, savedIds, appRows] = await Promise.all([
    getMissionCategories(),
    supabase.from("organizations").select("id, name").in("id", orgIds),
    approvedCounts(missionIds),
    opts?.userId ? getSavedMissionIdsForUser(opts.userId) : Promise.resolve([] as string[]),
    opts?.userId
      ? supabase
          .from("applications")
          .select("mission_id, status")
          .eq("volunteer_id", opts.userId)
          .in("mission_id", missionIds)
      : Promise.resolve({ data: [] as { mission_id: string; status: ApplicationStatus }[], error: null }),
  ]);

  const catById = new Map(categories.map((c) => [c.id, c]));
  const orgName = new Map(
    ((orgRes.data ?? []) as { id: string; name: string }[]).map((o) => [o.id, o.name])
  );
  const savedSet = new Set(savedIds);
  const appStatus = new Map(
    (((appRows as { data: { mission_id: string; status: ApplicationStatus }[] | null }).data) ?? []).map(
      (a) => [a.mission_id, a.status]
    )
  );

  return missions.map((m) => {
    const cat = m.categoryId ? catById.get(m.categoryId) : undefined;
    const capacity = m.volunteerCapacity;
    const spotsLeft = capacity == null ? null : Math.max(0, capacity - (counts.get(m.id) ?? 0));
    return {
      mission: m,
      organizationName: orgName.get(m.organizationId) ?? null,
      categorySlug: cat?.slug ?? null,
      categoryName: cat?.name ?? null,
      categoryIconKey: cat?.iconKey ?? null,
      categoryAccentColor: cat?.accentColor ?? null,
      spotsLeft,
      isFull: spotsLeft === 0,
      isSaved: savedSet.has(m.id),
      applicationStatus: appStatus.get(m.id) ?? null,
    };
  });
}

/** One-call helper for the Explore page: filter → cards → spot-sort. */
export async function getExploreMissionCards(
  filters: MissionFilters,
  opts?: { userId?: string }
): Promise<MissionCard[]> {
  const missions = await getPublishedMissions(filters);
  const cards = await getMissionCards(missions, opts);
  if (filters.sort === "spots") {
    // Unlimited (null) ranks highest, then by most spots left.
    cards.sort((a, b) => (b.spotsLeft ?? Infinity) - (a.spotsLeft ?? Infinity));
  }
  return cards;
}
