import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getPrimaryOrganizationForUser } from "@/lib/data/organization-membership";
import { getOrganizationReport } from "@/lib/data/analytics/organization";
import { coerceDateRange, DATE_RANGES } from "@/lib/data/analytics/date-range";
import ImpactReportHero from "@/components/organization/reports/impact-report-hero";
import ExportCenter from "@/components/organization/reports/export-center";
import ReportMetricGrid from "@/components/organization/reports/report-metric-grid";
import ImpactSummaryCard from "@/components/organization/reports/impact-summary-card";
import ReportInsight from "@/components/organization/reports/report-insight";
import ReportEmptyState from "@/components/organization/reports/report-empty-state";
import ReportAnalyticsSection from "@/components/organization/reports/report-analytics-section";
import MissionPerformanceSection from "@/components/organization/reports/mission-performance-section";
import VolunteerEngagementPanel from "@/components/organization/reports/volunteer-engagement-panel";
import { buildMonthlyHours, buildReportInsight } from "@/lib/reports/helpers";

export const dynamic = "force-dynamic";

export default async function Reports({ searchParams }: { searchParams: { range?: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect(guard.code === "auth" ? "/auth?next=/manage/reports" : "/dashboard");
  }

  const range = coerceDateRange(searchParams.range);
  const [org, report] = await Promise.all([
    getPrimaryOrganizationForUser(guard.userId),
    getOrganizationReport(guard.orgId, range),
  ]);
  const rangeLabel = DATE_RANGES.find((r) => r.value === range)?.label ?? "All time";
  const monthly = buildMonthlyHours(report.performance);
  const insight = buildReportInsight(org?.name ?? "", report.summary, report.categories);
  const empty = report.summary.missionsHosted === 0;

  return (
    <div className="rpt-page">
      <ImpactReportHero orgName={org?.name ?? null} rangeLabel={rangeLabel} range={range} />

      {empty ? (
        <ReportEmptyState />
      ) : (
        <div className="rpt-stagger rpt-mobile-stack">
          <ExportCenter range={range} />
          {insight ? <ReportInsight text={insight} /> : null}
          <ImpactSummaryCard orgName={org?.name ?? null} summary={report.summary} topCause={report.categories[0]} />
          <ReportMetricGrid summary={report.summary} />

          <ReportAnalyticsSection
            monthly={monthly}
            categories={report.categories}
            totalHours={report.summary.totalHours}
          />

          <div className="rpt-split rpt-split--wide rpt-mobile-performance">
            <MissionPerformanceSection rows={report.performance} />
            <VolunteerEngagementPanel
              engagement={report.engagement}
              performance={report.performance}
              completedAttendances={report.summary.completedAttendances}
              certificatesIssued={report.summary.certificatesIssued}
              avgCompletionRate={report.summary.avgCompletionRate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
