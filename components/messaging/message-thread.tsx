"use client";

/**
 * Shared conversation thread (volunteer + organizer). Marks the conversation
 * read on mount, renders the message bubbles + a sticky composer, and subscribes
 * to new messages for THIS conversation (RLS-filtered realtime). Correct after a
 * plain refresh — realtime just triggers router.refresh().
 */
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { sendMessageAction, markConversationReadAction } from "@/app/messages/actions";
import AuthToast from "@/components/auth/auth-toast";
import { useFocusPoll } from "@/components/header/use-focus-poll";
import type { MessageItem } from "@/lib/data/messages";
import type { ConversationDetail } from "@/lib/data/conversations";

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function MessageThread({
  conversation,
  initialMessages,
  currentUserId,
  backHref,
}: {
  conversation: ConversationDetail;
  initialMessages: MessageItem[];
  currentUserId: string;
  backHref: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const show = (msg: string, tone: "error" | "success") => { setToast({ msg, tone }); setSeq((n) => n + 1); };

  useEffect(() => setMessages(initialMessages), [initialMessages]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages.length]);

  // mark read on open, then refresh so the header unread badge clears promptly
  useEffect(() => {
    let cancelled = false;
    markConversationReadAction(conversation.id).then((res) => {
      if (!cancelled && res?.ok) router.refresh();
    });
    return () => { cancelled = true; };
  }, [conversation.id, router]);

  // realtime: new messages in this conversation → refresh
  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof getBrowserSupabase>["channel"]> | null = null;
    try {
      const supabase = getBrowserSupabase();
      channel = supabase
        .channel(`conv:${conversation.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` }, () => router.refresh())
        .subscribe();
    } catch { /* realtime optional */ }
    return () => { if (channel) getBrowserSupabase().removeChannel(channel); };
  }, [conversation.id, router]);

  // Backstop for realtime: pull new messages when the tab regains focus
  // (skip mid-send so an optimistic bubble isn't dropped before it commits).
  useFocusPoll(() => { if (!pending) router.refresh(); });

  function send() {
    const text = body.trim();
    if (!text) return;
    // Optimistic: render the message + clear the input instantly. The server
    // action runs in the background; router.refresh() then reconciles the temp
    // row with the canonical one. On failure we roll back and restore the input.
    const tempId = `temp-${Date.now()}`;
    const optimistic: MessageItem = {
      id: tempId,
      senderId: currentUserId,
      senderName: "",
      body: text,
      isSystem: false,
      isMine: true,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    start(async () => {
      const res = await sendMessageAction(conversation.id, text);
      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setBody(text);
        if (res.code === "auth") return router.push("/auth");
        return show(res.error, "error");
      }
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", minHeight: 420, background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, overflow: "hidden" }}>
      {/* header / mission context */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(24,32,59,.06)", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href={backHref} style={{ fontSize: 18, color: "var(--muted-1)", textDecoration: "none" }}>←</Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conversation.counterpartName}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            🎯 {conversation.missionTitle}{conversation.applicationStatus ? ` · ${conversation.applicationStatus}` : ""}
          </div>
        </div>
        {conversation.missionSlug && (
          <Link href={`/missions/${conversation.missionSlug}`} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--blue)" }}>View</Link>
        )}
      </div>

      {/* messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 18, background: "#fbfcfe", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--muted-3)", fontSize: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>💬</div>
            No messages yet — say hello.
          </div>
        ) : (
          messages.map((m) =>
            m.isSystem ? (
              <div key={m.id} style={{ alignSelf: "center", fontSize: 12, color: "var(--muted-2)", background: "#eef0f5", padding: "6px 12px", borderRadius: 999, maxWidth: "85%", textAlign: "center" }}>
                {m.body}
              </div>
            ) : (
              <div key={m.id} style={{ alignSelf: m.isMine ? "flex-end" : "flex-start", maxWidth: "78%" }}>
                <div style={{
                  background: m.isMine ? "var(--coral, #ff6f5e)" : "#fff",
                  color: m.isMine ? "#fff" : "var(--ink)",
                  border: m.isMine ? "none" : "1px solid rgba(24,32,59,.08)",
                  borderRadius: 14, padding: "9px 13px", fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word",
                  boxShadow: "0 6px 16px -12px rgba(24,32,59,.4)",
                }}>
                  {m.body}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted-3)", marginTop: 3, textAlign: m.isMine ? "right" : "left" }}>
                  {m.isMine ? "" : `${m.senderName} · `}{fmtTime(m.createdAt)}
                </div>
              </div>
            )
          )
        )}
        <div ref={endRef} />
      </div>

      {/* composer */}
      {conversation.status === "active" ? (
        <div style={{ borderTop: "1px solid rgba(24,32,59,.06)", padding: 12, display: "flex", gap: 9, alignItems: "flex-end", background: "#fff" }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Write a message…"
            rows={1}
            maxLength={2000}
            style={{ flex: 1, resize: "none", maxHeight: 120, border: "1px solid rgba(24,32,59,.14)", borderRadius: 12, padding: "10px 12px", fontSize: 14, outline: "none", background: "#fbfcfe", fontFamily: "inherit" }}
          />
          <button type="button" onClick={send} disabled={pending || !body.trim()} className="btn-coral"
            style={{ flexShrink: 0, color: "#fff", fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 12, border: "none", cursor: pending || !body.trim() ? "not-allowed" : "pointer", opacity: pending || !body.trim() ? 0.6 : 1 }}>
            Send
          </button>
        </div>
      ) : (
        <div style={{ borderTop: "1px solid rgba(24,32,59,.06)", padding: 14, textAlign: "center", fontSize: 13, color: "var(--muted-3)", background: "#fff" }}>
          This conversation is {conversation.status}.
        </div>
      )}

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
