"use client";

/**
 * Private mission details subform (edit page only). Exact address & contact info
 * are visible to approved volunteers / org members — NEVER on public pages. The
 * server action (upsertMissionPrivateDetailsAction) is the gate; RLS is final.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { upsertMissionPrivateDetailsAction } from "@/app/manage/missions/actions";
import type { MissionPrivateDetailRow } from "@/types/database";

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#3a425e", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", border: "1px solid rgba(24,32,59,.14)",
  borderRadius: 12, padding: "11px 13px", fontSize: 14, outline: "none", background: "#fbfcfe",
};

export default function PrivateDetailsForm({
  missionId,
  details,
}: {
  missionId: string;
  details: MissionPrivateDetailRow | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  const [f, setF] = useState({
    exact_address: details?.exact_address ?? "",
    private_meeting_instructions: details?.private_meeting_instructions ?? "",
    private_contact_name: details?.private_contact_name ?? "",
    private_contact_phone: details?.private_contact_phone ?? "",
    private_contact_email: details?.private_contact_email ?? "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  function save() {
    start(async () => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(f)) if (v.trim()) fd.set(k, v.trim());
      const res = await upsertMissionPrivateDetailsAction(missionId, fd);
      if (!res.ok) return show(res.error, "error");
      show("Private details saved.", "success");
      router.refresh();
    });
  }

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.06)", padding: 22 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Private details 🔒</h3>
      <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "0 0 16px" }}>
        Shared with approved volunteers and your team only. Never shown on public pages.
      </p>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle} htmlFor="exact_address">Exact address</label>
        <input id="exact_address" style={inputStyle} value={f.exact_address} onChange={(e) => set("exact_address", e.target.value)} placeholder="1234 Garden St, San Francisco, CA" />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle} htmlFor="private_meeting_instructions">Meeting instructions</label>
        <textarea id="private_meeting_instructions" style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={f.private_meeting_instructions} onChange={(e) => set("private_meeting_instructions", e.target.value)} placeholder="Meet at the north gate; look for the green tent." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="form-2col">
        <div>
          <label style={labelStyle} htmlFor="private_contact_name">Contact name</label>
          <input id="private_contact_name" style={inputStyle} value={f.private_contact_name} onChange={(e) => set("private_contact_name", e.target.value)} placeholder="Sam Rivera" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="private_contact_phone">Contact phone</label>
          <input id="private_contact_phone" style={inputStyle} value={f.private_contact_phone} onChange={(e) => set("private_contact_phone", e.target.value)} placeholder="+1 555 012 3456" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="private_contact_email">Contact email</label>
          <input id="private_contact_email" type="email" style={inputStyle} value={f.private_contact_email} onChange={(e) => set("private_contact_email", e.target.value)} placeholder="day-of@org.com" />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button type="button" disabled={pending} onClick={save} style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-1)", background: "#fff", border: "1px solid rgba(24,32,59,.14)", padding: "11px 20px", borderRadius: 12, cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1 }}>
          {pending ? "Saving…" : "Save private details"}
        </button>
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
