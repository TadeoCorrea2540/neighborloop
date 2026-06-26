import type { CSSProperties, ReactNode } from "react";

/**
 * Lightweight, line-style icon set (Lucide-flavoured) used across the app in
 * place of emoji. 24×24 viewBox, `currentColor` stroke so icons inherit text
 * color, rounded caps/joins for a soft, professional feel.
 */
export type IconName =
  | "home"
  | "target"
  | "sparkles"
  | "award"
  | "message"
  | "settings"
  | "bell"
  | "mail"
  | "search"
  | "bookmark"
  | "clock"
  | "check-circle"
  | "send"
  | "wave"
  | "pin"
  | "calendar"
  | "check"
  | "compass"
  | "bar-chart"
  | "clipboard"
  | "check-square"
  | "trending-up"
  | "inbox";

const PATHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 10.7 12 3.3l9 7.4" />
      <path d="M5.6 9.4V20a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V9.4" />
      <path d="M9.6 21v-5.8a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1V21" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.4 13.7 8a3 3 0 0 0 1.8 1.8l4.6 1.7-4.6 1.7A3 3 0 0 0 13.7 15L12 19.6 10.3 15a3 3 0 0 0-1.8-1.8L3.9 11.5l4.6-1.7A3 3 0 0 0 10.3 8z" />
      <path d="M18.8 3 19.4 4.6 21 5.2 19.4 5.8 18.8 7.4 18.2 5.8 16.6 5.2 18.2 4.6z" fill="currentColor" stroke="none" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8.6" r="5.4" />
      <path d="M8.6 12.9 7.2 21l4.8-2.8L16.8 21l-1.4-8.1" />
    </>
  ),
  message: (
    <>
      <path d="M20.5 11.4a7.7 7.7 0 0 1-11.3 6.8l-4.7 1.4 1.4-4.6A7.7 7.7 0 1 1 20.5 11.4z" />
      <circle cx="8.8" cy="11.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.2" cy="11.6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.4 7.5-2.4 7.5h16.8S18 14.5 18 8.5z" />
      <path d="M13.6 19.5a1.9 1.9 0 0 1-3.2 0" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.6" />
      <path d="m3.4 7 8.6 5.6L20.6 7" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </>
  ),
  bookmark: <path d="M6.5 3.5h11a1 1 0 0 1 1 1V20.4l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.4V12l3.2 1.9" />
    </>
  ),
  "check-circle": (
    <>
      <path d="M21 11.1V12a9 9 0 1 1-5.34-8.22" />
      <path d="m8.6 11.8 2.9 2.9 8.2-8.7" />
    </>
  ),
  send: (
    <>
      <path d="M21.4 3 11 13.4" />
      <path d="M21.4 3 14.9 21 11 13.4 3.4 9.5z" />
    </>
  ),
  wave: (
    <>
      <path
        d="M11.7 21.4c-1.9 0-3.7-1-4.7-2.7l-2.8-4.6a1.45 1.45 0 0 1 2.45-1.55l1.05 1.35V6.5a1.4 1.4 0 0 1 2.8 0v4.4h.35V4.9a1.4 1.4 0 0 1 2.8 0v5.85h.35V5.7a1.4 1.4 0 0 1 2.8 0v5.05h.35V8a1.4 1.4 0 0 1 2.8 0v6.1c0 4-3.1 7.3-7.4 7.3z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M5 4.4 3.6 3M9.1 3.1 8.8 1.2M13.6 3 14.6 1.3" strokeWidth="1.6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.3s6.4-5.6 6.4-10.8A6.4 6.4 0 0 0 5.6 10.5c0 5.2 6.4 10.8 6.4 10.8z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.6" />
      <path d="M3.5 10h17" />
      <path d="M8 3.4v4M16 3.4v4" />
    </>
  ),
  check: <path d="m5 12.5 4.6 4.6L19 7" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.6 8.4-2 5.2-5.2 2 2-5.2z" fill="currentColor" stroke="none" />
    </>
  ),
  "bar-chart": (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M7 20.5V11" />
      <path d="M12 20.5V4.5" />
      <path d="M17 20.5v-6.5" />
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="2.6" width="8" height="4" rx="1.3" />
      <path d="M16 4.6h2a2 2 0 0 1 2 2v12.4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.6a2 2 0 0 1 2-2h2" />
      <path d="M9 11.6h6M9 15.4h4" />
    </>
  ),
  "check-square": (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="m8 12.2 2.8 2.8L16.6 9" />
    </>
  ),
  "trending-up": (
    <>
      <path d="M3.5 16.5 9.5 10l3.5 3.5L21 5.5" />
      <path d="M15 5.5h6v6" />
    </>
  ),
  inbox: (
    <>
      <path d="M21 12.5h-4.5l-1.6 2.4a1 1 0 0 1-.83.45H9.93a1 1 0 0 1-.83-.45L7.5 12.5H3" />
      <path d="M6.4 5.6 3.5 12v5.5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V12l-2.9-6.4a2 2 0 0 0-1.82-1.18H8.22A2 2 0 0 0 6.4 5.6z" />
    </>
  ),
};

export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.9,
  style,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      {PATHS[name]}
    </svg>
  );
}
