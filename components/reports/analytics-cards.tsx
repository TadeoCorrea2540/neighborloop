/**
 * Presentational analytics building blocks (server-renderable).
 * Reused by the print report and legacy imports. Polished UI lives in
 * components/organization/reports/* — this module re-exports helpers and
 * print-friendly wrappers.
 */
export { fmtPct, fmtDateUTC } from "@/lib/reports/helpers";
export { default as ImpactStatGrid } from "@/components/organization/reports/report-metric-grid";
export { default as MonthlyHoursChart } from "@/components/organization/reports/monthly-hours-chart";
export { default as CategoryBreakdown } from "@/components/organization/reports/cause-impact-breakdown";
export { default as MissionPerformanceTable } from "@/components/organization/reports/mission-performance-section";

import type { OrgMissionPerformance, OrgVolunteerEngagement } from "@/lib/data/analytics/organization";
import VolunteerEngagementPanel from "@/components/organization/reports/volunteer-engagement-panel";

/** Print / legacy wrapper — accepts engagement-only or full report context. */
export function EngagementCard({
  engagement,
  performance = [],
  completedAttendances = 0,
  certificatesIssued = 0,
  avgCompletionRate = null,
}: {
  engagement: OrgVolunteerEngagement;
  performance?: OrgMissionPerformance[];
  completedAttendances?: number;
  certificatesIssued?: number;
  avgCompletionRate?: number | null;
}) {
  return (
    <VolunteerEngagementPanel
      engagement={engagement}
      performance={performance}
      completedAttendances={completedAttendances}
      certificatesIssued={certificatesIssued}
      avgCompletionRate={avgCompletionRate}
    />
  );
}

// Legacy inline StatCard — kept for any external imports
export function StatCard({ label, value, accent, sub }: { label: string; value: string | number; accent: string; sub?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid rgba(24,32,59,.06)" }}>
      <div style={{ fontSize: 13, color: "var(--muted-3)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: accent }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted-3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
