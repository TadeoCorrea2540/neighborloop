/**
 * Category seam — shared by every public surface (Explore, Home, …).
 *
 * This is where live Supabase data feeds the frontend. Server pages load real
 * categories via getMissionCategories(); if Supabase env is missing or the call
 * fails, they fall back to MOCK_CATEGORIES so the page can never break. The
 * shape below is plain/serializable so it can cross the server→client boundary
 * as a prop.
 */

import { CAUSE_EMOJI, type CauseKey } from "@/lib/data";
import type { MissionCategory } from "@/types/domain";

export interface UICategory {
  /** stable chip id — a category slug for live data, lowercased cause for mock */
  key: string;
  label: string;
  emoji: string;
  /** hex used for the active chip — comes straight from the DB for live data */
  accent: string;
  /**
   * Which mock cause this maps to, for filtering the (still mock) mission list.
   * null = a real category that has no mock missions yet → honest empty state.
   */
  causeKey: CauseKey | null;
  /** true when sourced from Supabase (vs. the mock fallback) */
  live: boolean;
}

/** iconKey (from the DB taxonomy) → emoji used on the chip. */
const ICON_EMOJI: Record<string, string> = {
  bowl: "🍲",
  paw: "🐾",
  book: "📚",
  wave: "🌊",
  heart: "❤️",
  sprout: "🌱",
  hands: "🤝",
  box: "📦",
  compass: "🧭",
  pulse: "🩺",
  sparkles: "✨",
  alert: "🚨",
};

/**
 * Live category slug → mock CauseKey. Only categories with matching mock
 * missions map; the rest stay null and render an honest "none yet" state.
 */
const SLUG_TO_CAUSE: Record<string, CauseKey> = {
  "food-support": "Food",
  cleanups: "Cleanup",
  tutoring: "Tutoring",
  "animal-rescue": "Animals",
  "elderly-support": "Elderly",
  environment: "Garden",
};

/** Map a DB iconKey to its chip emoji (✦ when unknown/absent). */
export function iconKeyToEmoji(iconKey: string | null | undefined): string {
  return (iconKey && ICON_EMOJI[iconKey]) || "✦";
}

export function toUICategory(cat: MissionCategory): UICategory {
  return {
    key: cat.slug,
    label: cat.name,
    emoji: (cat.iconKey && ICON_EMOJI[cat.iconKey]) || "✦",
    accent: cat.accentColor || "#ff6f5e",
    causeKey: SLUG_TO_CAUSE[cat.slug] ?? null,
    live: true,
  };
}

/** Fallback used when Supabase is unavailable — derived from the mock causes. */
export const MOCK_CATEGORIES: UICategory[] = (
  Object.keys(CAUSE_EMOJI) as CauseKey[]
)
  .filter((c) => c !== "All")
  .map((c) => ({
    key: c.toLowerCase(),
    label: c,
    emoji: CAUSE_EMOJI[c],
    accent: "#ff6f5e",
    causeKey: c,
    live: false,
  }));

/** The "All" chip, prepended in the UI to both live and mock lists. */
export const ALL_CATEGORY: UICategory = {
  key: "all",
  label: "All",
  emoji: "✦",
  accent: "#18203b",
  causeKey: "All",
  live: false,
};
