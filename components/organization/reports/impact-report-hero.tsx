import Link from "next/link";
import Icon from "@/components/icons";
import ReportDateFilters from "@/components/organization/reports/report-date-filters";
import type { DateRange } from "@/lib/data/analytics/date-range";

export default function ImpactReportHero({
  orgName,
  rangeLabel,
  range,
}: {
  orgName: string | null;
  rangeLabel: string;
  range: DateRange;
}) {
  const displayName = orgName ?? "Your organization";

  return (
    <header className="rpt-hero">
      <div className="rpt-hero-top">
        <div className="rpt-hero-copy">
          <div className="rpt-eyebrow">
            <span className="rpt-live-dot" aria-hidden="true" />
            Live data
          </div>
          <h1 className="rpt-title">
            <span className="rpt-title-line">Impact report</span>
            {orgName ? (
              <span className="rpt-title-org">
                <span className="rpt-title-accent">{displayName}</span>
                <span className="rpt-title-range" aria-hidden="true">
                  {" "}
                  · {rangeLabel}
                </span>
              </span>
            ) : (
              <span className="rpt-title-org rpt-title-range-only">{rangeLabel}</span>
            )}
          </h1>
          <p className="rpt-subtitle">
            <span className="rpt-subtitle-desktop">{rangeLabel} · </span>
            Real attendance, volunteer hours, and community outcomes.
          </p>
          <p className="rpt-confidence rpt-confidence--inline">
            <Icon name="shield-check" size={14} />
            Based on confirmed attendance records
          </p>
        </div>
        <div className="rpt-hero-actions rpt-hide-mobile">
          <Link href={`/reports/print?range=${range}`} className="rpt-hero-print">
            <Icon name="clipboard" size={16} />
            Print / save as PDF
          </Link>
        </div>
      </div>
      <div className="rpt-hero-foot">
        <ReportDateFilters value={range} />
        <div className="rpt-confidence rpt-hide-mobile">
          <Icon name="shield-check" size={14} />
          Based on confirmed attendance records
        </div>
      </div>
    </header>
  );
}
