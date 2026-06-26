import Link from "next/link";
import { fmtDate } from "@/components/admin/badges";
import type { CompletedMission } from "@/lib/data/volunteer-impact";
import ImpactEmptyState from "./impact-empty-state";

export default function MissionHistorySection({ missions }: { missions: CompletedMission[] }) {
  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="impact-section-title">
        Hours &amp; mission history
      </h2>
      <p className="impact-section-sub">Confirmed attendance from organizers</p>

      {missions.length === 0 ? (
        <ImpactEmptyState
          icon="clock"
          title="No confirmed hours yet"
          body="Once organizers confirm your attendance, your hours and completed missions appear here."
          ctaLabel="Explore missions"
          ctaHref="/explore"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {missions.map((m) => (
            <article key={m.attendanceId} className="impact-history-card">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.missionTitle}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginTop: 2 }}>
                  {m.organizationName}
                  {m.startsAt ? ` · ${fmtDate(m.startsAt)}` : ""}
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--coral-deep)", whiteSpace: "nowrap" }}>
                {m.hoursCredited}h
              </span>
              {m.certificateId ? (
                <Link
                  href={`/certificates/${m.certificateId}`}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "#18203b",
                    padding: "7px 11px",
                    borderRadius: 9,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    minHeight: 36,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Certificate
                </Link>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: "#dff6ea",
                    color: "#147a57",
                  }}
                >
                  Completed
                </span>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
