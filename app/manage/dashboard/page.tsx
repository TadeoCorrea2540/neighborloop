import Link from "next/link";
import { ORG_CHART, MANAGE_ROWS } from "@/lib/data";

const PENDING = [
  { name: "Maya Rivera", meta: "126 hrs · 4.9★", c1: "#bca6ff", c2: "#7a6bf5" },
  { name: "Leo Tanaka", meta: "48 hrs · 4.7★", c1: "#8bc0ff", c2: "#3a8bf0" },
  { name: "Priya Shah", meta: "New volunteer", c1: "#ffb09a", c2: "#ff7a5c" },
];

const METRICS = [
  { label: "Active missions", value: "6", sub: "▲ 2 this week", subColor: "var(--mint)", color: "var(--ink)" },
  { label: "Volunteers this month", value: "184", sub: "▲ 12% MoM", subColor: "var(--mint)", color: "var(--blue)" },
  { label: "Attendance rate", value: "92%", sub: "▲ 4 pts", subColor: "var(--mint)", color: "var(--mint)" },
  { label: "Impact hours", value: "1,240", sub: "all-time", subColor: "var(--muted-3)", color: "var(--lav)" },
];

export default function OrgDashboard() {
  const maxBar = Math.max(...ORG_CHART.map((c) => c.value));
  const rows = MANAGE_ROWS.slice(0, 3);

  return (
    <div>
      {/* welcome */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 25, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Welcome back, GreenRoots 🌱</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>6 active missions · 184 volunteers this month</p>
        </div>
        <Link href="/manage/missions/new" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)" }}>+ Create mission</Link>
      </div>

      {/* metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 18 }} className="card-grid-4">
        {METRICS.map((m) => (
          <div key={m.label} style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid rgba(24,32,59,.05)" }}>
            <div style={{ fontSize: 13, color: "var(--muted-3)", fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 12, color: m.subColor, fontWeight: 700, marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }} className="dash-split">
        {/* chart */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Event performance</div>
            <span style={{ fontSize: 12, color: "var(--muted-3)" }}>signups / week</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 160 }}>
            {ORG_CHART.map((b) => (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", maxWidth: 32, borderRadius: "9px 9px 4px 4px", background: "linear-gradient(180deg,#1fae82,#8fe3bd)", height: `${(b.value / maxBar) * 100}%`, transition: "height .5s" }} />
                <span style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* pending applicants */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Pending applicants</div>
            <span style={{ fontSize: 12, color: "var(--coral-deep)", fontWeight: 700 }}>9 new</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PENDING.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${p.c1},${p.c2})` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{p.meta}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--mint)", background: "#dff6ea", padding: "5px 10px", borderRadius: 99, cursor: "pointer" }}>Approve</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--coral-deep)", background: "#ffeae6", padding: "5px 10px", borderRadius: 99, cursor: "pointer" }}>✕</span>
              </div>
            ))}
            <Link href="/manage/applicants" style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--muted-1)", paddingTop: 4 }}>View all applicants →</Link>
          </div>
        </div>
      </div>

      {/* your missions mini table */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)", marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Your missions</div>
          <Link href="/manage/missions" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>Manage all →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr 0.6fr", fontSize: 12, color: "var(--muted-3)", fontWeight: 700, paddingBottom: 10, borderBottom: "1px solid rgba(24,32,59,.07)" }}>
          <span>MISSION</span><span>DATE</span><span>VOLUNTEERS</span><span>STATUS</span><span></span>
        </div>
        {rows.map((m, i) => (
          <div key={m.title} style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr 0.6fr", fontSize: 13.5, padding: "13px 0", borderBottom: i < rows.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>{m.emoji} {m.title}</span>
            <span style={{ color: "var(--muted-1)" }}>{m.date}</span>
            <span style={{ color: "var(--muted-1)" }}>{m.vol} / {m.cap}</span>
            <span><span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, ...m.pill }}>{m.status}</span></span>
            <span style={{ color: "var(--muted-3)" }}>⋯</span>
          </div>
        ))}
      </div>
    </div>
  );
}
