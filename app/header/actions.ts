"use server";

/**
 * Header dropdown data loaders. Both resolve the current user server-side and
 * are called lazily when a menu opens (keeps page loads light, content fresh).
 * RLS keeps results scoped to the caller; signed-out → empty.
 */
import { getCurrentUser } from "@/lib/auth/server";
import { getUserNotifications, getUnreadNotificationCount, type NotificationItem } from "@/lib/data/notifications";
import { getUserConversations, type ConversationListItem } from "@/lib/data/conversations";

export async function fetchHeaderNotifications(): Promise<{ items: NotificationItem[]; unread: number }> {
  const user = await getCurrentUser();
  if (!user) return { items: [], unread: 0 };
  const [items, unread] = await Promise.all([
    getUserNotifications(user.id, { limit: 8 }),
    getUnreadNotificationCount(user.id),
  ]);
  return { items, unread };
}

export async function fetchHeaderConversations(): Promise<{ items: ConversationListItem[]; unread: number }> {
  const user = await getCurrentUser();
  if (!user) return { items: [], unread: 0 };
  const all = await getUserConversations(user.id);
  return { items: all.slice(0, 8), unread: all.filter((c) => c.unread).length };
}
