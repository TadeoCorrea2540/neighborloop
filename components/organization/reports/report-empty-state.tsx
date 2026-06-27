import Link from "next/link";
import Icon from "@/components/icons";

export default function ReportEmptyState() {
  return (
    <div className="rpt-empty">
      <div className="rpt-empty-graphic" aria-hidden="true">
        <Icon name="bar-chart" size={28} />
      </div>
      <h2 className="rpt-empty-title">No impact data yet</h2>
      <p className="rpt-empty-copy">
        Once volunteers complete missions and attendance is confirmed, your report will appear here — hours, completion rates, and certificates.
      </p>
      <Link href="/manage/missions/new" className="rpt-empty-cta">
        + Create a mission
      </Link>
    </div>
  );
}

export function ReportPanelEmpty({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <p className="rpt-empty-inline">
        <strong style={{ color: "var(--ink)", fontWeight: 700 }}>{title}</strong>
        {" — "}
        {copy}
      </p>
    </div>
  );
}
