import Link from "next/link";
import Icon from "@/components/icons";
import { fmtDate } from "@/components/admin/badges";
import type { CompletedMission } from "@/lib/data/volunteer-impact";
import ImpactEmptyState from "./impact-empty-state";

export default function ImpactTimeline({ missions }: { missions: CompletedMission[] }) {
  return (
    <section style={{ marginBottom: 22 }} aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="impact-section-title">
        Impact timeline
      </h2>
      <p className="impact-section-sub">Your completed missions and certificates</p>

      {missions.length === 0 ? (
        <ImpactEmptyState
          icon="sparkles"
          title="Your timeline starts here"
          body="Join a cause, show up, and your completed missions will appear as a personal record of impact."
          ctaLabel="Find a mission"
          ctaHref="/explore"
        />
      ) : (
        <div className="impact-chart-panel" style={{ padding: "8px 18px" }}>
          {missions.map((m, i) => (
            <article key={m.attendanceId} className="impact-timeline-item">
              <div className="impact-timeline-rail" aria-hidden>
                <span className="impact-timeline-dot" />
                {i < missions.length - 1 && <span className="impact-timeline-line" />}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.3 }}>{m.missionTitle}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginTop: 3 }}>
                  {m.organizationName}
                  {m.startsAt ? ` · ${fmtDate(m.startsAt)}` : ""}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--coral-deep)" }}>
                    {m.hoursCredited}h credited
                  </span>
                  {m.certificateId ? (
                    <Link
                      href={`/certificates/${m.certificateId}`}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: "#dff6ea",
                        color: "#147a57",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Icon name="award" size={12} />
                      Certificate earned
                    </Link>
                  ) : (
                    <span style={{ fontSize: 11.5, color: "var(--muted-3)", fontWeight: 600 }}>Completed</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
