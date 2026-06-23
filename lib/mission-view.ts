/**
 * Mission detail view-model — adapts live Supabase data into the exact shapes
 * the /missions/[slug] page already renders (Mission + MissionDetail), so the
 * page's JSX is untouched and works for both mock and live sources.
 *
 * Returns null when there is no published mission for the slug (or Supabase is
 * unavailable / errors), so the page can cleanly fall back to mock data.
 *
 * NOTE: a few presentation fields have no DB column yet (safety notes, the
 * generic "what you'll do" bullets when perks are empty). Those are synthesized
 * here and clearly marked; everything with a real source comes from the row.
 */

import "server-only";
import { causeArt, type Mission, type MissionDetail } from "@/lib/data";
import { publicMediaUrl } from "@/lib/storage/urls";
import { BUCKETS } from "@/lib/storage/storage-paths";
import { iconKeyToEmoji } from "@/lib/categories";
import {
  getMissionBySlug,
  getPublishedMissions,
  getMissionCategories,
} from "@/lib/data/missions";
import { getOrganizationById } from "@/lib/data/organizations";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";
import type { MissionSummary } from "@/types/domain";

// Minimal rpc typing (call client.rpc(...) directly — never detach rpc).
type SpotCountRpc = {
  rpc: (
    fn: "get_mission_spot_counts",
    args: { p_mission_ids: string[] }
  ) => Promise<{ data: { mission_id: string; approved_count: number }[] | null; error: unknown }>;
};

async function approvedCountFor(missionId: string): Promise<number> {
  try {
    const supabase = getServerSupabase() as unknown as SpotCountRpc;
    const { data } = await supabase.rpc("get_mission_spot_counts", { p_mission_ids: [missionId] });
    return data?.[0]?.approved_count ?? 0;
  } catch {
    return 0;
  }
}

export interface MissionView {
  missionId: string;
  mission: Mission;
  detail: MissionDetail;
  recs: Mission[];
  source: "live";
}

interface CatLite {
  name: string;
  iconKey: string | null;
  accent: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Live MissionSummary → the mock-shaped Mission the cards/hero render. */
function toMissionCard(
  s: MissionSummary,
  cats: Map<string, CatLite>,
  orgName: string
): Mission {
  const cat = s.categoryId ? cats.get(s.categoryId) : undefined;
  const accent = cat?.accent || "#ff8a5c";
  return {
    slug: s.slug,
    title: s.title,
    org: orgName,
    // Mission["cause"] is a label here; a live category name is fine to show.
    cause: (cat?.name ?? "Community") as Mission["cause"],
    emoji: iconKeyToEmoji(cat?.iconKey),
    c1: accent,
    c2: accent,
    deep: accent,
    spots: s.volunteerCapacity ?? 0,
    date: formatDate(s.startsAt),
    dist: s.isVirtual ? "Virtual" : s.city ?? "Nearby",
    diff: (s.difficulty ?? "Easy") as Mission["diff"],
  };
}

function toMissionDetail(
  s: MissionSummary,
  mission: Mission,
  orgName: string,
  approvedCount: number
): MissionDetail {
  const capacity = s.volunteerCapacity;
  // Real spots from approved applications. Unlimited capacity → open-ish bar.
  const spotsTotal = capacity != null ? Math.max(capacity, 1) : Math.max(approvedCount + 8, 8);
  const spotsLeft = capacity != null ? Math.max(0, capacity - approvedCount) : spotsTotal - approvedCount;
  return {
    whatYoullDo: s.summary,
    bullets:
      s.perks.length > 0
        ? s.perks
        : [
            "Show up ready to lend a hand",
            "Work as part of a small, supportive team",
            "Leave the community better than you found it",
          ],
    impactGoal: `Help ${orgName} reach more neighbors and make ${mission.cause.toLowerCase()} efforts go further this month.`,
    skills: s.skills.length > 0 ? s.skills : ["Reliable", "Team player", "No experience needed"],
    // No DB column for safety notes yet — generic guidance.
    safety:
      "Please dress for the weather and wear comfortable, closed-toe shoes. Any supplies or training needed are provided on site.",
    coverGrad: (() => {
      const url = publicMediaUrl(BUCKETS.missionMedia, s.coverImagePath);
      return url
        ? `linear-gradient(180deg, rgba(8,12,28,0) 45%, rgba(8,12,28,.4)), url('${url}') center/cover no-repeat`
        : causeArt(mission);
    })(),
    date: mission.date,
    time: formatTime(s.startsAt),
    spotsLeft,
    spotsTotal,
  };
}

export async function loadLiveMissionView(slug: string): Promise<MissionView | null> {
  if (!hasPublicSupabaseEnv()) return null;
  try {
    const summary = await getMissionBySlug(slug);
    if (!summary) return null;

    const [org, categories, published, approved] = await Promise.all([
      getOrganizationById(summary.organizationId),
      getMissionCategories(),
      getPublishedMissions({ limit: 8 }),
      approvedCountFor(summary.id),
    ]);

    const cats = new Map<string, CatLite>(
      categories.map((c) => [c.id, { name: c.name, iconKey: c.iconKey, accent: c.accentColor ?? "#ff8a5c" }])
    );
    const orgName = org?.name ?? "Organization";

    const mission = toMissionCard(summary, cats, orgName);
    const detail = toMissionDetail(summary, mission, orgName, approved);
    // Org names aren't shown on rec cards, so skip per-rec org lookups.
    const recs = published
      .filter((m) => m.slug !== summary.slug)
      .slice(0, 3)
      .map((m) => toMissionCard(m, cats, ""));

    return { missionId: summary.id, mission, detail, recs, source: "live" };
  } catch {
    return null;
  }
}
