"use client";

/**
 * Header notifications dropdown. Badge updates live via an RLS-filtered realtime
 * subscription to the user's own notification INSERTs (falls back to the
 * server-provided count). The list is lazy-loaded when the menu opens. Clicking
 * an item marks it read + follows its link; "Mark all read" clears the badge.
 */
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { fetchHeaderNotifications } from "@/app/header/actions";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/app/notifications/actions";
import type { NotificationItem, NotificationType } from "@/lib/data/notifications";
import { panelStyle, Caret, MenuHeader, MenuEmpty, MenuSkeleton, Badge } from "./menu-ui";

const ICON: Record<NotificationType, string> = {
  application_submitted: "📋",
  application_approved: "🎉",
  application_declined: "📭",
  application_waitlisted: "⏳",
  mission_update: "📣",
  mission_reminder: "⏰",
  mission_cancelled: "🚫",
  attendance_checked_in: "✅",
  attendance_completed: "🙌",
  certificate_issued: "🏅",
  message_received: "💬",
  organization_verified: "✓",
  organization_rejected: "ℹ️",
  report_resolved: "🛡️",
  system: "🔔",
};

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

export default function NotificationsMenu({ initialCount, userId }: { initialCount: number; userId: string }) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setCount(initialCount), [initialCount]);

  const load = useCallback(async () => {
    const res = await fetchHeaderNotifications();
    setItems(res.items);
  }, []);

  // realtime badge — bump on insert; drop any cached list so it refetches next open
  useEffect(() => {
    if (!userId) return;
    let channel: ReturnType<ReturnType<typeof getBrowserSupabase>["channel"]> | null = null;
    try {
      const supabase = getBrowserSupabase();
      channel = supabase
        .channel(`notif:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          () => { setCount((c) => c + 1); setItems(null); }
        )
        .subscribe();
    } catch {
      // realtime optional
    }
    return () => { if (channel) getBrowserSupabase().removeChannel(channel); };
  }, [userId]);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  // Opening the menu counts as "seen": load the full list, clear the badge,
  // and mark everything read (the list keeps its highlights for this viewing).
  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      load();
      setCount(0);
      start(async () => { await markAllNotificationsReadAction(); });
    }
  }

  function openItem(n: NotificationItem) {
    if (!n.readAt) {
      setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)) ?? prev);
      start(async () => { await markNotificationReadAction(n.id); });
    }
    setOpen(false);
    if (n.linkUrl) router.push(n.linkUrl);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="hdr-trigger"
        data-open={open}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        🔔
        <Badge count={count} />
      </button>

      {open && (
        <div className="hdr-pop" style={panelStyle} role="menu">
          <Caret />
          <MenuHeader title="Notifications" />

          <div style={{ maxHeight: "min(70vh, 480px)", overflowY: "auto" }}>
            {items === null ? (
              <MenuSkeleton rows={3} />
            ) : items.length === 0 ? (
              <MenuEmpty emoji="🔔" title="You’re all caught up" hint="Updates about your missions, applications, and messages show up here." />
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  role="menuitem"
                  tabIndex={0}
                  className="hdr-row"
                  onClick={() => openItem(n)}
                  onKeyDown={(e) => { if (e.key === "Enter") openItem(n); }}
                  style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", cursor: n.linkUrl ? "pointer" : "default", background: n.readAt ? "#fff" : "#fbfaff" }}
                >
                  <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "#f1f3f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
                    {ICON[n.type] ?? "🔔"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
                      {!n.readAt && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--coral)", flexShrink: 0, marginLeft: "auto" }} />}
                    </div>
                    {n.body && (
                      <div style={{ fontSize: 12.8, color: "var(--muted-1)", marginTop: 2, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {n.body}
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: "var(--muted-3)", marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
