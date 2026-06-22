"use client";

import { Mission, causeArt, spotStyle } from "@/lib/data";
import { missionFitLabel } from "@/lib/explore-mobile-data";

export default function MissionFeedCard({
  mission,
  index,
  saved,
  onOpen,
  onSave,
}: {
  mission: Mission;
  index: number;
  saved: boolean;
  onOpen: () => void;
  onSave: (e: React.MouseEvent) => void;
}) {
  const ss = spotStyle(mission.spots);
  const fit = missionFitLabel(mission, index);

  return (
    <article
      className="exp-feed-card"
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
      <button type="button" className="exp-feed-card-btn" onClick={onOpen}>
        <div className="exp-feed-media" style={{ background: causeArt(mission) }}>
          <span className="exp-feed-cause">{mission.cause}</span>
        </div>
        <div className="exp-feed-body">
          <div className="exp-feed-top">
            <h3 className="exp-feed-title">{mission.title}</h3>
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
          </div>
          <p className="exp-feed-date">{mission.date}</p>
          <p className="exp-feed-loc">{mission.dist} · {mission.diff}</p>
          <div className="exp-feed-foot">
            <span className="exp-tag exp-tag--spots" style={ss}>
              {mission.spots} spots left
            </span>
            <span className="exp-feed-view">View mission →</span>
          </div>
          {fit && <span className="exp-fit-label exp-fit-label--inline">{fit}</span>}
        </div>
      </button>
    </article>
  );
}
