"use client";

import ExploreMissionCard from "@/components/explore/explore-mission-card";
import type { MissionCard } from "@/lib/data/mission-cards";

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

export default function MissionFeedCard({
  card,
  index,
  saved,
  onOpen,
  onSave,
}: {
  card: MissionCard;
  index: number;
  saved: boolean;
  onOpen: () => void;
  onSave: (e: React.MouseEvent) => void;
}) {
  return (
    <ExploreMissionCard
      card={card}
      index={index}
      layout="feed"
      showCta
      interactive="button"
      onActivate={onOpen}
      saveSlot={<MobileSaveButton saved={saved} onSave={onSave} />}
    />
  );
}
