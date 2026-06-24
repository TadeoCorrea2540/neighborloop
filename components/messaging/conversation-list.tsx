/** Inbox list (presentational, server-importable). Role-aware primary label. */
import Link from "next/link";
import DefaultAvatar from "@/components/default-avatar";
import type { ConversationListItem } from "@/lib/data/conversations";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ConversationList({
  items,
  basePath,
  viewer,
}: {
  items: ConversationListItem[];
  basePath: string; // "/messages" | "/manage/messages"
  viewer: "volunteer" | "organizer";
}) {
  if (items.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 34, marginBottom: 8 }}>💬</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>No messages yet</div>
        <p style={{ fontSize: 14, color: "var(--muted-3)", margin: "6px 0 0" }}>
          {viewer === "volunteer"
            ? "Message an organizer from a mission you’ve applied to."
            : "Conversations with your volunteers will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((c) => {
        const primary = viewer === "organizer" ? c.counterpartName : c.organizationName;
        return (
          <Link key={c.id} href={`${basePath}/${c.id}`}
            style={{ display: "flex", alignItems: "center", gap: 13, background: c.unread ? "#fbfaff" : "#fff", border: `1px solid ${c.unread ? "rgba(122,107,245,.25)" : "rgba(24,32,59,.06)"}`, borderRadius: 14, padding: "14px 16px", textDecoration: "none", color: "inherit" }}>
            <DefaultAvatar size={44} radius={13} kind={viewer === "volunteer" ? "org" : "user"} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{primary}</span>
                {c.unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                🎯 {c.missionTitle}{c.lastPreview ? ` · ${c.lastPreview}` : ""}
              </div>
            </div>
            <span style={{ fontSize: 12, color: "var(--muted-3)", flexShrink: 0 }}>{timeAgo(c.lastMessageAt)}</span>
          </Link>
        );
      })}
    </div>
  );
}
