export default function MobileFilterActionBar({
  visible,
  filterCount,
  matchCount,
  onOpenFilters,
}: {
  visible: boolean;
  filterCount: number;
  matchCount: number;
  onOpenFilters: () => void;
}) {
  if (!visible || filterCount === 0) return null;

  return (
    <div
      className={`exp-filter-bar exp-mobile-only${visible ? " exp-filter-bar--visible" : ""}`}
      role="status"
    >
      <button type="button" className="exp-filter-bar-btn" onClick={onOpenFilters}>
        Filters · {filterCount} active
      </button>
      <span className="exp-filter-bar-count">{matchCount} missions</span>
    </div>
  );
}
