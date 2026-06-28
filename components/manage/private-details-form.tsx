"use client";

/**
 * Private mission details subform (edit page only). Exact address & contact info
 * are visible to approved volunteers / org members — NEVER on public pages. The
 * server action (upsertMissionPrivateDetailsAction) is the gate; RLS is final.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import Icon from "@/components/icons";
import { upsertMissionPrivateDetailsAction } from "@/app/manage/missions/actions";
import type { MissionPrivateDetailRow } from "@/types/database";

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
    <>
      <div className="mf-private-head">
        <div>
          <div className="mf-private-title-row">
            <h3 className="mf-section-title">Private details</h3>
            <Icon name="lock" size={17} aria-hidden />
          </div>
          <p className="mf-section-hint" style={{ marginBottom: 0 }}>
            Only approved volunteers and your organization team can see this information.
          </p>
        </div>
        <span className="mf-private-pill">Private</span>
      </div>

      <p className="mf-private-bridge">
        Public mission info helps volunteers decide whether to apply. Private details are shared only after approval.
      </p>

      <div className="mf-field">
        <label className="mf-label" htmlFor="exact_address">Exact address</label>
        <input
          id="exact_address"
          className="mf-input"
          value={f.exact_address}
          onChange={(e) => set("exact_address", e.target.value)}
          placeholder="1234 Garden St, San Francisco, CA"
        />
      </div>

      <div className="mf-field">
        <label className="mf-label" htmlFor="private_meeting_instructions">Meeting instructions</label>
        <textarea
          id="private_meeting_instructions"
          className="mf-textarea mf-textarea--sm"
          value={f.private_meeting_instructions}
          onChange={(e) => set("private_meeting_instructions", e.target.value)}
          placeholder="Meet at the north gate; look for the green tent."
        />
      </div>

      <div className="mf-private-grid">
        <div className="mf-field">
          <label className="mf-label" htmlFor="private_contact_name">Contact name</label>
          <input
            id="private_contact_name"
            className="mf-input"
            value={f.private_contact_name}
            onChange={(e) => set("private_contact_name", e.target.value)}
            placeholder="Sam Rivera"
          />
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="private_contact_phone">Contact phone</label>
          <input
            id="private_contact_phone"
            className="mf-input"
            value={f.private_contact_phone}
            onChange={(e) => set("private_contact_phone", e.target.value)}
            placeholder="+1 555 012 3456"
          />
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="private_contact_email">Contact email</label>
          <input
            id="private_contact_email"
            type="email"
            className="mf-input"
            value={f.private_contact_email}
            onChange={(e) => set("private_contact_email", e.target.value)}
            placeholder="day-of@org.com"
          />
        </div>
      </div>

      <div className="mf-private-actions">
        <button type="button" disabled={pending} onClick={save} className="mf-btn-ghost">
          {pending ? "Saving…" : "Save private details"}
        </button>
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </>
  );
}
