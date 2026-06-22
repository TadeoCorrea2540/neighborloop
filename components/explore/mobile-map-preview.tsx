"use client";

import { Mission } from "@/lib/data";

const MAP_PINS = [
  { label: "Food Bank", left: "18%", top: "28%", color: "#ff6f5e" },
  { label: "Beach Cleanup", left: "62%", top: "42%", color: "#3a8bf0" },
  { label: "Reading Buddy", left: "38%", top: "62%", color: "#7a6bf5" },
];

export default function MobileMapPreview({
  count,
  onOpenMap,
}: {
  count: number;
  onOpenMap: () => void;
}) {
  return (
    <section className="exp-map-preview exp-mobile-only" aria-labelledby="exp-map-heading">
      <h2 id="exp-map-heading" className="exp-visually-hidden">
        Map preview
      </h2>
      <button type="button" className="exp-map-preview-card" onClick={onOpenMap}>
        <div className="exp-map-preview-canvas" aria-hidden="true">
          <span className="exp-map-grid" />
          {MAP_PINS.map((p) => (
            <span
              key={p.label}
              className="exp-map-pin"
              style={{ left: p.left, top: p.top, "--pin-color": p.color } as React.CSSProperties}
            />
          ))}
        </div>
        <div className="exp-map-preview-copy">
          <span className="exp-map-preview-count">{count} missions in this area</span>
          <span className="exp-map-preview-cta">View missions on map →</span>
        </div>
      </button>
    </section>
  );
}

export function ExploreMapSheet({
  open,
  missions,
  onClose,
}: {
  open: boolean;
  missions: Mission[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <>
      <div className="exp-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="exp-sheet exp-sheet--map" role="dialog" aria-modal="true" aria-label="Mission map">
        <div className="exp-sheet-handle" aria-hidden="true" />
        <button type="button" className="exp-sheet-close" onClick={onClose} aria-label="Close map">
          ×
        </button>
        <div className="exp-map-full" aria-hidden="true">
          <span className="exp-map-grid" />
          {MAP_PINS.map((p) => (
            <span
              key={p.label}
              className="exp-map-pin exp-map-pin--lg"
              style={{ left: p.left, top: p.top, "--pin-color": p.color } as React.CSSProperties}
            />
          ))}
          <div className="exp-map-full-badge">{missions.length} missions nearby</div>
        </div>
        <p className="exp-map-disclaimer">Preview map — locations are approximate for demo.</p>
      </div>
    </>
  );
}
