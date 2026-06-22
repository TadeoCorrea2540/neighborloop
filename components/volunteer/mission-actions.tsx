"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToMissionAction, withdrawApplicationAction } from "@/app/(volunteer)/actions";
import AuthToast from "@/components/auth/auth-toast";
import SaveButton from "@/components/volunteer/save-button";
import type { ApplicationStatus } from "@/types/database";

type Role = "anon" | "volunteer" | "organizer" | "admin";

const STATUS_BANNER: Partial<Record<ApplicationStatus, { label: string; bg: string; color: string }>> = {
  pending: { label: "Application pending review", bg: "#fff0dd", color: "#b9651b" },
  approved: { label: "You’re approved 🎉", bg: "#dff6ea", color: "#147a57" },
  waitlisted: { label: "You’re on the waitlist", bg: "#e2effd", color: "#2b6cb0" },
  declined: { label: "Application not selected", bg: "#f1f3f8", color: "#5a6685" },
  withdrawn: { label: "You withdrew this application", bg: "#f1f3f8", color: "#5a6685" },
  cancelled: { label: "This application was cancelled", bg: "#f1f3f8", color: "#5a6685" },
};

const coralBtn: React.CSSProperties = {
  width: "100%",
  color: "#fff",
  textAlign: "center",
  fontWeight: 700,
  fontSize: 16,
  padding: 14,
  borderRadius: 13,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
};

const ghostBtn: React.CSSProperties = {
  flex: 1,
  textAlign: "center",
  fontSize: 13.5,
  fontWeight: 600,
  color: "var(--ink)",
  border: "1px solid rgba(24,32,59,.12)",
  padding: 11,
  borderRadius: 12,
  background: "#fff",
  cursor: "pointer",
};

export default function MissionActions({
  missionId,
  missionSlug,
  role,
  initialStatus,
  initialApplicationId,
  initialSaved,
}: {
  missionId: string;
  missionSlug: string;
  role: Role;
  initialStatus: ApplicationStatus | null;
  initialApplicationId: string | null;
  initialSaved: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus | null>(initialStatus);
  const [appId, setAppId] = useState<string | null>(initialApplicationId);
  const [showMsg, setShowMsg] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  const isActive = status === "pending" || status === "approved" || status === "waitlisted";
  const canApply = !isActive; // null, withdrawn, declined, cancelled

  function submitApply() {
    start(async () => {
      const res = await applyToMissionAction(missionId, message);
      if (!res.ok) {
        if (res.code === "auth") {
          router.push(`/auth?next=${encodeURIComponent(`/missions/${missionSlug}`)}`);
          return;
        }
        show(res.error, "error");
        return;
      }
      setStatus(res.status);
      setAppId(res.applicationId);
      setShowMsg(false);
      setMessage("");
      show(
        res.status === "approved"
          ? "You’re in! See you there."
          : res.status === "waitlisted"
          ? "Added to the waitlist."
          : "Application sent — the organizer will review it.",
        "success"
      );
      router.refresh();
    });
  }

  function withdraw() {
    if (!appId) return;
    start(async () => {
      const res = await withdrawApplicationAction(appId);
      if (!res.ok) {
        if (res.code === "auth") {
          router.push(`/auth?next=${encodeURIComponent(`/missions/${missionSlug}`)}`);
          return;
        }
        show(res.error, "error");
        return;
      }
      setStatus("withdrawn");
      show("Application withdrawn.", "success");
      router.refresh();
    });
  }

  // ---- organizer / admin: no volunteer actions ----
  if (role === "organizer" || role === "admin") {
    return (
      <div
        style={{
          background: "#f1f3f8",
          borderRadius: 13,
          padding: "13px 14px",
          fontSize: 13.5,
          color: "var(--muted-1)",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        Volunteer actions are available from a volunteer account.
      </div>
    );
  }

  // ---- anonymous ----
  if (role === "anon") {
    return (
      <>
        <button
          type="button"
          className="btn-coral"
          style={coralBtn}
          onClick={() => router.push(`/auth?next=${encodeURIComponent(`/missions/${missionSlug}`)}`)}
        >
          Sign in to join →
        </button>
        <div style={{ marginTop: 11 }}>
          <SaveButton missionId={missionId} initialSaved={initialSaved} variant="full" />
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted-3)", textAlign: "center" }}>
          🔒 You’ll get a QR check-in code after joining
        </div>
      </>
    );
  }

  // ---- volunteer ----
  const banner = status ? STATUS_BANNER[status] : undefined;
  return (
    <>
      {banner && isActive && (
        <div
          style={{
            background: banner.bg,
            color: banner.color,
            borderRadius: 12,
            padding: "11px 14px",
            fontSize: 13.5,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 11,
          }}
        >
          {banner.label}
        </div>
      )}

      {canApply && !showMsg && (
        <button type="button" className="btn-coral" style={coralBtn} onClick={() => setShowMsg(true)}>
          {status ? "Apply again →" : "Apply / Join mission →"}
        </button>
      )}

      {canApply && showMsg && (
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            placeholder="Tell the organizer why you want to join (optional)"
            style={{
              width: "100%",
              boxSizing: "border-box",
              minHeight: 80,
              resize: "vertical",
              borderRadius: 12,
              border: "1px solid rgba(24,32,59,.16)",
              padding: "10px 12px",
              fontSize: 14,
              outline: "none",
              background: "#fbfcfe",
              marginBottom: 10,
            }}
          />
          <button
            type="button"
            className="btn-coral"
            style={{ ...coralBtn, opacity: pending ? 0.7 : 1, cursor: pending ? "not-allowed" : "pointer" }}
            disabled={pending}
            onClick={submitApply}
          >
            {pending ? "Submitting…" : "Submit application"}
          </button>
          <button
            type="button"
            style={{ ...ghostBtn, width: "100%", marginTop: 8 }}
            onClick={() => setShowMsg(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {isActive && (
        <button
          type="button"
          style={{ ...ghostBtn, width: "100%", color: "#c0392b", borderColor: "rgba(241,84,63,.4)", opacity: pending ? 0.7 : 1 }}
          disabled={pending}
          onClick={withdraw}
        >
          {pending ? "Withdrawing…" : "Withdraw application"}
        </button>
      )}

      <div style={{ marginTop: 11 }}>
        <SaveButton missionId={missionId} initialSaved={initialSaved} variant="full" />
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted-3)", textAlign: "center" }}>
        🔒 You’ll get a QR check-in code after joining
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </>
  );
}
