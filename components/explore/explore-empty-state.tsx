export default function ExploreEmptyState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <section className="exp-empty exp-mobile-only">
      <div className="exp-empty-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
          <circle cx="32" cy="32" r="28" fill="#fff0ec" />
          <path
            d="M32 18v16l10 6"
            stroke="#f1543f"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="32" r="22" stroke="#ffd9c2" strokeWidth="2" />
        </svg>
      </div>
      <h2 className="exp-empty-title">Nothing matches that yet.</h2>
      <p className="exp-empty-lead">
        Try a wider distance, another date, or a different cause.
      </p>
      <div className="exp-empty-actions">
        <button type="button" className="exp-btn-primary" onClick={onReset}>
          Reset filters
        </button>
        <button type="button" className="exp-btn-secondary" onClick={onReset}>
          Explore all missions
        </button>
      </div>
      <div className="exp-empty-suggestions">
        <span>Try:</span>
        {["Food support", "This weekend", "Near me"].map((s) => (
          <span key={s} className="exp-empty-chip">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}

export function ExploreSkeleton() {
  return (
    <div className="exp-skeleton exp-mobile-only" aria-hidden="true">
      <div className="exp-skeleton-featured" />
      <div className="exp-skeleton-feed">
        {[0, 1, 2].map((i) => (
          <div key={i} className="exp-skeleton-card">
            <div className="exp-skeleton-media" />
            <div className="exp-skeleton-lines">
              <span />
              <span />
              <span className="exp-skeleton-short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
