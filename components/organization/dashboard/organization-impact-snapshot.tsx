import Link from "next/link";
import OrganizationDashboardEmptyState from "./organization-dashboard-empty-state";
import type { OrgImpactSummary } from "@/lib/data/analytics/organization";

export default function OrganizationImpactSnapshot({
  impact,
  approvedVolunteers,
  totalApplications,
}: {
  impact: OrgImpactSummary;
  approvedVolunteers: number;
  totalApplications: number;
}) {
  const hasData =
    impact.totalHours > 0 ||
    impact.completedAttendances > 0 ||
    impact.certificatesIssued > 0 ||
    impact.missionsHosted > 0;

  const cells = [
    { label: "Volunteer hours", value: impact.totalHours.toLocaleString(), warm: true },
    { label: "Completed attendances", value: impact.completedAttendances.toLocaleString() },
    { label: "Certificates issued", value: impact.certificatesIssued.toLocaleString(), warm: true },
    {
      label: "Avg completion rate",
      value: impact.avgCompletionRate == null ? "—" : `${Math.round(impact.avgCompletionRate * 100)}%`,
    },
  ];

  return (
    <section className="org-panel" aria-labelledby="impact-heading">
      <div className="org-section-header" style={{ marginBottom: 12 }}>
        <div>
          <h3 id="impact-heading" className="org-section-title">
            Impact snapshot
          </h3>
          <p className="org-section-sub">All-time community impact from your missions</p>
        </div>
        <Link href="/manage/reports" style={{ fontSize: 13, fontWeight: 600, color: "var(--coral-deep)" }}>
          Full report →
        </Link>
      </div>

      {!hasData ? (
        <OrganizationDashboardEmptyState
          icon="sparkles"
          title="Impact grows after your first completed mission"
          body="Hours, certificates, and completion rates appear here once volunteers are checked in and missions wrap up."
          ctaLabel="Create a mission"
          ctaHref="/manage/missions/new"
        />
      ) : (
        <>
          <div className="org-impact-grid">
            {cells.map((c) => (
              <div key={c.label} className="org-impact-cell">
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: c.warm ? "var(--coral-deep)" : "var(--ink)",
                    lineHeight: 1.1,
                  }}
                >
                  {c.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600, marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {impact.causesSupported > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#fff0ec",
                  color: "var(--coral-deep)",
                }}
              >
                {impact.causesSupported} cause{impact.causesSupported === 1 ? "" : "s"} supported
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--bg-chip)",
                  color: "var(--muted-1)",
                }}
              >
                {impact.uniqueVolunteers} unique volunteers
              </span>
            </div>
          )}

          <div className="org-funnel" aria-label="Application funnel">
            {[
              { label: "Applied", value: totalApplications },
              { label: "Approved", value: approvedVolunteers },
              { label: "Completed", value: impact.completedAttendances },
            ].map((step) => (
              <div key={step.label} className="org-funnel-step">
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>{step.value}</div>
                <div style={{ fontSize: 11, color: "var(--muted-3)", fontWeight: 600, marginTop: 2 }}>{step.label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
