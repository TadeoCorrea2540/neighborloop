/**
 * Lightweight client event so the header badges can update the instant a message
 * is sent or a conversation is read — without a full router.refresh(). The
 * header menus listen and re-fetch their (cheap) counts.
 */
export const BADGE_REFRESH_EVENT = "nl:badges-refresh";

export function emitBadgeRefresh() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(BADGE_REFRESH_EVENT));
}

/**
 * Instant, optimistic envelope-badge update: when a conversation is opened we
 * already know how many of its messages were unread, so the header can subtract
 * that immediately (0ms) without waiting on the server. Persistence happens in
 * the background.
 */
export const MESSAGES_READ_EVENT = "nl:messages-read";

export function emitMessagesRead(count: number) {
  if (typeof window !== "undefined" && count > 0) {
    window.dispatchEvent(new CustomEvent(MESSAGES_READ_EVENT, { detail: { count } }));
  }
}
