"use client";

import { useState } from "react";
import { MY_TABS, MY_MISSIONS } from "@/lib/data";

export default function MyMissions() {
  const [tab, setTab] = useState<(typeof MY_TABS)[number]>("Upcoming");
  const missions = MY_MISSIONS[tab] ?? [];

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-.02em" }}>
        My Missions
      </h2>

      {/* tab pills */}
      <div style={{ display: "flex", gap: 9, marginBottom: 20 }}>
        {MY_TABS.map((t) => {
          const active = t === tab;
          return (
            <span
              key={t}
              onClick={() => setTab(t)}
              style={{
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 700,
                padding: "9px 16px",
                borderRadius: 999,
                transition: ".18s",
                background: active ? "#ff6f5e" : "#fff",
                color: active ? "#fff" : "#5a6685",
                border: active ? "1px solid #ff6f5e" : "1px solid rgba(24,32,59,.12)",
              }}
            >
              {t}
            </span>
          );
        })}
      </div>

      {/* mission rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {missions.map((m) => (
          <div
            key={m.title}
            style={{
              background: "#fff",
              border: "1px solid rgba(24,32,59,.06)",
              borderRadius: 16,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
                background: m.art,
              }}
            >
              {m.emoji}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{m.title}</div>
              <div style={{ fontSize: 13, color: "#9aa3bd", marginTop: 2 }}>
                📅 {m.date} · 📍 {m.loc}
              </div>
            </div>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: 999,
                ...m.pill,
              }}
            >
              {m.status}
            </span>
            <div style={{ display: "flex", gap: 9 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#18203b",
                  border: "1px solid rgba(24,32,59,.12)",
                  padding: "9px 13px",
                  borderRadius: 11,
                  cursor: "pointer",
                }}
              >
                QR check-in
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#5a6685",
                  border: "1px solid rgba(24,32,59,.12)",
                  padding: "9px 13px",
                  borderRadius: 11,
                  cursor: "pointer",
                }}
              >
                Message
              </span>
            </div>
          </div>
        ))}

        {missions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "54px 20px",
              background: "#fff",
              borderRadius: 18,
              border: "1px dashed rgba(24,32,59,.14)",
            }}
          >
            <div style={{ fontSize: 46 }}>🗂️</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 10 }}>Nothing here yet</div>
            <div style={{ fontSize: 14, color: "#9aa3bd", marginTop: 4 }}>
              Missions in this tab will show up here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
