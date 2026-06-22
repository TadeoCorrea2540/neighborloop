import { CauseKey, MISSIONS, Mission } from "@/lib/data";
import { iconKeyToEmoji } from "@/lib/categories";
import type { MissionCard } from "@/lib/data/mission-cards";

// Best-effort map from the real 12-category taxonomy onto the mock CauseKeys the
// mobile UI's filters/badges use. Cosmetic; real category names show on cards.
const SLUG_TO_CAUSE: Record<string, Exclude<CauseKey, "All">> = {
  "food-support": "Food",
  "donation-drives": "Food",
  "emergency-support": "Food",
  cleanups: "Cleanup",
  environment: "Garden",
  tutoring: "Tutoring",
  "youth-mentorship": "Tutoring",
  "cultural-events": "Tutoring",
  "animal-rescue": "Animals",
  "elderly-support": "Elderly",
  "community-care": "Elderly",
  "health-awareness": "Elderly",
};

/** Adapt a real MissionCard to the mock Mission shape the mobile UI renders. */
export function cardToMission(card: MissionCard): Mission {
  const m = card.mission;
  const accent = card.categoryAccentColor || "#ff8a5c";
  const cause = (card.categorySlug && SLUG_TO_CAUSE[card.categorySlug]) || "Food";
  const d = new Date(m.startsAt);
  const date = Number.isNaN(d.getTime())
    ? "Date TBA"
    : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return {
    slug: m.slug,
    title: m.title,
    org: card.organizationName || "Organization",
    cause,
    emoji: iconKeyToEmoji(card.categoryIconKey),
    c1: accent,
    c2: accent,
    deep: accent,
    spots: card.spotsLeft ?? m.volunteerCapacity ?? 8,
    date,
    dist: m.isVirtual ? "Virtual" : m.locationLabel || m.city || "Nearby",
    diff: (m.difficulty as Mission["diff"]) || "Easy",
  };
}

export const EXPLORE_NEARBY_COUNT = 48;

export const SEARCH_SUGGESTIONS = [
  "Animal rescue",
  "This weekend",
  "Tutoring",
  "Food support",
] as const;

export const QUICK_FILTERS = [
  { id: "near-me", label: "Near me" },
  { id: "weekend", label: "This weekend" },
  { id: "under-2-hours", label: "Under 2 hours" },
  { id: "beginner-friendly", label: "Beginner-friendly" },
  { id: "with-friends", label: "With friends" },
  { id: "certificates", label: "Certificates" },
  { id: "free-today", label: "Free today" },
] as const;

export type QuickFilterId = (typeof QUICK_FILTERS)[number]["id"];

export type AdvancedFilters = {
  causes: Exclude<CauseKey, "All">[];
  when: "today" | "week" | "month" | null;
  distance: number;
  difficulty: Mission["diff"] | null;
  ageRequirement: "none" | "13+" | "18+" | null;
  perks: boolean;
  accessibility: boolean;
};

export const DEFAULT_ADVANCED: AdvancedFilters = {
  causes: [],
  when: null,
  distance: 10,
  difficulty: null,
  ageRequirement: null,
  perks: false,
  accessibility: false,
};

export const ADVANCED_CAUSES: Exclude<CauseKey, "All">[] = [
  "Food",
  "Cleanup",
  "Tutoring",
  "Animals",
  "Elderly",
  "Garden",
];

export function parseDistanceMi(dist: string): number {
  return parseFloat(dist.replace(/[^\d.]/g, "")) || 99;
}

export function filterExploreMissions(
  search: string,
  quick: QuickFilterId[],
  advanced: AdvancedFilters,
  causeChip: CauseKey,
  source?: Mission[],
  geo: boolean = true
): Mission[] {
  let list = source ? [...source] : [...MISSIONS];

  if (causeChip !== "All") {
    list = list.filter((m) => m.cause === causeChip);
  }

  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.org.toLowerCase().includes(q) ||
        m.cause.toLowerCase().includes(q) ||
        m.date.toLowerCase().includes(q)
    );
  }

  if (geo && quick.includes("near-me")) {
    list = list.filter((m) => parseDistanceMi(m.dist) <= 2.5);
  }
  if (quick.includes("weekend")) {
    list = list.filter((m) => /sat|sun/i.test(m.date));
  }
  if (quick.includes("under-2-hours")) {
    list = list.filter((m) => m.diff !== "Hard");
  }
  if (quick.includes("beginner-friendly")) {
    list = list.filter((m) => m.diff === "Easy");
  }
  if (quick.includes("with-friends")) {
    list = list.filter((m) => m.spots >= 4);
  }
  if (quick.includes("certificates")) {
    list = list.filter((m) =>
      ["Tutoring", "Cleanup", "Food", "Garden"].includes(m.cause)
    );
  }
  if (quick.includes("free-today")) {
    list = list.filter((m) => m.diff === "Easy" && parseDistanceMi(m.dist) <= 4);
  }

  if (advanced.causes.length) {
    list = list.filter((m) => advanced.causes.includes(m.cause));
  }
  if (advanced.when === "week") {
    list = list.filter((m) => /jun/i.test(m.date));
  }
  if (advanced.when === "month") {
    list = list;
  }
  if (advanced.when === "today") {
    list = list.slice(0, Math.max(2, Math.ceil(list.length / 3)));
  }
  if (advanced.difficulty) {
    list = list.filter((m) => m.diff === advanced.difficulty);
  }
  if (advanced.perks) {
    list = list.filter((m) => ["Tutoring", "Food", "Garden"].includes(m.cause));
  }
  if (advanced.accessibility) {
    list = list.filter((m) => m.diff === "Easy");
  }

  if (geo) {
    list = list.filter((m) => parseDistanceMi(m.dist) <= advanced.distance);
  }

  return list;
}

export function countActiveFilters(
  quick: QuickFilterId[],
  advanced: AdvancedFilters
): number {
  let n = quick.length;
  if (advanced.causes.length) n += 1;
  if (advanced.when) n += 1;
  if (advanced.difficulty) n += 1;
  if (advanced.ageRequirement) n += 1;
  if (advanced.distance < 10) n += 1;
  if (advanced.perks) n += 1;
  if (advanced.accessibility) n += 1;
  return n;
}

export function missionFitLabel(m: Mission, index: number): string | null {
  if (m.diff === "Easy" && index % 2 === 0) return "Good for first-time volunteers";
  if (/sat|sun/i.test(m.date)) return "Fits your weekend availability";
  if (m.cause === "Tutoring") return "Certificate available";
  if (index % 3 === 1) return "2 friends saved similar missions";
  return null;
}

export function mockMatchScore(m: Mission, index: number): number {
  let score = 94 - (index % 4) * 3;
  if (m.diff === "Easy") score += 2;
  if (parseDistanceMi(m.dist) <= 1.5) score += 2;
  if (m.diff === "Hard") score -= 10;
  return Math.min(97, Math.max(72, score));
}

export function featuredMatchReason(m: Mission): string {
  if (/sat|sun/i.test(m.date)) return "Fits your weekend availability";
  if (m.diff === "Easy") return "Good for first-time volunteers";
  return "Popular near you";
}
