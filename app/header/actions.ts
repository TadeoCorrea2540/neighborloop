"use server";

/**
 * Header dropdown data loaders. Both resolve the current user server-side and
 * are called lazily when a menu opens (keeps page loads light, content fresh).
 * RLS keeps results scoped to the caller; signed-out → empty.
 */
import { getCurrentUser } from "@/lib/auth/server";
import { getUserNotifications, getUnreadNotificationCount, type NotificationItem } from "@/lib/data/notifications";
import { getUserConversations, getUnreadMessageCount, type ConversationListItem } from "@/lib/data/conversations";

export async function fetchHeaderNotifications(): Promise<{ items: NotificationItem[]; unread: number }> {
  const user = await getCurrentUser();
  if (!user) return { items: [], unread: 0 };
  // The dropdown is the full view now — load the whole list (scrollable), no "view all" page.
  const [items, unread] = await Promise.all([
    getUserNotifications(user.id, { limit: 100 }),
    getUnreadNotificationCount(user.id),
  ]);
  return { items, unread };
}

export async function fetchHeaderConversations(): Promise<{ items: ConversationListItem[]; unread: number }> {
  const user = await getCurrentUser();
  if (!user) return { items: [], unread: 0 };
  const [all, unread] = await Promise.all([
    getUserConversations(user.id),
    getUnreadMessageCount(user.id), // badge counts unread messages, not conversations
  ]);
  return { items: all, unread };
}

/** Cheap count-only loaders for keeping the header badges fresh (focus/poll). */
export async function fetchUnreadNotificationCount(): Promise<number> {
  const user = await getCurrentUser();
  return user ? getUnreadNotificationCount(user.id) : 0;
}

export async function fetchUnreadMessageCount(): Promise<number> {
  const user = await getCurrentUser();
  return user ? getUnreadMessageCount(user.id) : 0;
}
