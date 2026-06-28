import Link from "next/link";
import Icon from "@/components/icons";

export default function ExploreResultsEmpty({
  filtered,
  isOrganizer,
  onReset,
}: {
  filtered: boolean;
  isOrganizer?: boolean;
  onReset?: () => void;
}) {
  if (filtered) {
    return (
      <div className="exp-results-empty" role="status">
        <div className="exp-results-empty-icon" aria-hidden="true">
          <Icon name="search" size={26} />
        </div>
        <h2 className="exp-results-empty-title">No missions match those filters</h2>
        <p className="exp-results-empty-lead">
          Try another cause, date, or difficulty — or reset to browse all live missions.
        </p>
        {onReset && (
          <button type="button" className="exp-results-empty-btn" onClick={onReset}>
            Reset filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="exp-results-empty" role="status">
      <div className="exp-results-empty-icon" aria-hidden="true">
        <Icon name="compass" size={26} />
      </div>
      <h2 className="exp-results-empty-title">No missions are live yet</h2>
      <p className="exp-results-empty-lead">
        Once verified organizers publish missions, they&apos;ll appear here.
      </p>
      {isOrganizer ? (
        <Link href="/manage/missions/new" className="exp-results-empty-btn exp-results-empty-btn--link">
          Create a mission
        </Link>
      ) : (
        <Link href="/explore" className="exp-results-empty-link">
          Check back soon →
        </Link>
      )}
    </div>
  );
}
