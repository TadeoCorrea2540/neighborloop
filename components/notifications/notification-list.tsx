"use client";

/**
 * Notification center list. Client-side All/Unread filter; mark-one / mark-all
 * read via server actions; clicking an item marks it read and follows link_url.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/app/notifications/actions";
import type { NotificationItem } from "@/lib/data/notifications";
import Icon from "@/components/icons";
import NotificationIcon from "@/components/header/notification-icon";
import { stripEmoji } from "@/lib/strip-emoji";

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

export default function NotificationList({ initial }: { initial: NotificationItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [, start] = useTransition();

  const unreadCount = items.filter((n) => !n.readAt).length;
  const shown = filter === "unread" ? items.filter((n) => !n.readAt) : items;

  function markOne(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n)));
    start(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  }

  function open(n: NotificationItem) {
    if (!n.readAt) markOne(n.id);
    if (n.linkUrl) router.push(n.linkUrl);
  }

  function markAll() {
    setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })));
    start(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18, flexWrap: "wrap" }}>
        {(["all", "unread"] as const).map((f) => {
          const active = filter === f;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)}
              style={{ fontSize: 13.5, fontWeight: 600, padding: "8px 15px", borderRadius: 11, cursor: "pointer", background: active ? "#18203b" : "#fff", color: active ? "#fff" : "var(--muted-1)", border: active ? "none" : "1px solid rgba(24,32,59,.1)" }}>
              {f === "all" ? "All" : `Unread ${unreadCount > 0 ? unreadCount : ""}`.trim()}
            </button>
          );
        })}
        {unreadCount > 0 && (
          <button type="button" onClick={markAll} style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "var(--coral-deep)", background: "#fff0ec", border: "none", padding: "8px 14px", borderRadius: 11, cursor: "pointer" }}>
            Mark all read
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", color: "var(--muted-3)", marginBottom: 8 }}><Icon name="bell" size={34} /></div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{filter === "unread" ? "You’re all caught up" : "No notifications yet"}</div>
          <p style={{ fontSize: 14, color: "var(--muted-3)", margin: "6px 0 0" }}>Updates about your missions, applications, and messages show up here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {shown.map((n) => (
            <div
              key={n.id}
              onClick={() => open(n)}
              role="button"
              tabIndex={0}
              style={{
                display: "flex", gap: 13, alignItems: "flex-start", cursor: n.linkUrl ? "pointer" : "default",
                background: n.readAt ? "#fff" : "#fbfaff",
                border: `1px solid ${n.readAt ? "rgba(24,32,59,.06)" : "rgba(122,107,245,.25)"}`,
                borderRadius: 14, padding: "14px 16px",
              }}
            >
              <NotificationIcon type={n.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{stripEmoji(n.title)}</span>
                  {!n.readAt && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />}
                </div>
                {n.body && <div style={{ fontSize: 13.5, color: "var(--muted-1)", marginTop: 2, lineHeight: 1.45 }}>{stripEmoji(n.body)}</div>}
                <div style={{ fontSize: 12, color: "var(--muted-3)", marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
              </div>
              {!n.readAt && (
                <button type="button" onClick={(e) => { e.stopPropagation(); markOne(n.id); }}
                  style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: "var(--muted-1)", background: "#f1f3f8", border: "none", padding: "6px 10px", borderRadius: 9, cursor: "pointer" }}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
