"use client";

/**
 * Header notification bell — links to /notifications and shows the unread count.
 * Lightweight realtime: subscribes to INSERTs on the current user's own
 * notifications (RLS-filtered) and bumps the badge live. Falls back to the
 * server-provided count; the app is correct without realtime.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function NotificationBell({ initialCount, userId }: { initialCount: number; userId: string }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

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
          () => setCount((c) => c + 1)
        )
        .subscribe();
    } catch {
      // realtime optional — ignore
    }
    return () => {
      if (channel) getBrowserSupabase().removeChannel(channel);
    };
  }, [userId]);

  return (
    <Link href="/notifications" aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`} style={{ position: "relative", fontSize: 19, lineHeight: 1, textDecoration: "none" }}>
      🔔
      {count > 0 && (
        <span
          style={{
            position: "absolute", top: -7, right: -9, minWidth: 16, height: 16, padding: "0 4px",
            borderRadius: 99, background: "var(--coral)", color: "#fff", fontSize: 10, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff",
          }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
