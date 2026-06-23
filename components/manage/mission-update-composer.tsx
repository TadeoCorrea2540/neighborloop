"use client";

/** Organizer mission-update composer → notifies approved volunteers. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { createMissionUpdateAction } from "@/app/manage/missions/[id]/updates/actions";

const TYPES = [
  { value: "general", label: "General" },
  { value: "schedule_change", label: "Schedule change" },
  { value: "location_change", label: "Location change" },
  { value: "reminder", label: "Reminder" },
  { value: "attendance", label: "Attendance" },
  { value: "thank_you", label: "Thank you" },
];

const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid rgba(24,32,59,.14)", borderRadius: 11, padding: "10px 12px", fontSize: 14, outline: "none", background: "#fbfcfe" };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#3a425e", display: "block", marginBottom: 6 };

export default function MissionUpdateComposer({ missionId, recipientCount }: { missionId: string; recipientCount: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("general");
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => { setToast({ msg, tone }); setSeq((n) => n + 1); };

  function send() {
    if (!title.trim() || !body.trim()) return show("Add a title and message.", "error");
    start(async () => {
      const fd = new FormData();
      fd.set("title", title.trim());
      fd.set("body", body.trim());
      fd.set("update_type", type);
      const res = await createMissionUpdateAction(missionId, fd);
      if (!res.ok) {
        if (res.code === "auth" || res.code === "role") return router.push("/auth?redirect=/manage/missions");
        return show(res.error, "error");
      }
      setTitle(""); setBody(""); setType("general");
      show("Mission update sent to approved volunteers.", "success");
      router.refresh();
    });
  }

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.06)", padding: 22, marginBottom: 18 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Post an update</h3>
      <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "0 0 16px" }}>
        Sent to <strong>{recipientCount}</strong> approved volunteer{recipientCount === 1 ? "" : "s"} as an in-app notification.
      </p>
      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="u-title">Title</label>
        <input id="u-title" style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Meeting point changed" maxLength={140} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="u-body">Message</label>
        <textarea id="u-body" style={{ ...input, minHeight: 90, resize: "vertical" }} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do volunteers need to know?" />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <label style={label} htmlFor="u-type">Type</label>
          <select id="u-type" style={{ ...input, width: "auto" }} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <button type="button" onClick={send} disabled={pending} className="btn-coral" style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, color: "#fff", padding: "11px 20px", borderRadius: 12, border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)" }}>
          {pending ? "Sending…" : "Send update"}
        </button>
      </div>
      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
