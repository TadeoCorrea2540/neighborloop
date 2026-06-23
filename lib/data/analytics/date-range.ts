import "server-only";

/**
 * Shared date-range filtering for analytics. All ranges resolve to UTC ISO
 * boundaries (inclusive `from`, exclusive `to`). Each metric family filters on a
 * specific timestamp column — see docs/analytics-definitions.md:
 *   missions → starts_at, applications → applied_at,
 *   attendance/hours → confirmed_at, certificates → issued_at,
 *   reports/audit → created_at.
 */
export type DateRange =
  | "all_time"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "this_year"
  | "custom";

export const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "all_time", label: "All time" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "last_90_days", label: "Last 90 days" },
  { value: "this_year", label: "This year" },
];

export interface ResolvedRange {
  from?: string; // ISO, inclusive lower bound
  to?: string; // ISO, exclusive upper bound
}

export function isDateRange(v: string | null | undefined): v is DateRange {
  return v === "all_time" || v === "last_7_days" || v === "last_30_days" || v === "last_90_days" || v === "this_year" || v === "custom";
}

/** Normalize an unknown query param to a valid DateRange (defaults to all_time). */
export function coerceDateRange(v: string | null | undefined): DateRange {
  return isDateRange(v) ? v : "all_time";
}

export function resolveDateRange(range: DateRange, customFrom?: string, customTo?: string): ResolvedRange {
  const now = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString();
  };
  switch (range) {
    case "all_time":
      return {};
    case "last_7_days":
      return { from: daysAgo(7) };
    case "last_30_days":
      return { from: daysAgo(30) };
    case "last_90_days":
      return { from: daysAgo(90) };
    case "this_year":
      return { from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString() };
    case "custom": {
      // Validate: both optional; if both present, end must be after start.
      const from = customFrom && !Number.isNaN(Date.parse(customFrom)) ? new Date(customFrom).toISOString() : undefined;
      const to = customTo && !Number.isNaN(Date.parse(customTo)) ? new Date(customTo).toISOString() : undefined;
      if (from && to && to <= from) return { from };
      return { from, to };
    }
  }
}

/** True when a timestamp string falls inside the resolved range (JS-side filtering). */
export function inRange(iso: string | null | undefined, r: ResolvedRange): boolean {
  if (!iso) return r.from == null && r.to == null ? true : false;
  if (r.from && iso < r.from) return false;
  if (r.to && iso >= r.to) return false;
  return true;
}

/** A minimal PostgREST-builder shape that supports range filtering. */
interface Rangeable<Q> {
  gte(column: string, value: string): Q;
  lt(column: string, value: string): Q;
}

/** Apply a resolved range to a query builder on the given timestamp column. */
export function applyRange<Q extends Rangeable<Q>>(query: Q, column: string, r: ResolvedRange): Q {
  let q = query;
  if (r.from) q = q.gte(column, r.from);
  if (r.to) q = q.lt(column, r.to);
  return q;
}
