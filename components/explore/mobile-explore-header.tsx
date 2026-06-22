import { EXPLORE_NEARBY_COUNT } from "@/lib/explore-mobile-data";

export default function MobileExploreHeader() {
  return (
    <header className="exp-header exp-mobile-only">
      <h1 className="exp-header-title">Find a mission that fits your day.</h1>
      <p className="exp-header-lead">
        Discover nearby ways to help, meet people, and make time matter.
      </p>
      <div className="exp-nearby-line" aria-live="polite">
        <span className="exp-nearby-dot" aria-hidden="true" />
        <span>
          <strong>{EXPLORE_NEARBY_COUNT}</strong> missions near you
        </span>
      </div>
    </header>
  );
}
