import { MOMENTUM_EVENTS } from "@/lib/organizers-mobile-data";

export default function OrganizerMomentumFeed() {
  return (
    <section className="org-momentum org-mobile-only" aria-labelledby="org-momentum-heading">
      <div className="org-section-kicker">Organizer momentum</div>
      <h2 id="org-momentum-heading" className="org-section-heading">
        See your mission come to life.
      </h2>
      <ol className="org-momentum-list">
        {MOMENTUM_EVENTS.map((ev, i) => (
          <li
            key={ev.status}
            className="org-momentum-item"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className={`org-momentum-dot org-momentum-dot--${ev.dot}`} aria-hidden="true" />
            <div>
              <div className="org-momentum-status">{ev.status}</div>
              <div className="org-momentum-title">{ev.title}</div>
              <div className="org-momentum-time">{ev.time}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
