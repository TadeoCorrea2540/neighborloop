"use client";

import { QUICK_FILTERS, QuickFilterId } from "@/lib/explore-mobile-data";

export default function QuickFilterRail({
  selected,
  onToggle,
  matchCount,
}: {
  selected: QuickFilterId[];
  onToggle: (id: QuickFilterId) => void;
  matchCount: number;
}) {
  return (
    <section className="exp-quick-filters exp-mobile-only" aria-label="Quick filters">
      <div className="exp-quick-rail">
        {QUICK_FILTERS.map(({ id, label }) => {
          const active = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              className={`exp-quick-chip${active ? " exp-quick-chip--on" : ""}`}
              aria-pressed={active}
              onClick={() => onToggle(id)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="exp-match-count" aria-live="polite">
        <strong>{matchCount}</strong> mission{matchCount === 1 ? "" : "s"} match this
      </p>
    </section>
  );
}
