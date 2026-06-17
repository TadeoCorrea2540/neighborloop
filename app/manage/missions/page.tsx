"use client";

import { useState } from "react";
import Link from "next/link";
import { MANAGE_ROWS } from "@/lib/data";

const FILTERS = ["All", "Open", "Full", "Drafts"] as const;
type Filter = (typeof FILTERS)[number];

const actionChip = (color: string, bg: string): React.CSSProperties => ({
  fontSize: 12,
  fontWeight: 600,
  color,
  background: bg,
  padding: "7px 11px",
  borderRadius: 9,
  cursor: "pointer",
});

export default function ManageMissions() {
  const [filter, setFilter] = useState<Filter>("All");

  const rows = MANAGE_ROWS.filter((m) => {
    if (filter === "All") return true;
    if (filter === "Drafts") return m.status === "Draft";
    return m.status === filter;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Manage missions</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>6 missions · 2 drafts</p>
        </div>
        <Link href="/manage/missions/new" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)" }}>+ Create mission</Link>
      </div>

      {/* filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid rgba(24,32,59,.08)", borderRadius: 12, padding: "11px 14px", color: "var(--muted-3)", fontSize: 14 }}>🔎 Search your missions…</div>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <span
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 15px",
                borderRadius: 11,
                cursor: "pointer",
                background: active ? "#18203b" : "#fff",
                color: active ? "#fff" : "var(--muted-1)",
                border: active ? "none" : "1px solid rgba(24,32,59,.1)",
              }}
            >
              {f}
            </span>
          );
        })}
      </div>

      {/* table */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.05)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr 1.1fr 1fr 1.6fr", fontSize: 12, color: "var(--muted-3)", fontWeight: 700, padding: "14px 20px", borderBottom: "1px solid rgba(24,32,59,.07)", background: "#fbfcfe" }}>
          <span>MISSION</span><span>DATE</span><span>VOLUNTEERS</span><span>STATUS</span><span style={{ textAlign: "right" }}>ACTIONS</span>
        </div>
        {rows.map((m) => (
          <div key={m.title} className="row-hover" style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr 1.1fr 1fr 1.6fr", alignItems: "center", fontSize: 13.5, padding: "15px 20px", borderBottom: "1px solid rgba(24,32,59,.05)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 11, fontWeight: 600 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: m.art }}>{m.emoji}</span>
              {m.title}
            </span>
            <span style={{ color: "var(--muted-1)" }}>{m.date}</span>
            <span><span style={{ display: "inline-block", minWidth: 54 }}><span style={{ fontWeight: 700 }}>{m.vol}</span> <span style={{ color: "var(--muted-3)" }}>/ {m.cap}</span></span></span>
            <span><span style={{ fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 99, ...m.pill }}>{m.status}</span></span>
            <span style={{ display: "flex", gap: 7, justifyContent: "flex-end" }}>
              <span style={actionChip("var(--muted-1)", "#f1f3f8")}>Edit</span>
              <span style={actionChip("var(--muted-1)", "#f1f3f8")}>Duplicate</span>
              <span style={actionChip("var(--blue)", "#e2effd")}>📊</span>
              <span style={actionChip("var(--coral-deep)", "#ffeae6")}>Close</span>
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: "var(--muted-3)" }}>Showing {rows.length} of 6 missions</span>
        <div style={{ display: "flex", gap: 7 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: "1px solid rgba(24,32,59,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--muted-3)", cursor: "pointer" }}>‹</span>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: "#18203b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>1</span>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: "1px solid rgba(24,32,59,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--muted-1)", cursor: "pointer" }}>2</span>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: "1px solid rgba(24,32,59,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--muted-3)", cursor: "pointer" }}>›</span>
        </div>
      </div>
    </div>
  );
}
