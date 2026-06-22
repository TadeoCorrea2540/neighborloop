"use client";

import { useState, useTransition } from "react";
import LogoutButton from "@/components/auth/logout-button";
import AuthToast from "@/components/auth/auth-toast";
import { updateVolunteerProfileAction } from "@/app/(volunteer)/actions";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--ink, #18203b)",
  marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: 11,
  border: "1px solid rgba(24,32,59,.16)",
  fontSize: 14.5,
  outline: "none",
  background: "#fbfcfe",
};
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  border: "1px solid rgba(24,32,59,.06)",
  padding: 22,
  marginBottom: 18,
};

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        background: on ? "#1fae82" : "#d4d9e4",
        position: "relative",
        cursor: "pointer",
        transition: ".18s",
        flexShrink: 0,
      }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: ".18s" }} />
    </span>
  );
}

export default function SettingsClient({
  email,
  initial,
}: {
  email: string;
  initial: {
    displayName: string;
    bio: string;
    city: string;
    countryCode: string;
    interests: string;
    isProfilePublic: boolean;
  };
}) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [city, setCity] = useState(initial.city);
  const [countryCode, setCountryCode] = useState(initial.countryCode);
  const [interests, setInterests] = useState(initial.interests);
  const [isPublic, setIsPublic] = useState(initial.isProfilePublic);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [smsNotif, setSmsNotif] = useState(true);

  function save() {
    start(async () => {
      const fd = new FormData();
      fd.set("display_name", displayName);
      fd.set("bio", bio);
      fd.set("city", city);
      fd.set("country_code", countryCode);
      fd.set("interests", interests);
      if (isPublic) fd.set("is_profile_public", "on");
      const res = await updateVolunteerProfileAction(fd);
      if (!res.ok) {
        show(res.error, "error");
        return;
      }
      show("Profile saved.", "success");
    });
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 18px", letterSpacing: "-.02em" }}>Settings</h2>

      {/* Profile */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Profile information</div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle} htmlFor="s-name">Display name</label>
          <input id="s-name" style={inputStyle} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle} htmlFor="s-email">Email</label>
          <input id="s-email" style={{ ...inputStyle, background: "#f1f3f8", color: "var(--muted-2)" }} value={email} disabled readOnly />
          <div style={{ fontSize: 12, color: "var(--muted-3)", marginTop: 4 }}>Email is managed by your account and can’t be changed here.</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle} htmlFor="s-bio">Bio</label>
          <textarea id="s-bio" style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell organizers a bit about yourself" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle} htmlFor="s-city">City</label>
            <input id="s-city" style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} placeholder="San Francisco" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="s-cc">Country</label>
            <input id="s-cc" style={inputStyle} value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="US" maxLength={8} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle} htmlFor="s-int">Causes you care about</label>
          <input id="s-int" style={inputStyle} value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Food, Animals, Tutoring (comma separated)" />
        </div>

        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span>
            <span style={{ fontSize: 14.5, fontWeight: 600, display: "block" }}>Public profile</span>
            <span style={{ fontSize: 12.5, color: "#9aa3bd" }}>Let organizations discover your volunteer profile</span>
          </span>
          <Toggle on={isPublic} onClick={() => setIsPublic((v) => !v)} />
        </label>

        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-coral"
          style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, padding: "11px 20px", borderRadius: 12, border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1 }}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Notifications (local preference UI) */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Notification preferences</div>
        {[
          { label: "Email notifications", desc: "Mission reminders and updates", on: emailNotif, set: setEmailNotif },
          { label: "Push notifications", desc: "Real-time alerts on your device", on: pushNotif, set: setPushNotif },
          { label: "SMS reminders", desc: "Texts the day before a mission", on: smsNotif, set: setSmsNotif },
        ].map((n) => (
          <div key={n.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{n.label}</div>
              <div style={{ fontSize: 12.5, color: "#9aa3bd" }}>{n.desc}</div>
            </div>
            <Toggle on={n.on} onClick={() => n.set((v) => !v)} />
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Sign out</div>
          <div style={{ fontSize: 12.5, color: "#9aa3bd", marginTop: 2 }}>End your session on this device.</div>
        </div>
        <LogoutButton
          label="Sign out"
          style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", border: "1.5px solid rgba(24,32,59,.18)", padding: "10px 18px", borderRadius: 12, background: "#fff" }}
        />
      </div>

      {/* Danger */}
      <div style={{ ...card, border: "1px solid rgba(241,84,63,.25)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#f1543f" }}>Delete account</div>
          <div style={{ fontSize: 12.5, color: "#9aa3bd", marginTop: 2 }}>Permanently remove your profile. This can’t be undone.</div>
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#f1543f", border: "1.5px solid rgba(241,84,63,.4)", padding: "10px 18px", borderRadius: 12, cursor: "not-allowed", opacity: 0.6 }} title="Coming soon">
          Delete
        </span>
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
