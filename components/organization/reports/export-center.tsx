import Link from "next/link";
import Icon from "@/components/icons";
import type { DateRange } from "@/lib/data/analytics/date-range";

const EXPORTS = [
  ["mission-performance", "Mission", "Mission performance"],
  ["attendance-summary", "Attendance", "Attendance"],
  ["volunteer-hours", "Hours", "Volunteer hours"],
  ["certificates-issued", "Certs", "Certificates"],
] as const;

export default function ExportCenter({ range }: { range: DateRange }) {
  return (
    <section className="rpt-export" aria-label="Report tools">
      <div className="rpt-export-label">
        <Icon name="bar-chart" size={15} />
        Report tools
      </div>
      <div className="rpt-export-pills" role="list" aria-label="CSV exports">
        {EXPORTS.map(([type, short, label]) => (
          <a
            key={type}
            href={`/api/manage/reports/export?type=${type}&range=${range}`}
            className="rpt-export-pill"
            download
            role="listitem"
            aria-label={`Download ${label} CSV`}
          >
            <Icon name="inbox" size={14} />
            <span className="rpt-export-pill-short">{short}</span>
            <span className="rpt-export-pill-full">{label}.csv</span>
          </a>
        ))}
      </div>
      <div className="rpt-export-print">
        <Link href={`/reports/print?range=${range}`} className="rpt-hero-print">
          <Icon name="clipboard" size={16} />
          Print / save as PDF
        </Link>
      </div>
    </section>
  );
}
