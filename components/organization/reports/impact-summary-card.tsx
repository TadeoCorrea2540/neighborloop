import type { OrgCategorySlice, OrgImpactSummary } from "@/lib/data/analytics/organization";

export default function ImpactSummaryCard({
  orgName,
  summary,
  topCause,
}: {
  orgName: string | null;
  summary: OrgImpactSummary;
  topCause: OrgCategorySlice | undefined;
}) {
  const name = orgName ?? "Your organization";
  const stats = [
    { id: "hours", value: summary.totalHours.toLocaleString(), label: `verified hour${summary.totalHours === 1 ? "" : "s"}` },
    { id: "missions", value: String(summary.missionsHosted), label: `mission${summary.missionsHosted === 1 ? "" : "s"}` },
    { id: "volunteers", value: String(summary.uniqueVolunteers), label: `volunteer${summary.uniqueVolunteers === 1 ? "" : "s"}` },
    { id: "certs", value: String(summary.certificatesIssued), label: `certificate${summary.certificatesIssued === 1 ? "" : "s"}` },
  ];

  return (
    <article className="rpt-summary-card" aria-label="Impact summary snapshot">
      <div className="rpt-summary-kicker">Impact snapshot</div>
      <h2 className="rpt-summary-title">{name}&rsquo;s community impact</h2>
      <div className="rpt-summary-stats">
        {stats.map((s) => (
          <div key={s.id} className="rpt-summary-stat">
            <span className="rpt-summary-stat-value">{s.value}</span>
            <span className="rpt-summary-stat-label">{s.label}</span>
          </div>
        ))}
        {topCause && topCause.hours > 0 ? (
          <div className="rpt-summary-stat rpt-summary-stat--top-cause">
            <span className="rpt-summary-stat-label">Top cause</span>
            <span className="rpt-summary-stat-value rpt-summary-stat-value--text">{topCause.name}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
