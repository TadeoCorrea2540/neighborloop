"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { updateNotificationPreferencesAction } from "@/app/settings/notifications/actions";
import type { NotificationPreferences } from "@/lib/data/notification-preferences";

const TOGGLES: { key: keyof NotificationPreferences; field: string; label: string; hint: string }[] = [
  { key: "messagesEnabled", field: "messages_enabled", label: "Messages", hint: "When an organizer or volunteer messages you." },
  { key: "applicationUpdatesEnabled", field: "application_updates_enabled", label: "Application updates", hint: "Approved, waitlisted, or declined." },
  { key: "missionUpdatesEnabled", field: "mission_updates_enabled", label: "Mission updates", hint: "Announcements and changes from organizers." },
  { key: "missionRemindersEnabled", field: "mission_reminders_enabled", label: "Mission reminders", hint: "Before a mission you’re approved for." },
  { key: "attendanceUpdatesEnabled", field: "attendance_updates_enabled", label: "Attendance updates", hint: "Check-in and confirmed-hours updates." },
  { key: "certificateUpdatesEnabled", field: "certificate_updates_enabled", label: "Certificates", hint: "When a certificate is issued to you." },
];

function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      onClick={disabled ? undefined : onClick}
      style={{
        width: 44, height: 26, borderRadius: 999, padding: 3, flexShrink: 0,
        background: on ? "#1fae82" : "#d4d9e4", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: ".15s", display: "inline-block",
      }}
    >
      <span style={{ display: "block", width: 20, height: 20, borderRadius: "50%", background: "#fff", transform: on ? "translateX(18px)" : "translateX(0)", transition: ".15s", boxShadow: "0 2px 5px rgba(0,0,0,.2)" }} />
    </span>
  );
}

export default function PreferencesForm({ initial }: { initial: NotificationPreferences }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(initial);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => { setToast({ msg, tone }); setSeq((n) => n + 1); };

  const row: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0", borderBottom: "1px solid rgba(24,32,59,.06)" };

  function save() {
    start(async () => {
      const fd = new FormData();
      for (const t of TOGGLES) if (prefs[t.key]) fd.set(t.field, "on");
      const res = await updateNotificationPreferencesAction(fd);
      if (!res.ok) {
        if (res.code === "auth") return router.push("/auth?redirect=/settings/notifications");
        return show(res.error, "error");
      }
      show("Notification preferences saved.", "success");
      router.refresh();
    });
  }

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.06)", padding: "8px 22px 22px" }}>
      {TOGGLES.map((t) => (
        <div key={t.field} style={row}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{t.label}</div>
            <div style={{ fontSize: 13, color: "var(--muted-3)", marginTop: 2 }}>{t.hint}</div>
          </div>
          <Toggle on={prefs[t.key] as boolean} onClick={() => setPrefs((p) => ({ ...p, [t.key]: !p[t.key] }))} />
        </div>
      ))}

      {/* future channels */}
      {[
        { label: "Email notifications", hint: "Get these by email." },
        { label: "Push notifications", hint: "Get these on your device." },
      ].map((c) => (
        <div key={c.label} style={row}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--muted-2)" }}>
              {c.label} <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-3)", background: "#f1f3f8", padding: "2px 8px", borderRadius: 999, marginLeft: 6 }}>Coming soon</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-3)", marginTop: 2 }}>{c.hint}</div>
          </div>
          <Toggle on={false} disabled />
        </div>
      ))}

      <p style={{ fontSize: 12.5, color: "var(--muted-3)", margin: "14px 0 0" }}>
        In-app notifications for essential events (verification, security) are always on.
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
        <button type="button" disabled={pending} onClick={save} className="btn-coral" style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "11px 22px", borderRadius: 12, border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)" }}>
          {pending ? "Saving…" : "Save preferences"}
        </button>
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
