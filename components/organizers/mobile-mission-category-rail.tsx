"use client";

import { useRef } from "react";
import {
  MISSION_CATEGORIES,
  MissionCategoryId,
  ORG_TILE_BG,
} from "@/lib/organizers-mobile-data";

function scrollTileIntoRail(
  rail: HTMLDivElement,
  tile: HTMLButtonElement
) {
  const railRect = rail.getBoundingClientRect();
  const tileRect = tile.getBoundingClientRect();
  const pad = 10;

  if (tileRect.left < railRect.left) {
    rail.scrollLeft -= railRect.left - tileRect.left + pad;
  } else if (tileRect.right > railRect.right) {
    rail.scrollLeft += tileRect.right - railRect.right + pad;
  }
}

export default function MobileMissionCategoryRail({
  selected,
  onSelect,
}: {
  selected: MissionCategoryId;
  onSelect: (id: MissionCategoryId) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: MissionCategoryId, tile: HTMLButtonElement) => {
    onSelect(id);
    tile.focus({ preventScroll: true });
    if (railRef.current) scrollTileIntoRail(railRef.current, tile);
  };

  return (
    <section className="org-categories org-mobile-only" aria-labelledby="org-categories-heading">
      <div className="org-section-kicker">What you can post</div>
      <h2 id="org-categories-heading" className="org-section-heading">
        Bring people together for something real.
      </h2>
      <p className="org-categories-hint">Swipe for more →</p>
      <div
        ref={railRef}
        className="org-categories-rail"
        role="tablist"
        aria-label="Mission categories"
      >
        {MISSION_CATEGORIES.map(({ id, label, example }, i) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected === id}
            className={`org-category-tile${selected === id ? " org-category-tile--active" : ""}`}
            style={{ background: ORG_TILE_BG[i % ORG_TILE_BG.length] }}
            onClick={(e) => handleSelect(id, e.currentTarget)}
          >
            <span className="org-category-label">{label}</span>
            <span className="org-category-example">{example}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
