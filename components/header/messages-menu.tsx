"use client";

/**
 * Header messages dropdown. Shows recent conversations (lazy-loaded on open).
 * Primary label is role-aware: volunteers see the organization, organizers see
 * the volunteer. Clicking a row opens the thread under `basePath`.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchHeaderConversations } from "@/app/header/actions";
import type { ConversationListItem } from "@/lib/data/conversations";
import { panelStyle, Caret, MenuHeader, MenuFooter, MenuEmpty, MenuSkeleton, Badge } from "./menu-ui";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MessagesMenu({
  initialCount,
  viewer,
  basePath,
}: {
  initialCount: number;
  viewer: "volunteer" | "organizer";
  basePath: string;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ConversationListItem[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setCount(initialCount), [initialCount]);

  async function load() {
    const res = await fetchHeaderConversations();
    setItems(res.items);
    setCount(res.unread);
  }

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) load(); // always refresh — conversations change often
      return next;
    });
  }

  function openConv(c: ConversationListItem) {
    setOpen(false);
    router.push(`${basePath}/${c.id}`);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="hdr-trigger"
        data-open={open}
        aria-label={`Messages${count > 0 ? `, ${count} unread` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        ✉️
        <Badge count={count} />
      </button>

      {open && (
        <div className="hdr-pop" style={panelStyle} role="menu">
          <Caret />
          <MenuHeader title="Messages" />

          <div style={{ maxHeight: 392, overflowY: "auto" }}>
            {items === null ? (
              <MenuSkeleton rows={3} />
            ) : items.length === 0 ? (
              <MenuEmpty
                emoji="💬"
                title="No messages yet"
                hint={viewer === "volunteer" ? "Message an organizer from a mission you’ve applied to." : "Conversations with your volunteers will appear here."}
              />
            ) : (
              items.map((c) => {
                const primary = viewer === "organizer" ? c.counterpartName : c.organizationName;
                return (
                  <div
                    key={c.id}
                    role="menuitem"
                    tabIndex={0}
                    className="hdr-row"
                    onClick={() => openConv(c)}
                    onKeyDown={(e) => { if (e.key === "Enter") openConv(c); }}
                    style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px", cursor: "pointer", background: c.unread ? "#fbfaff" : "#fff" }}
                  >
                    <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#bca6ff,#7a6bf5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>
                      {(primary || "?").trim().charAt(0).toUpperCase()}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{primary}</span>
                        <span style={{ fontSize: 11.5, color: "var(--muted-3)", flexShrink: 0 }}>{timeAgo(c.lastMessageAt)}</span>
                        {c.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontSize: 12.8, color: "var(--muted-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        🎯 {c.missionTitle}{c.lastPreview ? ` · ${c.lastPreview}` : ""}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <MenuFooter href={basePath} label="View all messages" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
