"use client";

/**
 * Organizer attendance roster for one mission. Per-volunteer check-in/out,
 * complete (with hours), no-show, excused, edit hours/note, and issue/view
 * certificate. Mirrors the applications-review toast + useTransition pattern.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import {
  markCheckedInAction,
  markCheckedOutAction,
  markCompletedAction,
  markNoShowAction,
  markExcusedAction,
  updateHoursAction,
  updateNoteAction,
  issueCertificateAction,
} from "@/app/manage/attendance/actions";
import type { AttendanceRosterRow, AttendanceStatus } from "@/lib/data/attendance";

const STATUS_PILL: Record<AttendanceStatus, { label: string; bg: string; color: string }> = {
  registered: { label: "Registered", bg: "#f1f3f8", color: "#5a6685" },
  checked_in: { label: "Checked in", bg: "#dff6ea", color: "#147a57" },
  checked_out: { label: "Checked out", bg: "#e2effd", color: "#2b6cb0" },
  completed: { label: "Completed", bg: "#dff6ea", color: "#147a57" },
  no_show: { label: "No-show", bg: "#ffeae6", color: "#c0392b" },
  cancelled: { label: "Cancelled", bg: "#f1f3f8", color: "#5a6685" },
  excused: { label: "Excused", bg: "#fff0dd", color: "#b9651b" },
};

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "V";
}

function chip(bg: string, color: string, disabled: boolean): React.CSSProperties {
  return { fontSize: 12.5, fontWeight: 700, color, background: bg, padding: "7px 11px", borderRadius: 9, border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1 };
}

export default function AttendanceRoster({
  missionId,
  estimatedHours,
  roster,
}: {
  missionId: string;
  estimatedHours: number | null;
  roster: AttendanceRosterRow[];
}) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  function run(key: string, fn: () => Promise<{ ok: boolean; error?: string; code?: string }>, ok: string) {
    setBusyKey(key);
    start(async () => {
      const res = await fn();
      setBusyKey(null);
      if (!res.ok) {
        if (res.code === "auth" || res.code === "role") return router.push("/auth?redirect=/manage/attendance");
        return show(res.error ?? "Something went wrong.", "error");
      }
      show(ok, "success");
      router.refresh();
    });
  }

  function complete(r: AttendanceRosterRow) {
    if (!r.attendanceId) return;
    const def = r.hoursCredited ?? estimatedHours ?? 0;
    const input = window.prompt(`Confirm hours for ${r.displayName}:`, String(def));
    if (input === null) return;
    const hours = Number(input);
    if (!Number.isFinite(hours) || hours < 0) return show("Enter a valid number of hours.", "error");
    run(r.volunteerId, () => markCompletedAction(r.attendanceId as string, hours), "Attendance confirmed.");
  }

  function editHours(r: AttendanceRosterRow) {
    if (!r.attendanceId) return;
    const input = window.prompt(`Hours for ${r.displayName}:`, String(r.hoursCredited ?? estimatedHours ?? 0));
    if (input === null) return;
    const hours = Number(input);
    if (!Number.isFinite(hours) || hours < 0) return show("Enter a valid number of hours.", "error");
    run(r.volunteerId, () => updateHoursAction(r.attendanceId as string, hours), "Hours updated.");
  }

  function editNote(r: AttendanceRosterRow) {
    if (!r.attendanceId) return;
    const input = window.prompt(`Organizer note for ${r.displayName} (private):`, r.organizerNote ?? "");
    if (input === null) return;
    run(r.volunteerId, () => updateNoteAction(r.attendanceId as string, input), "Note saved.");
  }

  function issue(r: AttendanceRosterRow) {
    if (!r.attendanceId) return;
    run(r.volunteerId, () => issueCertificateAction(r.attendanceId as string), "Certificate issued.");
  }

  if (roster.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "40px 24px", textAlign: "center", color: "var(--muted-3)" }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>🧑‍🤝‍🧑</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)" }}>No approved volunteers yet</div>
        <p style={{ fontSize: 13.5, marginTop: 4 }}>Approve applicants first — they’ll appear here to check in.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {roster.map((r) => {
        const busy = busyKey === r.volunteerId;
        const pill = STATUS_PILL[r.status];
        return (
          <div key={r.volunteerId} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#bca6ff,#7a6bf5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
              {initials(r.displayName)}
            </span>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>{r.displayName}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, ...pill }}>{pill.label}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginTop: 2 }}>
                {r.hoursCredited != null ? `${r.hoursCredited}h credited` : "Hours not set"}
                {r.checkInMethod ? ` · via ${r.checkInMethod}` : ""}
                {r.organizerNote ? " · 📝 note" : ""}
              </div>
            </div>

            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {(r.status === "registered" || r.status === "no_show" || r.status === "excused") && (
                <button type="button" disabled={busy} style={chip("var(--mint)", "#fff", busy)} onClick={() => run(r.volunteerId, () => markCheckedInAction(missionId, r.volunteerId), "Volunteer checked in.")}>Check in</button>
              )}
              {r.status === "checked_in" && (
                <button type="button" disabled={busy} style={chip("#e2effd", "#2b6cb0", busy)} onClick={() => run(r.volunteerId, () => markCheckedOutAction(missionId, r.volunteerId), "Volunteer checked out.")}>Check out</button>
              )}
              {(r.status === "checked_in" || r.status === "checked_out") && (
                <button type="button" disabled={busy} style={chip("#dff6ea", "#147a57", busy)} onClick={() => complete(r)}>Complete</button>
              )}
              {r.status === "completed" && (
                r.certificateId ? (
                  <Link href={`/certificates/${r.certificateId}`} style={{ ...chip("#f1f3f8", "var(--muted-1)", false), textDecoration: "none" }}>View certificate</Link>
                ) : (
                  <button type="button" disabled={busy} style={chip("var(--coral)", "#fff", busy)} onClick={() => issue(r)}>Issue certificate</button>
                )
              )}
              {(r.status === "checked_out" || r.status === "completed") && (
                <button type="button" disabled={busy} style={chip("#f1f3f8", "var(--muted-1)", busy)} onClick={() => editHours(r)}>Edit hours</button>
              )}
              {(r.status === "registered" || r.status === "checked_in") && (
                <button type="button" disabled={busy} style={chip("#ffeae6", "#c0392b", busy)} onClick={() => run(r.volunteerId, () => markNoShowAction(missionId, r.volunteerId), "Marked no-show.")}>No-show</button>
              )}
              <button type="button" disabled={busy} style={chip("#fff", "var(--muted-3)", busy)} onClick={() => editNote(r)} title="Organizer note">📝</button>
            </div>
          </div>
        );
      })}
      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
