"use client";

import { SEARCH_SUGGESTIONS } from "@/lib/explore-mobile-data";

export default function MobileMissionSearch({
  value,
  onChange,
  onFilterOpen,
  filterCount,
  focused,
  onFocus,
  onBlur,
  onSuggestion,
}: {
  value: string;
  onChange: (v: string) => void;
  onFilterOpen: () => void;
  filterCount: number;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onSuggestion: (s: string) => void;
}) {
  return (
    <div className={`exp-search-wrap exp-mobile-only${focused ? " exp-search-wrap--focused" : ""}`}>
      <div className="exp-search-bar">
        <span className="exp-search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          className="exp-search-input"
          placeholder="Search causes, places, or missions"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-label="Search missions"
        />
        <button
          type="button"
          className="exp-search-filter-btn"
          onClick={onFilterOpen}
          aria-label={`Open filters${filterCount ? `, ${filterCount} active` : ""}`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M7 12h10M10 18h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {filterCount > 0 && (
            <span className="exp-search-filter-badge" aria-hidden="true">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {focused && (
        <div className="exp-search-suggestions" role="listbox" aria-label="Suggested searches">
          {SEARCH_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              role="option"
              className="exp-search-suggestion"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
