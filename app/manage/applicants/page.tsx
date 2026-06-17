"use client";

import { useState } from "react";
import { APP_TABS, APPLICANTS, notePill } from "@/lib/data";

type Tab = (typeof APP_TABS)[number];

export default function Applicants() {
  const [tab, setTab] = useState<Tab>("Pending");
  const list = APPLICANTS[tab];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Applicants · Compost Workshop</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Review and approve volunteers for this mission</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--mint)", background: "#dff6ea", padding: "10px 16px", borderRadius: 12, cursor: "pointer" }}>✓ Approve selected</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted-1)", background: "#fff", border: "1px solid rgba(24,32,59,.1)", padding: "10px 16px", borderRadius: 12, cursor: "pointer" }}>⇩ Export</span>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 9, marginBottom: 20 }}>
        {APP_TABS.map((t) => {
          const active = tab === t;
          return (
            <span
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                padding: "9px 16px",
                borderRadius: 11,
                cursor: "pointer",
                background: active ? "#18203b" : "#fff",
                color: active ? "#fff" : "var(--muted-1)",
                border: active ? "none" : "1px solid rgba(24,32,59,.1)",
              }}
            >
              {t}
            </span>
          );
        })}
      </div>

      {/* applicant cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }} className="card-grid-3">
        {list.map((a) => {
          const pending = tab === "Pending";
          return (
            <div key={a.name} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: 18, display: "flex", gap: 15, alignItems: "flex-start" }}>
              <span style={{ width: 54, height: 54, borderRadius: 15, flexShrink: 0, background: `linear-gradient(135deg,${a.c1},${a.c2})` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{a.name}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, ...notePill(a.note) }}>{a.note}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-3)", margin: "2px 0 10px" }}>{a.meta} · {a.cause}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 13 }}>
                  {a.skills.map((s) => (
                    <span key={s} style={{ fontSize: 12, fontWeight: 600, background: "#f1f3f8", color: "var(--muted-1)", padding: "5px 11px", borderRadius: 999 }}>{s}</span>
                  ))}
                </div>
                {pending && (
                  <div style={{ display: "flex", gap: 9 }}>
                    <span style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fff", background: "var(--mint)", padding: 9, borderRadius: 11, cursor: "pointer" }}>Approve</span>
                    <span style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--coral-deep)", background: "#ffeae6", padding: 9, borderRadius: 11, cursor: "pointer" }}>Reject</span>
                    <span style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--muted-1)", background: "#f1f3f8", padding: "9px 13px", borderRadius: 11, cursor: "pointer" }}>View</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
