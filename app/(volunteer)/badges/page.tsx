"use client";

import { useState } from "react";
import { BADGES, VOL_STATS } from "@/lib/data";

export default function Badges() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>
            Badges &amp; Rewards
          </h2>
          <p style={{ margin: "4px 0 0", color: "#6b7799", fontSize: 14.5 }}>
            4 of 9 unlocked · 🔥 7-day streak
          </p>
        </div>
        <span
          onClick={() => setOpen(true)}
          style={{
            background: "#ff6f5e",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            padding: "11px 18px",
            borderRadius: 12,
            boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)",
            cursor: "pointer",
          }}
        >
          🎉 Claim next badge
        </span>
      </div>

      {/* June challenge progress banner */}
      <div
        style={{
          background: "linear-gradient(120deg,#fff0ec,#f0ecff)",
          borderRadius: 18,
          padding: 20,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#ff8a5c,#ff5e7a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            flexShrink: 0,
          }}
        >
          🔥
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>June challenge — 15 hours</div>
          <div style={{ fontSize: 13, color: "#5a6685", margin: "3px 0 8px" }}>
            {VOL_STATS.goalPct}% complete · keep it up!
          </div>
          <div
            style={{
              height: 9,
              borderRadius: 99,
              background: "rgba(255,255,255,.7)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${VOL_STATS.goalPct}%`,
                borderRadius: 99,
                background: "linear-gradient(90deg,#ff8a5c,#ff5e7a)",
                transition: "width .5s",
              }}
            />
          </div>
        </div>
      </div>

      {/* badge grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}
        className="card-grid-3"
      >
        {BADGES.map((b) => {
          const locked = !b.unlocked;
          return (
            <div
              key={b.name}
              style={{
                background: "#fff",
                border: "1px solid rgba(24,32,59,.06)",
                borderRadius: 18,
                padding: 20,
                textAlign: "center",
                opacity: locked ? 0.78 : 1,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  background: locked
                    ? "#eef0f5"
                    : "linear-gradient(135deg,#ffe08a,#ff9e3c)",
                  filter: locked ? "grayscale(.7)" : "none",
                  boxShadow: locked ? "none" : "0 10px 20px -12px rgba(255,158,60,.7)",
                }}
              >
                {b.emoji}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 12 }}>{b.name}</div>
              <div style={{ fontSize: 12, color: "#9aa3bd", marginTop: 2 }}>{b.sub}</div>
              {locked && (
                <div
                  style={{
                    height: 6,
                    borderRadius: 99,
                    background: "#eef0f5",
                    overflow: "hidden",
                    marginTop: 11,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${b.pct}%`,
                      borderRadius: 99,
                      background: "#bca6ff",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* claim modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(24,32,59,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "34px 32px",
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 40px 80px -40px rgba(24,32,59,.6)",
              animation: "popin .35s ease both",
            }}
          >
            <span
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 18,
                fontSize: 18,
                color: "#9aa3bd",
                cursor: "pointer",
              }}
            >
              ✕
            </span>
            <div
              style={{
                width: 88,
                height: 88,
                margin: "0 auto",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#ffe08a,#ff9e3c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 42,
                boxShadow: "0 16px 32px -14px rgba(255,158,60,.8)",
              }}
            >
              📚
            </div>
            <div style={{ fontWeight: 800, fontSize: 20, marginTop: 18 }}>Badge claimed!</div>
            <div style={{ fontSize: 14, color: "#6b7799", marginTop: 6, lineHeight: 1.5 }}>
              You earned the <strong>Bookworm</strong> badge for your tutoring missions. Keep up the
              amazing work 💚
            </div>
            <span
              onClick={() => setOpen(false)}
              style={{
                display: "inline-block",
                marginTop: 20,
                background: "#ff6f5e",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                padding: "11px 22px",
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)",
              }}
            >
              Awesome!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
