import type { CSSProperties } from "react";

/**
 * Person-silhouette placeholder shown when a user or organization has no
 * uploaded picture. Soft brand tones — coral for people, mint for orgs.
 */
export default function DefaultAvatar({
  size = 40,
  radius,
  kind = "user",
  style,
}: {
  size?: number;
  radius?: number;
  kind?: "user" | "org";
  style?: CSSProperties;
}) {
  const r = radius ?? Math.round(size * 0.28);
  const bg = kind === "org"
    ? "linear-gradient(135deg,#e8f7ef,#cfeede)"
    : "linear-gradient(135deg,#ffece6,#ffd9cf)";
  const fg = kind === "org" ? "#86d3ad" : "#f4a591";
  const g = Math.round(size * 0.62);
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, minWidth: size, borderRadius: r, background: bg,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, overflow: "hidden", ...style,
      }}
    >
      <svg width={g} height={g} viewBox="0 0 24 24" style={{ display: "block" }}>
        <circle cx="12" cy="9" r="3.9" fill={fg} />
        <path d="M4.6 20.4c0-4.1 3.3-7.1 7.4-7.1s7.4 3 7.4 7.1z" fill={fg} />
      </svg>
    </span>
  );
}
