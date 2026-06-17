"use client";

import { useState } from "react";
import { CONVERSATIONS } from "@/lib/data";

/** mission-context shown above the thread, keyed by org name */
const MISSION_CONTEXT: Record<
  string,
  { tint: string; art: string; emoji: string; accent: string; label: string }
> = {
  BrightMinds: {
    tint: "#ece7ff",
    art: "linear-gradient(135deg,#e6dcff,#bca6ff)",
    emoji: "📚",
    accent: "#7a6bf5",
    label: "After-School Reading Buddy · Wed, Jun 25",
  },
  "Blue Coast Project": {
    tint: "#e2effd",
    art: "linear-gradient(135deg,#cfe6ff,#8bc0ff)",
    emoji: "🌊",
    accent: "#3a8bf0",
    label: "Ocean Beach Cleanup · Sun, Jun 22",
  },
  "Whiskers Rescue": {
    tint: "#dff6ea",
    art: "linear-gradient(135deg,#d6f6e6,#8fe3bd)",
    emoji: "🐾",
    accent: "#1fae82",
    label: "Cat Shelter Care Crew · Fri, Jun 27",
  },
  GreenRoots: {
    tint: "#eef7da",
    art: "linear-gradient(135deg,#eaf7cf,#c2e58a)",
    emoji: "🌱",
    accent: "#7cb342",
    label: "Community Garden Planting · Sat, Jun 28",
  },
  "Golden Years Co.": {
    tint: "#ffece4",
    art: "linear-gradient(135deg,#ffe0d6,#ffb09a)",
    emoji: "🤝",
    accent: "#ff7a5c",
    label: "Sunshine Senior Visits · Thu, Jun 26",
  },
};

export default function Messages() {
  const [activeChat, setActiveChat] = useState(0);
  const cur = CONVERSATIONS[activeChat];
  const ctx = MISSION_CONTEXT[cur.name] ?? MISSION_CONTEXT.BrightMinds;

  return (
    <div style={{ height: "calc(100vh - 160px)" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 40px 80px -50px rgba(24,32,59,.55)",
          border: "1px solid rgba(24,32,59,.06)",
          display: "grid",
          gridTemplateColumns: "330px 1fr",
          height: "100%",
        }}
        className="two-pane"
      >
        {/* conversation list */}
        <div
          style={{
            borderRight: "1px solid rgba(24,32,59,.06)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div style={{ padding: "20px 18px 14px" }}>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 14 }}>Messages</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#f1f3f8",
                borderRadius: 12,
                padding: "10px 13px",
                color: "#9aa3bd",
                fontSize: 13.5,
              }}
            >
              🔎 Search conversations…
            </div>
          </div>
          <div
            style={{
              padding: "0 12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              overflow: "auto",
            }}
          >
            {CONVERSATIONS.map((c, i) => {
              const active = i === activeChat;
              return (
                <div
                  key={c.name}
                  onClick={() => setActiveChat(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "11px 12px",
                    borderRadius: 14,
                    cursor: "pointer",
                    transition: ".15s",
                    background: active ? "#fff0ec" : "transparent",
                  }}
                >
                  <span
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      background: `linear-gradient(135deg,${c.c1},${c.c2})`,
                    }}
                  >
                    {c.emoji}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                      <span style={{ fontSize: 11.5, color: "#9aa3bd" }}>{c.time}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "#9aa3bd",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.last}
                    </div>
                  </div>
                  {c.unread && (
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#ff6f5e",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* chat panel */}
        <div
          style={{ display: "flex", flexDirection: "column", background: "#fbfcfe", minHeight: 0 }}
        >
          {/* chat header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 22px",
              borderBottom: "1px solid rgba(24,32,59,.06)",
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                  background: `linear-gradient(135deg,${cur.c1},${cur.c2})`,
                }}
              >
                {cur.emoji}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{cur.name}</div>
                <div style={{ fontSize: 12, color: "#1fae82", fontWeight: 600 }}>
                  ● Usually replies in a few hours
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 18, color: "#9aa3bd" }}>
              <span>📞</span>
              <span>⋯</span>
            </div>
          </div>

          {/* mission context */}
          <div
            style={{
              margin: "16px 22px 0",
              background: ctx.tint,
              borderRadius: 15,
              padding: "13px 16px",
              display: "flex",
              alignItems: "center",
              gap: 13,
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: ctx.art,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {ctx.emoji}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: ctx.accent }}>
                MISSION CONTEXT
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{ctx.label}</div>
            </div>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: ctx.accent,
                background: "#fff",
                padding: "7px 13px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              View
            </span>
          </div>

          {/* bubbles */}
          <div
            style={{
              flex: 1,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              overflow: "auto",
              minHeight: 0,
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: 11.5,
                color: "#b3bace",
                fontWeight: 600,
              }}
            >
              TODAY
            </div>
            <div
              style={{
                alignSelf: "flex-start",
                maxWidth: "62%",
                background: "#fff",
                border: "1px solid rgba(24,32,59,.06)",
                borderRadius: "16px 16px 16px 4px",
                padding: "11px 15px",
                fontSize: 14,
                color: "#3a425e",
                boxShadow: "0 6px 16px -12px rgba(24,32,59,.4)",
              }}
            >
              Hi Maya! Thanks so much for signing up for the reading session 📚
            </div>
            <div
              style={{
                alignSelf: "flex-start",
                maxWidth: "62%",
                background: "#fff",
                border: "1px solid rgba(24,32,59,.06)",
                borderRadius: "16px 16px 16px 4px",
                padding: "11px 15px",
                fontSize: 14,
                color: "#3a425e",
                boxShadow: "0 6px 16px -12px rgba(24,32,59,.4)",
              }}
            >
              Could you arrive 10 mins early for a quick orientation?
            </div>
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: "62%",
                background: "#ff6f5e",
                color: "#fff",
                borderRadius: "16px 16px 4px 16px",
                padding: "11px 15px",
                fontSize: 14,
                boxShadow: "0 8px 18px -10px rgba(255,111,94,.7)",
              }}
            >
              Of course! I&apos;ll be there at 3:20. So excited 🎉
            </div>
            <div
              style={{
                alignSelf: "flex-start",
                maxWidth: "62%",
                background: "#fff",
                border: "1px solid rgba(24,32,59,.06)",
                borderRadius: "16px 16px 16px 4px",
                padding: "11px 15px",
                fontSize: 14,
                color: "#3a425e",
                boxShadow: "0 6px 16px -12px rgba(24,32,59,.4)",
              }}
            >
              Perfect — see you then! Your QR check-in code is ready in the app ✅
            </div>
          </div>

          {/* composer */}
          <div
            style={{
              padding: "14px 22px 18px",
              background: "#fff",
              borderTop: "1px solid rgba(24,32,59,.06)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20, color: "#9aa3bd" }}>📎</span>
            <div
              style={{
                flex: 1,
                background: "#f1f3f8",
                borderRadius: 13,
                padding: "12px 15px",
                color: "#9aa3bd",
                fontSize: 14,
              }}
            >
              Write a message…
            </div>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: "#ff6f5e",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                boxShadow: "0 10px 20px -10px rgba(255,111,94,.8)",
                cursor: "pointer",
              }}
            >
              ➤
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
