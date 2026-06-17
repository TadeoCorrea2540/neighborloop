"use client";

import { useState } from "react";

const NAV = [
  { label: "👤 Profile", active: true },
  { label: "🔔 Notifications", active: false },
  { label: "🔒 Privacy", active: false },
  { label: "💚 Cause preferences", active: false },
  { label: "🔗 Connected accounts", active: false },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        background: on ? "#1fae82" : "#dfe3ec",
        position: "relative",
        cursor: "pointer",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 6px rgba(24,32,59,.25)",
          transform: on ? "translateX(20px)" : "translateX(0)",
          transition: "transform .2s",
        }}
      />
    </div>
  );
}

export default function Settings() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const [sms, setSms] = useState(true);

  return (
    <div
      style={{
        background: "#f6f8fc",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 40px 80px -50px rgba(24,32,59,.55)",
        border: "1px solid rgba(24,32,59,.06)",
        display: "grid",
        gridTemplateColumns: "230px 1fr",
        minHeight: 560,
      }}
      className="two-pane"
    >
      {/* settings nav */}
      <div
        style={{
          background: "#fff",
          borderRight: "1px solid rgba(24,32,59,.06)",
          padding: "24px 14px",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 18, padding: "0 8px 16px" }}>Settings</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {NAV.map((n) => (
            <div
              key={n.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 12px",
                borderRadius: 13,
                background: n.active ? "#fff0ec" : "transparent",
                color: n.active ? "#f1543f" : "#5a6685",
                cursor: "pointer",
              }}
            >
              {n.label}
            </div>
          ))}
        </div>
      </div>

      {/* panels */}
      <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* profile */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            border: "1px solid rgba(24,32,59,.05)",
            padding: 22,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Profile information</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "linear-gradient(135deg,#bca6ff,#7a6bf5)",
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#18203b" }}>Profile photo</div>
              <div style={{ fontSize: 12.5, color: "#9aa3bd" }}>PNG or JPG · max 5MB</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#fff",
                    background: "#18203b",
                    padding: "7px 13px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  Upload
                </span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#5a6685",
                    background: "#f1f3f8",
                    padding: "7px 13px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#3a425e" }}>Full name</label>
              <div
                style={{
                  marginTop: 7,
                  border: "1px solid rgba(24,32,59,.12)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 14,
                  color: "#18203b",
                  fontWeight: 600,
                }}
              >
                Maya Rivera
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#3a425e" }}>Email</label>
              <div
                style={{
                  marginTop: 7,
                  border: "1px solid rgba(24,32,59,.12)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 14,
                  color: "#5a6685",
                }}
              >
                maya@neighborhood.com
              </div>
            </div>
          </div>
        </div>

        {/* notifications */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            border: "1px solid rgba(24,32,59,.05)",
            padding: 22,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            Notification preferences
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid rgba(24,32,59,.06)",
            }}
          >
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Email notifications</div>
              <div style={{ fontSize: 12.5, color: "#9aa3bd" }}>
                Mission reminders, approvals &amp; messages
              </div>
            </div>
            <Toggle on={email} onClick={() => setEmail((v) => !v)} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid rgba(24,32,59,.06)",
            }}
          >
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Push notifications</div>
              <div style={{ fontSize: 12.5, color: "#9aa3bd" }}>Real-time alerts on your device</div>
            </div>
            <Toggle on={push} onClick={() => setPush((v) => !v)} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
            }}
          >
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>SMS reminders</div>
              <div style={{ fontSize: 12.5, color: "#9aa3bd" }}>Texts the day before a mission</div>
            </div>
            <Toggle on={sms} onClick={() => setSms((v) => !v)} />
          </div>
        </div>

        {/* danger */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            border: "1px solid rgba(241,84,63,.25)",
            padding: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1543f" }}>Delete account</div>
            <div style={{ fontSize: 12.5, color: "#9aa3bd", marginTop: 2 }}>
              Permanently remove your profile, hours and badges. This can&apos;t be undone.
            </div>
          </div>
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "#f1543f",
              border: "1.5px solid rgba(241,84,63,.4)",
              padding: "10px 18px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Delete
          </span>
        </div>
      </div>
    </div>
  );
}
