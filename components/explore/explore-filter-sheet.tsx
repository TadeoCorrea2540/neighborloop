"use client";

import {
  ADVANCED_CAUSES,
  AdvancedFilters,
  DEFAULT_ADVANCED,
} from "@/lib/explore-mobile-data";
import { Mission } from "@/lib/data";

export default function ExploreFilterSheet({
  open,
  draft,
  onChange,
  onClose,
  onApply,
  onReset,
}: {
  open: boolean;
  draft: AdvancedFilters;
  onChange: (next: AdvancedFilters) => void;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
}) {
  if (!open) return null;

  const toggleCause = (cause: (typeof ADVANCED_CAUSES)[number]) => {
    const causes = draft.causes.includes(cause)
      ? draft.causes.filter((c) => c !== cause)
      : [...draft.causes, cause];
    onChange({ ...draft, causes });
  };

  return (
    <>
      <div className="exp-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="exp-sheet exp-sheet--filters"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exp-filter-title"
      >
        <div className="exp-sheet-handle" aria-hidden="true" />
        <button type="button" className="exp-sheet-close" onClick={onClose} aria-label="Close filters">
          ×
        </button>
        <h2 id="exp-filter-title" className="exp-filter-title">
          Refine your mission search
        </h2>

        <div className="exp-filter-group">
          <h3>Cause</h3>
          <div className="exp-filter-chips">
            {ADVANCED_CAUSES.map((c) => (
              <button
                key={c}
                type="button"
                className={`exp-filter-chip${draft.causes.includes(c) ? " exp-filter-chip--on" : ""}`}
                onClick={() => toggleCause(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="exp-filter-group">
          <h3>Date</h3>
          <div className="exp-filter-chips">
            {(
              [
                { id: "today", label: "Today" },
                { id: "week", label: "This week" },
                { id: "month", label: "This month" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`exp-filter-chip${draft.when === id ? " exp-filter-chip--on" : ""}`}
                onClick={() =>
                  onChange({ ...draft, when: draft.when === id ? null : id })
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="exp-filter-group">
          <h3>Distance</h3>
          <p className="exp-filter-distance-label">Within {draft.distance} miles</p>
          <input
            type="range"
            min={1}
            max={25}
            value={draft.distance}
            onChange={(e) => onChange({ ...draft, distance: Number(e.target.value) })}
            className="exp-filter-range"
            aria-label="Maximum distance in miles"
          />
        </div>

        <div className="exp-filter-group">
          <h3>Difficulty</h3>
          <div className="exp-filter-chips">
            {(["Easy", "Medium", "Hard"] as Mission["diff"][]).map((d) => (
              <button
                key={d}
                type="button"
                className={`exp-filter-chip${draft.difficulty === d ? " exp-filter-chip--on" : ""}`}
                onClick={() =>
                  onChange({
                    ...draft,
                    difficulty: draft.difficulty === d ? null : d,
                  })
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="exp-filter-group">
          <h3>Age requirements</h3>
          <div className="exp-filter-chips">
            {(
              [
                { id: "none", label: "All ages" },
                { id: "13+", label: "13+" },
                { id: "18+", label: "18+" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`exp-filter-chip${draft.ageRequirement === id ? " exp-filter-chip--on" : ""}`}
                onClick={() =>
                  onChange({
                    ...draft,
                    ageRequirement: draft.ageRequirement === id ? null : id,
                  })
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="exp-filter-toggles">
          <label className="exp-filter-toggle">
            <span>Perks available</span>
            <input
              type="checkbox"
              checked={draft.perks}
              onChange={(e) => onChange({ ...draft, perks: e.target.checked })}
            />
          </label>
          <label className="exp-filter-toggle">
            <span>Accessibility needs</span>
            <input
              type="checkbox"
              checked={draft.accessibility}
              onChange={(e) => onChange({ ...draft, accessibility: e.target.checked })}
            />
          </label>
        </div>

        <div className="exp-filter-actions">
          <button type="button" className="exp-btn-secondary" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="exp-btn-primary" onClick={onApply}>
            Apply filters
          </button>
        </div>
      </div>
    </>
  );
}
