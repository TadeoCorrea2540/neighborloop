"use client";

import type { MissionCard } from "@/lib/data/mission-cards";
import { fmtMissionDate, locationLabel, spotsLabel } from "@/lib/explore-card-helpers";
import { MissionDateLabel, MissionLocationLabel } from "@/components/mission-meta-label";

function MobileSaveButton({
  saved,
  onSave,
}: {
  saved: boolean;
  onSave: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      className={`exp-save-btn${saved ? " exp-save-btn--on" : ""}`}
      onClick={onSave}
      aria-label={saved ? "Unsave mission" : "Save mission"}
      aria-pressed={saved}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 17.3l-6.2 3.3 1.2-6.9L1 8.7l6.9-1L12 1l4.1 6.7 6.9 1-5.9 5.1 1.2 6.9z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function FeaturedMatchCard({
  card,
  saved,
  onOpen,
  onSave,
}: {
  card: MissionCard;
  saved: boolean;
  onOpen: () => void;
  onSave: (e: React.MouseEvent) => void;
}) {
  const m = card.mission;
  const spots = spotsLabel(card);

  return (
    <section className="exp-featured exp-mobile-only" aria-labelledby="exp-featured-heading">
      <div className="exp-section-kicker">Up next</div>
      <h2 id="exp-featured-heading" className="exp-section-heading">
        Starting soon
      </h2>

      <button type="button" className="exp-featured-card" onClick={onOpen}>
        <span className="exp-featured-accent exp-brand-accent" aria-hidden="true" />
        {card.coverImageUrl ? (
          <div className="exp-featured-cover" style={{ backgroundImage: `url('${card.coverImageUrl}')` }} aria-hidden="true" />
        ) : null}
        <div className="exp-featured-body">
          <div className="exp-featured-top">
            <div className="exp-featured-badges">
              {card.categoryName && <span className="exp-tag">{card.categoryName}</span>}
              {m.isBeginnerFriendly && <span className="exp-tag exp-tag--beginner">Beginner-friendly</span>}
            </div>
            <MobileSaveButton saved={saved} onSave={onSave} />
          </div>
          <h3 className="exp-featured-title">{m.title}</h3>
          <p className="exp-featured-org">{card.organizationName ?? "Organization"}</p>
          <p className="exp-featured-meta">
            <MissionDateLabel>{fmtMissionDate(m.startsAt)}</MissionDateLabel>
            {" · "}
            <MissionLocationLabel virtual={m.isVirtual}>{locationLabel(card)}</MissionLocationLabel>
          </p>
          <div className="exp-featured-tags">
            {m.difficulty && <span className="exp-tag">{m.difficulty}</span>}
            <span className="exp-tag exp-tag--spots">{spots}</span>
          </div>
        </div>
      </button>
    </section>
  );
}
