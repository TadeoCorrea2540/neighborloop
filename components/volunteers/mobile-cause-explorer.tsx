"use client";

import { CauseKey } from "@/lib/data";
import { CAUSE_TILE_BG, MOBILE_VOL_CAUSES } from "@/lib/volunteers-mobile-data";

export default function MobileCauseExplorer({
  cause,
  onCauseChange,
}: {
  cause: CauseKey;
  onCauseChange: (c: CauseKey) => void;
}) {
  return (
    <section className="vol-causes vol-mobile-only" aria-labelledby="vol-causes-heading">
      <div className="vol-section-kicker">Explore causes</div>
      <h2 id="vol-causes-heading" className="vol-section-heading">
        Choose a cause that feels personal.
      </h2>
      <p className="vol-causes-hint">Swipe for more →</p>
      <div className="vol-causes-rail" role="tablist" aria-label="Cause categories">
        {MOBILE_VOL_CAUSES.map(({ label, key, count }, i) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={cause === key}
            className={`vol-cause-tile${cause === key ? " vol-cause-tile--active" : ""}`}
            style={{ background: CAUSE_TILE_BG[i % CAUSE_TILE_BG.length] }}
            onClick={() => onCauseChange(key)}
          >
            <span className="vol-cause-tile-label">{label}</span>
            <span className="vol-cause-tile-count">{count} missions</span>
          </button>
        ))}
      </div>
    </section>
  );
}
