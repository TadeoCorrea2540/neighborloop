"use client";

/**
 * Admin verification decision controls (verification detail page). Approve /
 * reject (public reason required) / return-to-pending (internal note required).
 * Public reason is organizer-visible; internal note is admin-only.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import {
  approveVerificationAction,
  rejectVerificationAction,
  returnVerificationToPendingAction,
} from "@/app/admin/verification/actions";
import type { VerificationStatus } from "@/types/database";

type Mode = null | "approve" | "reject" | "return";

const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: "#3a425e", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", border: "1px solid rgba(24,32,59,.14)",
  borderRadius: 11, padding: "10px 12px", fontSize: 13.5, outline: "none", background: "#fbfcfe", minHeight: 64, resize: "vertical",
};
function btn(bg: string, color: string, disabled?: boolean): React.CSSProperties {
  return { fontSize: 13.5, fontWeight: 700, padding: "10px 16px", borderRadius: 11, border: "none", background: bg, color, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 };
}

export default function VerificationDecision({
  verificationId,
  status,
}: {
  verificationId: string;
  status: VerificationStatus;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [publicReason, setPublicReason] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  function run(fn: () => Promise<{ ok: boolean; error?: string; code?: string }>, successMsg: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        if (res.code === "auth" || res.code === "role") return router.push("/auth?redirect=/admin/verification");
        return show(res.error ?? "Couldn’t apply the decision.", "error");
      }
      setMode(null);
      setPublicReason("");
      setInternalNote("");
      show(successMsg, "success");
      router.refresh();
    });
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(24,32,59,.06)", padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Decision</div>
      <p style={{ fontSize: 12.5, color: "var(--muted-3)", margin: "0 0 14px" }}>
        Current status: <strong style={{ color: "var(--ink)" }}>{status}</strong>. The public reason is shown to the organizer; the internal note stays admin-only.
      </p>

      {mode === null && (
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {status !== "verified" && (
            <button type="button" style={btn("#1fae82", "#fff")} onClick={() => setMode("approve")}>✓ Approve</button>
          )}
          {status !== "rejected" && (
            <button type="button" style={btn("#ffeae6", "#c0392b")} onClick={() => setMode("reject")}>Reject</button>
          )}
          {status !== "pending" && (
            <button type="button" style={btn("#fff", "var(--muted-1)")} onClick={() => setMode("return")}>Return to pending</button>
          )}
        </div>
      )}

      {mode === "approve" && (
        <div>
          <label style={labelStyle}>Internal note <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(optional, admin-only)</span></label>
          <textarea style={inputStyle} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Anything to record for the team…" />
          <Actions pending={pending} confirmLabel="Confirm approve" confirmBg="#1fae82" onCancel={() => setMode(null)}
            onConfirm={() => run(() => approveVerificationAction(verificationId, internalNote || undefined), "Organization approved.")} />
        </div>
      )}

      {mode === "reject" && (
        <div>
          <label style={labelStyle}>Public reason <span style={{ color: "#c0392b" }}>*</span> <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(organizer sees this)</span></label>
          <textarea style={inputStyle} value={publicReason} onChange={(e) => setPublicReason(e.target.value)} placeholder="Respectful, user-facing reason (e.g. we couldn’t confirm your organization details)." />
          <label style={{ ...labelStyle, marginTop: 12 }}>Internal note <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(optional, admin-only)</span></label>
          <textarea style={inputStyle} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Private reasoning for the team…" />
          <Actions pending={pending} confirmLabel="Confirm reject" confirmBg="#c0392b" onCancel={() => setMode(null)}
            onConfirm={() => run(() => rejectVerificationAction(verificationId, publicReason, internalNote || undefined), "Organization rejected.")} />
        </div>
      )}

      {mode === "return" && (
        <div>
          <label style={labelStyle}>Internal note <span style={{ color: "#c0392b" }}>*</span></label>
          <textarea style={inputStyle} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Why is this being reopened?" />
          <Actions pending={pending} confirmLabel="Return to pending" confirmBg="#18203b" onCancel={() => setMode(null)}
            onConfirm={() => run(() => returnVerificationToPendingAction(verificationId, internalNote), "Returned to pending.")} />
        </div>
      )}

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}

function Actions({
  pending, confirmLabel, confirmBg, onConfirm, onCancel,
}: {
  pending: boolean; confirmLabel: string; confirmBg: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
      <button type="button" disabled={pending} onClick={onConfirm} style={btn(confirmBg, "#fff", pending)}>
        {pending ? "Working…" : confirmLabel}
      </button>
      <button type="button" disabled={pending} onClick={onCancel} style={btn("#f1f3f8", "var(--muted-1)", pending)}>Cancel</button>
    </div>
  );
}
