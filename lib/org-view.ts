/**
 * Org profile view-model — adapts live Supabase data into the fields the
 * /org/[slug] page renders. Live-first by slug; falls back to the existing
 * "GreenRoots" demo when the slug isn't a published/public org (or Supabase is
 * unavailable).
 *
 * DB-backed fields: name, verification badge, type, city, description, and the
 * list of published missions ("active opportunities"). Stats, reviews and the
 * photo gallery have no DB source yet, so the page keeps them as demo content
 * regardless of source — clearly noted at the call site.
 */

import "server-only";
import { iconKeyToEmoji } from "@/lib/categories";
import { getMissionCategories } from "@/lib/data/missions";
import {
  getOrganizationBySlug,
  getOrganizationPublicMissions,
} from "@/lib/data/organizations";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import { publicMediaUrl } from "@/lib/storage/urls";
import { BUCKETS } from "@/lib/storage/storage-paths";
import type { OrganizationSummary, MissionSummary } from "@/types/domain";

export interface OrgOpp {
  title: string;
  meta: string;
  emoji: string;
  art: string;
}

export interface OrgView {
  /** Live org id (for public-impact RPC), or null for the demo org. */
  id: string | null;
  name: string;
  /** Badge text, or null to hide the verified badge. */
  verifiedLabel: string | null;
  /** The line under the org name (icon · type · city …). */
  metaLine: string;
  description: string;
  /** Resolved public URLs, or null → gradient/initial fallback. */
  logoUrl: string | null;
  coverUrl: string | null;
  opps: OrgOpp[];
  source: "live" | "mock";
}

/** The existing demo profile — unchanged behaviour when there's no live org. */
export const MOCK_ORG_VIEW: OrgView = {
  id: null,
  name: "GreenRoots Collective",
  verifiedLabel: "✓ Verified nonprofit",
  metaLine: "🌍 Community gardens & food security · San Francisco · ★ 4.9 (212 reviews)",
  description:
    "We turn vacant lots into thriving community gardens that feed neighborhoods and bring people together. Since 2019 we’ve grown food, friendships and a greener San Francisco — one raised bed at a time. 🌱",
  logoUrl: null,
  coverUrl: null,
  opps: [
    { title: "Community Garden Planting", meta: "📅 Jun 28 · 📍 0.5 mi · Easy", emoji: "🌱", art: "linear-gradient(135deg,#eaf7cf,#c2e58a)" },
    { title: "Compost Workshop", meta: "📅 Jul 5 · 📍 0.5 mi · Medium", emoji: "🌿", art: "linear-gradient(135deg,#eaf7cf,#c2e58a)" },
  ],
  source: "mock",
};

function humanizeType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toOpp(m: MissionSummary, emoji: string, accent: string): OrgOpp {
  const where = m.isVirtual ? "Virtual" : m.city ?? "Nearby";
  const diff = m.difficulty ?? "Easy";
  return {
    title: m.title,
    meta: `📅 ${formatDate(m.startsAt)} · 📍 ${where} · ${diff}`,
    emoji,
    art: `linear-gradient(135deg, ${accent}33, ${accent})`,
  };
}

function toOrgView(org: OrganizationSummary, missions: MissionSummary[], cats: Map<string, { iconKey: string | null; accent: string }>): OrgView {
  const typeLabel = humanizeType(org.type);
  const metaBits = [`🌍 ${typeLabel}`];
  if (org.city) metaBits.push(org.city);

  return {
    id: org.id,
    name: org.name,
    verifiedLabel: org.verificationStatus === "verified" ? `✓ Verified ${typeLabel.toLowerCase()}` : null,
    metaLine: metaBits.join(" · "),
    description: org.description || org.shortDescription || "This organization hasn’t added a description yet.",
    logoUrl: publicMediaUrl(BUCKETS.orgMedia, org.logoPath),
    coverUrl: publicMediaUrl(BUCKETS.orgMedia, org.coverImagePath),
    opps: missions.map((m) => {
      const cat = m.categoryId ? cats.get(m.categoryId) : undefined;
      return toOpp(m, iconKeyToEmoji(cat?.iconKey), cat?.accent || "#8fe3bd");
    }),
    source: "live",
  };
}

export async function loadOrgView(slug: string): Promise<OrgView> {
  if (!hasPublicSupabaseEnv()) return MOCK_ORG_VIEW;
  try {
    const org = await getOrganizationBySlug(slug);
    if (!org) return MOCK_ORG_VIEW;

    const [missions, categories] = await Promise.all([
      getOrganizationPublicMissions(slug),
      getMissionCategories(),
    ]);
    const cats = new Map(
      categories.map((c) => [c.id, { iconKey: c.iconKey, accent: c.accentColor ?? "#8fe3bd" }])
    );
    return toOrgView(org, missions, cats);
  } catch {
    return MOCK_ORG_VIEW;
  }
}
