import type { OrgCategorySlice, OrgImpactSummary, OrgMissionPerformance } from "@/lib/data/analytics/organization";

export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtPct(x: number | null | undefined): string {
  return x == null ? "—" : `${Math.round(x * 100)}%`;
}

export function fmtDateUTC(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function buildMonthlyHours(performance: OrgMissionPerformance[]) {
  const byMonth = new Map<string, number>();
  for (const p of performance) {
    const key = p.startsAt?.slice(0, 7);
    if (!key) continue;
    byMonth.set(key, (byMonth.get(key) ?? 0) + p.hours);
  }
  return Array.from(byMonth.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-12)
    .map(([k, h]) => ({
      period: k,
      label: `${MONTH_SHORT[Number(k.split("-")[1]) - 1]} ${k.slice(2, 4)}`,
      fullLabel: `${MONTH_SHORT[Number(k.split("-")[1]) - 1]} ${k.slice(0, 4)}`,
      hours: Math.round(h * 100) / 100,
    }));
}

export function buildReportInsight(orgName: string, summary: OrgImpactSummary, categories: OrgCategorySlice[]): string | null {
  if (summary.missionsHosted === 0) return null;
  const name = orgName || "Your organization";
  const hours = summary.totalHours.toLocaleString();
  const missions = summary.missionsHosted;
  let text = `${name} has contributed ${hours} verified volunteer hour${summary.totalHours === 1 ? "" : "s"} across ${missions} hosted mission${missions === 1 ? "" : "s"}.`;
  const top = categories[0];
  if (top && top.hours > 0) {
    text += ` ${top.name} generated the strongest impact this period.`;
  }
  if (summary.avgCompletionRate === 1 && summary.completedAttendances > 0) {
    text += " Your organization has a 100% completion rate for confirmed attendances.";
  }
  return text;
}

export function aggregateMissionFunnel(performance: OrgMissionPerformance[]) {
  return performance.reduce(
    (acc, p) => ({
      approved: acc.approved + p.approved,
      checkedIn: acc.checkedIn + p.checkedIn,
      completed: acc.completed + p.completed,
      certified: acc.certified + p.certificates,
    }),
    { approved: 0, checkedIn: 0, completed: 0, certified: 0 },
  );
}

export type MonthlyHoursPoint = {
  period: string;
  label: string;
  fullLabel: string;
  hours: number;
};

/** Insight line for the impact analytics section (real data only). */
export function buildAnalyticsSectionInsight(
  monthly: MonthlyHoursPoint[],
  categories: OrgCategorySlice[],
  totalHours: number,
): string | null {
  if (monthly.length === 0 && categories.length === 0) return null;

  const parts: string[] = [];

  if (totalHours > 0 && categories.length > 0) {
    parts.push(
      `${totalHours.toLocaleString()} verified hour${totalHours === 1 ? "" : "s"} across ${categories.length} cause${categories.length === 1 ? "" : "s"}.`,
    );
  }

  const peak = monthly.length
    ? monthly.reduce((best, m) => (m.hours > best.hours ? m : best), monthly[0])
    : null;
  if (peak && peak.hours > 0) {
    parts.push(`Your strongest impact month was ${peak.fullLabel} with ${peak.hours} confirmed hour${peak.hours === 1 ? "" : "s"}.`);
  }

  const top = categories[0];
  if (top && top.hours > 0) {
    parts.push(`${top.name} generated most of your verified impact this period.`);
  }

  return parts.length ? parts.join(" ") : null;
}
