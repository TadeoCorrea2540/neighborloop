import Link from "next/link";
import type { VolunteerImpactSummary } from "@/lib/data/volunteer-impact";
import DashboardEmptyState from "./dashboard-empty-state";
import ImpactProgressRing from "./impact-progress-ring";

const MONTHLY_GOAL_HOURS = 30;

export default function ImpactStoryCard({ impact }: { impact: VolunteerImpactSummary }) {
  const goalPct = Math.min(100, Math.round((impact.totalHours / MONTHLY_GOAL_HOURS) * 100));

  return (
    <section className="vol-panel" aria-labelledby="impact-heading">
      <div
        className="vol-impact-header"
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}
      >
        <div>
          <h3 id="impact-heading" style={{ fontWeight: 800, fontSize: 17, margin: 0, letterSpacing: "-.02em" }}>
            Your impact
          </h3>
          <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "4px 0 0" }}>
            Hours, missions, and certificates from confirmed attendance
          </p>
        </div>
        <ImpactProgressRing percent={goalPct} label={`${goalPct}%`} sub={`of ${MONTHLY_GOAL_HOURS}h goal`} />
      </div>

      <div className="vol-impact-metrics">
        <div className="vol-impact-metric">
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--coral-deep)", lineHeight: 1.1 }}>{impact.totalHours}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted-3)", fontWeight: 600 }}>volunteer hours</div>
        </div>
        <div className="vol-impact-metric">
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", lineHeight: 1.1 }}>{impact.completedCount}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted-3)", fontWeight: 600 }}>completed missions</div>
        </div>
        <div className="vol-impact-metric">
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--coral-deep)", lineHeight: 1.1 }}>{impact.certificatesCount}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted-3)", fontWeight: 600 }}>certificates</div>
        </div>
      </div>

      {impact.causes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {impact.causes.slice(0, 4).map((c) => (
            <span key={c} className="vol-cause-pill">
              {c}
            </span>
          ))}
        </div>
      )}

      {impact.recentCompleted.length === 0 ? (
        <DashboardEmptyState
          icon="sparkles"
          title="Your impact story starts here"
          body="Your confirmed hours appear after organizers check you in. Find a cause you care about and start building your volunteer profile."
          ctaLabel="Find a mission"
          ctaHref="/explore"
        />
      ) : (
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted-3)", letterSpacing: ".06em", marginBottom: 8 }}>
            RECENT IMPACT
          </div>
          {impact.recentCompleted.map((m) => (
            <div key={m.attendanceId} className="vol-timeline-row">
              <span className="vol-timeline-dot" aria-hidden />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.missionTitle}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{m.organizationName}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--coral-deep)" }}>{m.hoursCredited}h</span>
              {m.certificateId && (
                <Link href={`/certificates/${m.certificateId}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                  cert
                </Link>
              )}
            </div>
          ))}
          <Link href="/impact" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)", paddingTop: 10, display: "inline-block" }}>
            View full impact →
          </Link>
        </div>
      )}
    </section>
  );
}
