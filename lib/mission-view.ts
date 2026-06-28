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
import { type Mission, type MissionDetail } from "@/lib/data";
import { getMissionCards, type MissionCard } from "@/lib/data/mission-cards";
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
  recs: MissionCard[];
  source: "live";
  coverImageUrl: string | null;
  categoryName: string | null;
  isBeginnerFriendly: boolean;
  isVirtual: boolean;
  estimatedHours: number | null;
  locationDisplay: string;
  orgVerified: boolean;
  orgSlug: string | null;
  summary: string;
  perks: string[];
  capacityUnlimited: boolean;
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
  categoryName: string | null,
  approvedCount: number,
  coverImageUrl: string | null
): MissionDetail {
  const capacity = s.volunteerCapacity;
  const capacityUnlimited = capacity == null;
  const spotsTotal = capacity != null ? Math.max(capacity, 1) : Math.max(approvedCount + 8, 8);
  const spotsLeft = capacity != null ? Math.max(0, capacity - approvedCount) : spotsTotal - approvedCount;
  return {
    whatYoullDo: s.summary,
    bullets: s.perks,
    impactGoal: categoryName
      ? `Join ${orgName} to support ${categoryName.toLowerCase()} efforts in the community.`
      : `Join ${orgName} to make a meaningful difference in the community.`,
    skills: s.skills,
    safety:
      "Dress for the weather and wear comfortable, closed-toe shoes. Supplies and on-site guidance are provided by the organizer.",
    coverGrad: coverImageUrl
      ? `linear-gradient(180deg, rgba(8,12,28,0) 45%, rgba(8,12,28,.4)), url('${coverImageUrl}') center/cover no-repeat`
      : "",
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
    const coverImageUrl = publicMediaUrl(BUCKETS.missionMedia, summary.coverImagePath);
    const cat = summary.categoryId ? cats.get(summary.categoryId) : undefined;

    const mission = toMissionCard(summary, cats, orgName);
    const detail = toMissionDetail(summary, mission, orgName, cat?.name ?? null, approved, coverImageUrl);
    const recSummaries = published.filter((m) => m.slug !== summary.slug).slice(0, 3);
    const recs = await getMissionCards(recSummaries);

    return {
      missionId: summary.id,
      mission,
      detail,
      recs,
      source: "live",
      coverImageUrl,
      categoryName: cat?.name ?? null,
      isBeginnerFriendly: summary.isBeginnerFriendly,
      isVirtual: summary.isVirtual,
      estimatedHours: summary.estimatedHours,
      locationDisplay: summary.isVirtual
        ? "Virtual"
        : summary.locationLabel || summary.city || "Nearby",
      orgVerified: org?.verificationStatus === "verified",
      orgSlug: org?.slug ?? null,
      summary: summary.summary,
      perks: summary.perks,
      capacityUnlimited: summary.volunteerCapacity == null,
    };
  } catch {
    return null;
  }
}
