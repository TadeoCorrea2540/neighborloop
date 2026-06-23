/**
 * Lightweight client event so the header badges can update the instant a message
 * is sent or a conversation is read — without a full router.refresh(). The
 * header menus listen and re-fetch their (cheap) counts.
 */
export const BADGE_REFRESH_EVENT = "nl:badges-refresh";

export function emitBadgeRefresh() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(BADGE_REFRESH_EVENT));
}
