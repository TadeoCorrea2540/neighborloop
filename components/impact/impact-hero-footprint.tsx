import Icon from "@/components/icons";
import type { CompletedMission } from "@/lib/data/volunteer-impact";

function formatMissionDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ImpactHeroFootprint({ missions }: { missions: CompletedMission[] }) {
  const moments = missions.slice(0, 2);

  if (moments.length === 0) {
    return (
      <div className="impact-hero-footprint impact-hero-footprint--empty">
        <span className="impact-hero-footprint-icon" aria-hidden>
          <Icon name="compass" size={16} strokeWidth={2.2} />
        </span>
        <p>Your completed missions will show up here as milestone moments.</p>
      </div>
    );
  }

  return (
    <div className="impact-hero-footprint" aria-label="Recent mission moments">
      <p className="impact-hero-footprint-label">
        <Icon name="compass" size={13} strokeWidth={2.3} />
        Moments that count
      </p>
      <ul className="impact-hero-moments">
        {moments.map((m, i) => {
          const when = formatMissionDate(m.startsAt);
          return (
            <li key={m.attendanceId} className="impact-hero-moment" style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="impact-hero-moment-rail" aria-hidden />
              <div className="impact-hero-moment-body">
                <strong className="impact-hero-moment-title">{m.missionTitle}</strong>
                <span className="impact-hero-moment-meta">
                  {m.organizationName}
                  {when && (
                    <>
                      <span className="impact-hero-moment-dot" aria-hidden />
                      {when}
                    </>
                  )}
                </span>
              </div>
              <div className="impact-hero-moment-tail">
                {m.hoursCredited > 0 && (
                  <span className="impact-hero-moment-hours">{m.hoursCredited}h</span>
                )}
                {m.certificateId && (
                  <span className="impact-hero-moment-seal" title="Certificate earned" aria-label="Certificate earned">
                    <Icon name="award" size={12} strokeWidth={2.3} />
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
