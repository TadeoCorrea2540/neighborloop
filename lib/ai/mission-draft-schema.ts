/**
 * Types, validation, and sanitization for the AI Mission Builder.
 *
 * The AI is a *drafting assistant only*. Everything it returns is sanitized here
 * before it ever reaches the UI or the mission form — arrays are coerced to
 * arrays, numbers clamped to sane ranges, the category constrained to one that
 * actually exists, and nothing is auto-saved or auto-published.
 */

/** Matches the mission form's <select> options exactly. */
export type AIDifficulty = "easy" | "moderate" | "challenging";

/** The four guided questions the organizer answers. */
export interface AIMissionAnswers {
  /** Q1 — What is this mission about? */
  purpose: string;
  /** Q2 — Where and when will it happen? */
  whereWhen: string;
  /** Q2b — Exact street address (optional, collected on the where/when step). */
  exactAddress: string;
  /** Q2c — Whether the exact address is public or private. */
  addressVisibility: "private" | "public";
  /** Q3 — What will volunteers do, and what should they bring/know? */
  tasksRequirements: string;
  /** Q4 — How many volunteers, and what impact? */
  volunteersImpact: string;
}

/** Structured, sanitized draft returned to the client. */
export interface AIMissionDraft {
  title: string;
  summary: string;
  description: string;
  categorySlug: string | null;
  difficulty: AIDifficulty | null;
  isBeginnerFriendly: boolean;
  estimatedHours: number | null;
  volunteerCapacity: number | null;
  publicLocationLabel: string | null;
  city: string | null;
  isVirtual: boolean;
  whatYouWillDo: string[];
  requiredSkills: string[];
  materialsNeeded: string[];
  perks: string[];
  safetyNotes: string[];
  impactGoal: string;
  exactAddress: string | null;
  showExactAddressPublicly: boolean;
  privateMeetingInstructions: string | null;
  suggestedStartsAt: string | null;
  suggestedEndsAt: string | null;
  confidenceNotes: string[];
  missingInformation: string[];
}

const DIFFICULTIES: AIDifficulty[] = ["easy", "moderate", "challenging"];

/** Minimum useful answer length per question (characters). */
const MIN_LEN = 12;

/**
 * Pre-flight check before spending a Gemini call. Returns a friendly message if
 * the organizer hasn't given enough to work with, otherwise null.
 */
export function validateAnswers(a: AIMissionAnswers): string | null {
  if (!a || typeof a !== "object") return "Please answer the questions first.";
  const short = (s: string) => !s || s.trim().length < MIN_LEN;
  if (short(a.purpose)) return "Add a little more about what the mission is about.";
  if (short(a.whereWhen)) return "Add where and when the mission will happen (or say it's virtual).";
  if (short(a.tasksRequirements)) return "Add one or two details about what volunteers will do.";
  if (short(a.volunteersImpact)) return "Add how many volunteers you need and the impact you're aiming for.";
  return null;
}

// ---- coercion helpers ----
function str(v: unknown, max = 4000): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}
function nullableStr(v: unknown, max = 600): string | null {
  const s = str(v, max);
  return s ? s : null;
}
function strList(v: unknown, maxItems = 12, maxLen = 200): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => str(x, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}
function boolish(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true" || v === "yes";
  return false;
}
function clampNum(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n * 100) / 100));
}
function isoOrNull(v: unknown): string | null {
  const s = str(v, 40);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Turn whatever Gemini returned into a safe, fully-typed draft. Unknown
 * categories are dropped to null so the organizer is asked to choose; numbers
 * are clamped to reasonable ranges; everything is length-bounded.
 */
export function sanitizeDraft(raw: unknown, allowedCategorySlugs: string[]): AIMissionDraft {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const difficultyRaw = str(o.difficulty, 20).toLowerCase();
  const difficulty = DIFFICULTIES.includes(difficultyRaw as AIDifficulty)
    ? (difficultyRaw as AIDifficulty)
    : difficultyRaw === "hard"
      ? "challenging"
      : null;

  const slug = str(o.categorySlug, 80).toLowerCase();
  const categorySlug = slug && allowedCategorySlugs.includes(slug) ? slug : null;

  return {
    title: str(o.title, 120),
    summary: str(o.summary, 300),
    description: str(o.description, 4000),
    categorySlug,
    difficulty,
    isBeginnerFriendly: boolish(o.isBeginnerFriendly),
    estimatedHours: clampNum(o.estimatedHours, 0.5, 24),
    volunteerCapacity: clampNum(o.volunteerCapacity, 1, 10000),
    publicLocationLabel: nullableStr(o.publicLocationLabel, 160),
    city: nullableStr(o.city, 120),
    isVirtual: boolish(o.isVirtual),
    whatYouWillDo: strList(o.whatYouWillDo),
    requiredSkills: strList(o.requiredSkills),
    materialsNeeded: strList(o.materialsNeeded),
    perks: strList(o.perks),
    safetyNotes: strList(o.safetyNotes),
    impactGoal: str(o.impactGoal, 400),
    exactAddress: nullableStr(o.exactAddress, 240),
    showExactAddressPublicly: boolish(o.showExactAddressPublicly),
    privateMeetingInstructions: nullableStr(o.privateMeetingInstructions, 600),
    suggestedStartsAt: isoOrNull(o.suggestedStartsAt),
    suggestedEndsAt: isoOrNull(o.suggestedEndsAt),
    confidenceNotes: strList(o.confidenceNotes, 6, 240),
    missingInformation: strList(o.missingInformation, 8, 200),
  };
}
