"use client";

import { Mission, causeArt, spotStyle } from "@/lib/data";
import { featuredMatchReason, mockMatchScore } from "@/lib/explore-mobile-data";
import { missionPurpose } from "@/lib/volunteers-mobile-data";

export default function FeaturedMatchCard({
  mission,
  saved,
  onOpen,
  onSave,
}: {
  mission: Mission;
  saved: boolean;
  onOpen: () => void;
  onSave: (e: React.MouseEvent) => void;
}) {
  const ss = spotStyle(mission.spots);
  const score = mockMatchScore(mission, 0);

  return (
    <section className="exp-featured exp-mobile-only" aria-labelledby="exp-featured-heading">
      <div className="exp-section-kicker">Best match</div>
      <h2 id="exp-featured-heading" className="exp-section-heading">
        A good match for you
      </h2>

      <button type="button" className="exp-featured-card" onClick={onOpen}>
        <div className="exp-featured-media" style={{ background: causeArt(mission) }}>
          <span className="exp-featured-match">{score}% match</span>
          <span className="exp-featured-cause">{mission.cause}</span>
        </div>
        <div className="exp-featured-body">
          <div className="exp-featured-top">
            <h3 className="exp-featured-title">{mission.title}</h3>
            <button
              type="button"
              className={`exp-save-btn${saved ? " exp-save-btn--on" : ""}`}
              onClick={onSave}
              aria-label={saved ? "Unsave mission" : "Save mission"}
              aria-pressed={saved}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M12 17.3l-6.2 3.3 1.2-6.9L1 8.7l6.9-1L12 1l4.1 6.7 6.9 1-5.9 5.1 1.2 6.9z"
                  fill={saved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="exp-featured-purpose">{missionPurpose(mission)}</p>
          <p className="exp-featured-meta">
            {mission.date} · {mission.dist}
          </p>
          <div className="exp-featured-tags">
            <span className="exp-tag">{mission.diff}</span>
            <span className="exp-tag exp-tag--spots" style={ss}>
              {mission.spots} spots left
            </span>
          </div>
          <span className="exp-fit-label">{featuredMatchReason(mission)}</span>
        </div>
      </button>
    </section>
  );
}
