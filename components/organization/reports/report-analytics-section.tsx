import Icon from "@/components/icons";
import MonthlyHoursChart from "@/components/organization/reports/monthly-hours-chart";
import CauseImpactBreakdown from "@/components/organization/reports/cause-impact-breakdown";
import type { OrgCategorySlice } from "@/lib/data/analytics/organization";
import { buildAnalyticsSectionInsight, type MonthlyHoursPoint } from "@/lib/reports/helpers";

export default function ReportAnalyticsSection({
  monthly,
  categories,
  totalHours,
}: {
  monthly: MonthlyHoursPoint[];
  categories: OrgCategorySlice[];
  totalHours: number;
}) {
  const insight = buildAnalyticsSectionInsight(monthly, categories, totalHours);

  return (
    <section className="ras-section" aria-labelledby="ras-heading">
      <header className="ras-header">
        <div className="ras-header-copy">
          <div className="ras-eyebrow">
            <Icon name="bar-chart" size={14} />
            Impact analytics
          </div>
          <h2 id="ras-heading" className="impact-section-title ras-title-reset">
            Contribution rhythm &amp; cause distribution
          </h2>
          <p className="impact-section-sub">
            See how your organization&apos;s volunteer hours are growing across time and causes.
          </p>
        </div>
        {insight ? (
          <div className="ioc-insight ras-section-insight">
            <span className="ioc-insight-icon" aria-hidden="true">
              <Icon name="sparkles" size={14} />
            </span>
            <span>{insight}</span>
          </div>
        ) : null}
      </header>

      <div className="impact-split ras-impact-split">
        <MonthlyHoursChart data={monthly} />
        <CauseImpactBreakdown rows={categories} />
      </div>
    </section>
  );
}
