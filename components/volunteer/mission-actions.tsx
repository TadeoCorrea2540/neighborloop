"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applyToMissionAction, withdrawApplicationAction } from "@/app/(volunteer)/actions";
import AuthToast from "@/components/auth/auth-toast";
import SaveButton from "@/components/volunteer/save-button";
import type { ApplicationStatus } from "@/types/database";
import type { AttendanceStatus } from "@/lib/data/attendance";

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
  attendanceStatus = null,
  hoursCredited = null,
  certificateId = null,
}: {
  missionId: string;
  missionSlug: string;
  role: Role;
  initialStatus: ApplicationStatus | null;
  initialApplicationId: string | null;
  initialSaved: boolean;
  attendanceStatus?: AttendanceStatus | null;
  hoursCredited?: number | null;
  certificateId?: string | null;
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

  // ---- volunteer: already completed this mission → celebratory, terminal state ----
  if (attendanceStatus === "completed") {
    return (
      <div
        style={{
          background: "linear-gradient(165deg,#eafaf2,#ffffff)",
          border: "1px solid rgba(31,174,130,.25)",
          borderRadius: 16,
          padding: "18px 18px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#8fe3bd,#1fae82)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 8px 18px -8px rgba(31,174,130,.7)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4 4 10-10" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: "-.01em", color: "var(--ink)" }}>
            Mission completed
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#4a5475", lineHeight: 1.5, margin: "0 auto", maxWidth: 240 }}>
          Thanks for showing up and making a difference.
          {hoursCredited != null && (
            <>
              {" "}
              <strong style={{ color: "#147a57" }}>
                {hoursCredited} {hoursCredited === 1 ? "hour" : "hours"}
              </strong>{" "}
              credited.
            </>
          )}
        </p>

        <div style={{ marginTop: 14 }}>
          {certificateId ? (
            <Link
              href={`/certificates/${certificateId}`}
              className="btn-coral"
              style={{
                display: "block",
                color: "#fff",
                textAlign: "center",
                fontWeight: 700,
                fontSize: 14,
                padding: 11,
                borderRadius: 12,
                textDecoration: "none",
                boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)",
              }}
            >
              🏅 View your certificate
            </Link>
          ) : (
            <div
              style={{
                fontSize: 12.5,
                color: "var(--muted-2)",
                background: "#fff",
                border: "1px dashed rgba(24,32,59,.16)",
                borderRadius: 11,
                padding: "10px 12px",
                lineHeight: 1.45,
              }}
            >
              Your certificate will appear here once the organizer issues it.
            </div>
          )}
        </div>

        <Link
          href="/impact"
          style={{ display: "inline-block", marginTop: 11, fontSize: 12.5, fontWeight: 600, color: "var(--muted-1)" }}
        >
          See your impact →
        </Link>
      </div>
    );
  }

  // ---- volunteer: checked in / out (attended, awaiting confirmation) ----
  if (attendanceStatus === "checked_in" || attendanceStatus === "checked_out") {
    const checkedOut = attendanceStatus === "checked_out";
    return (
      <div
        style={{
          background: "#e2effd",
          border: "1px solid rgba(43,108,176,.2)",
          borderRadius: 16,
          padding: "20px 18px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 30, marginBottom: 6 }}>{checkedOut ? "🙌" : "✅"}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#2b6cb0" }}>
          {checkedOut ? "Thanks for attending!" : "You’re checked in"}
        </div>
        <p style={{ fontSize: 13.5, color: "#4a5475", lineHeight: 1.5, margin: "6px 0 0" }}>
          {checkedOut
            ? "Your organizer will confirm your hours shortly."
            : "Enjoy the mission — your organizer has you on the roster."}
        </p>
      </div>
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
