/**
 * Verified-organization emblem: a columned institution/landmark — the universal
 * mark for an established, official organization — wrapped in an animated
 * "verification pulse" (an expanding trust ring) and a soft halo. No checkmark.
 * Inherits `currentColor` (mint) from the emblem tile; all motion is CSS and is
 * disabled under prefers-reduced-motion.
 */
export default function VerifiedEmblem() {
  return (
    <span className="ve" aria-hidden>
      <span className="ve-halo" />
      <span className="ve-ring" />
      <svg
        className="ve-svg"
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* pediment / roof */}
        <path d="M12 3.4 20.5 9 3.5 9Z" />
        {/* columns */}
        <path d="M6.6 18.4V10M10.2 18.4V10M13.8 18.4V10M17.4 18.4V10" />
        {/* entablature + ground */}
        <path d="M4.6 18.4h14.8" />
        <path d="M3.2 21.4h17.6" />
      </svg>
    </span>
  );
}
