"use client";

import { useState } from "react";

const inputBox: React.CSSProperties = {
  marginTop: 7,
  border: "1px solid rgba(24,32,59,.12)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#3a425e" };

export default function CreateMission() {
  const [visible, setVisible] = useState(true);

  const visText = visible ? "Public — live on Explore" : "Draft — only you can see it";
  const trackStyle: React.CSSProperties = visible
    ? { background: "var(--mint)" }
    : { background: "#cfd4e0" };
  const knobStyle: React.CSSProperties = visible
    ? { transform: "translateX(20px)" }
    : { transform: "translateX(0)" };

  return (
    <div>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        Missions / <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>New mission</span>
      </div>
      <h2 style={{ fontSize: 25, fontWeight: 800, margin: "0 0 22px", letterSpacing: "-.02em" }}>Create a mission</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22 }} className="detail-split">
        {/* left fields */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(24,32,59,.06)", padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Mission title</label>
            <div style={{ ...inputBox, fontWeight: 600, color: "#18203b" }}>Community Garden Planting Day</div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Description</label>
            <div style={{ ...inputBox, color: "var(--muted-3)", minHeight: 74, lineHeight: 1.5 }}>Help us plant 200 native seedlings and build raised beds for the neighborhood food garden…</div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Cause category</label>
            <div style={{ marginTop: 9, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 999, background: "#eaf7cf", color: "#7cb342", border: "1px solid #c2e58a" }}>🌱 Garden</span>
              <span style={{ fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 999, background: "#f1f3f8", color: "var(--muted-1)" }}>🍲 Food</span>
              <span style={{ fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 999, background: "#f1f3f8", color: "var(--muted-1)" }}>🌊 Cleanup</span>
              <span style={{ fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 999, background: "#f1f3f8", color: "var(--muted-1)" }}>📚 Education</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Location</label>
              <div style={{ ...inputBox, color: "var(--muted-1)" }}>📍 Mission Community Garden</div>
            </div>
            <div>
              <label style={labelStyle}>Volunteers needed</label>
              <div style={{ ...inputBox, color: "#18203b", fontWeight: 600 }}>12</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Date</label>
              <div style={{ ...inputBox, color: "#18203b", fontWeight: 600 }}>📅 Sat, Jun 28 2026</div>
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <div style={{ ...inputBox, color: "#18203b", fontWeight: 600 }}>🕘 10:00 AM – 1:00 PM</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Age requirement</label>
              <div style={{ ...inputBox, color: "var(--muted-1)" }}>12+ (under 16 with guardian)</div>
            </div>
            <div>
              <label style={labelStyle}>Required skills</label>
              <div style={{ marginTop: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, background: "#f1f3f8", padding: "7px 12px", borderRadius: 999 }}>Outdoors</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, background: "#f1f3f8", padding: "7px 12px", borderRadius: 999 }}>+ Add</span>
              </div>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Safety notes</label>
            <div style={{ ...inputBox, color: "var(--muted-3)", minHeight: 54 }}>Bring water and sun protection. Tools and gloves provided on site.</div>
          </div>
        </div>

        {/* right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(24,32,59,.06)", padding: 20 }}>
            <label style={labelStyle}>Cover image</label>
            <div style={{ marginTop: 10, border: "1.5px dashed rgba(24,32,59,.18)", borderRadius: 16, height: 150, background: "linear-gradient(135deg,#eaf7cf,#c2e58a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#5c7a2e" }}>
              <div style={{ fontSize: 32 }}>🖼️</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>Drag &amp; drop or browse</div>
              <div style={{ fontSize: 11.5, opacity: 0.8 }}>PNG/JPG · up to 5MB</div>
            </div>
          </div>

          {/* visibility toggle */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(24,32,59,.06)", padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#3a425e", marginBottom: 13 }}>Visibility</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#18203b" }}>{visText}</div>
              <div
                onClick={() => setVisible((v) => !v)}
                role="switch"
                aria-checked={visible}
                style={{ width: 46, height: 26, borderRadius: 99, padding: 3, cursor: "pointer", transition: ".2s", ...trackStyle }}
              >
                <span style={{ display: "block", width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: ".2s", boxShadow: "0 2px 5px rgba(0,0,0,.2)", ...knobStyle }} />
              </div>
            </div>
          </div>

          {/* live preview */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(24,32,59,.06)", padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#3a425e", marginBottom: 11 }}>Live preview</div>
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(24,32,59,.07)" }}>
              <div style={{ height: 64, background: "linear-gradient(135deg,#eaf7cf,#c2e58a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🌱</div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Community Garden Planting Day</div>
                <div style={{ fontSize: 11.5, color: "var(--muted-3)", marginTop: 2 }}>📍 Jun 28 · 12 spots</div>
              </div>
            </div>
          </div>

          <button className="btn-coral" style={{ color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 14, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)", cursor: "pointer", border: "none" }}>🚀 Publish mission</button>
          <div style={{ textAlign: "center", fontSize: 13.5, fontWeight: 600, color: "var(--muted-1)", cursor: "pointer" }}>Save as draft</div>
        </div>
      </div>
    </div>
  );
}
