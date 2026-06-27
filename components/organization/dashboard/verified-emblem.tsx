/**
 * Animated "trust seal" for the verified-organization emblem: a slowly rotating
 * scalloped seal around a twinkling star, with a soft pulsing halo. No checkmark.
 * Inherits `currentColor` (mint) from the emblem tile; all motion is CSS and is
 * disabled under prefers-reduced-motion.
 */
export default function VerifiedEmblem() {
  return (
    <span className="ve" aria-hidden>
      <span className="ve-halo" />
      <svg
        className="ve-svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          className="ve-seal"
          d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        />
        <path
          className="ve-star"
          d="M12 8.2 12.9 10.7 15.6 10.8 13.5 12.5 14.2 15.1 12 13.6 9.8 15.1 10.5 12.5 8.4 10.8 11.1 10.7Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    </span>
  );
}
