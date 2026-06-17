import Link from "next/link";
import { LIVE } from "@/lib/data";

/* ---------- local admin sample data (not in lib/data) ---------- */
const METRICS = [
  { label: "Total users", value: LIVE.volunteers.toLocaleString(), delta: "▲ 8.4% MoM", deltaColor: "#1fae82" },
  { label: "Organizations", value: "847", delta: "▲ 3.1% MoM", deltaColor: "#1fae82" },
  { label: "Missions posted", value: LIVE.missions.toLocaleString(), delta: "▲ 11% MoM", deltaColor: "#1fae82" },
  { label: "Reports pending", value: "12", delta: "needs review", deltaColor: "#f1543f", valueColor: "#f1543f" },
];

const GROWTH: { l: string; h: number }[] = [
  { l: "W1", h: 52 },
  { l: "W2", h: 64 },
  { l: "W3", h: 48 },
  { l: "W4", h: 78 },
  { l: "W5", h: 70 },
  { l: "W6", h: 92 },
  { l: "W7", h: 84 },
];

const QUEUE = [
  { name: "GreenRoots Collective", meta: "501(c)(3) · docs uploaded", metaColor: "#9aa3bd", c1: "#8fe3bd", c2: "#1fae82" },
  { name: "Blue Coast Project", meta: "⚠ missing tax ID", metaColor: "#ff8a3c", c1: "#8bc0ff", c2: "#3a8bf0" },
  { name: "BrightMinds Tutoring", meta: "501(c)(3) · docs uploaded", metaColor: "#9aa3bd", c1: "#bca6ff", c2: "#7a6bf5" },
];

const FLAGGED = [
  { item: '"Free crypto fundraiser" mission', reporter: "@user_2261", reason: "Spam", status: "Pending", sColor: "#ff8a3c", sBg: "#fff0dd" },
  { item: "Org profile — QuickCash Inc.", reporter: "@maya_r", reason: "Fake org", status: "Escalated", sColor: "#f1543f", sBg: "#ffeae6" },
  { item: 'Review on "Park Cleanup"', reporter: "@org_blue", reason: "Abuse", status: "Resolved", sColor: "#1fae82", sBg: "#dff6ea" },
];

export default function AdminConsole() {
  const maxBar = Math.max(...GROWTH.map((g) => g.h));

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Platform overview</h2>
          <p style={{ margin: "3px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Last 30 days · all regions</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            className="btn-ghost"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--muted-1)",
              background: "#fff",
              border: "1px solid var(--line-3)",
              padding: "9px 14px",
              borderRadius: 11,
              cursor: "pointer",
            }}
          >
            Export CSV
          </span>
        </div>
      </div>

      {/* metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }} className="card-grid-4">
        {METRICS.map((m) => (
          <div key={m.label} style={{ background: "#fff", borderRadius: 16, padding: 18, border: "1px solid rgba(24,32,59,.05)" }}>
            <div style={{ fontSize: 13, color: "var(--muted-3)", fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: m.valueColor }}>{m.value}</div>
            <div style={{ fontSize: 12, color: m.deltaColor, fontWeight: 700, marginTop: 2 }}>{m.delta}</div>
          </div>
        ))}
      </div>

      {/* growth + verification queue */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }} className="dash-split">
        {/* growth chart */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Growth — new users / week</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 150 }}>
            {GROWTH.map((b) => (
              <div key={b.l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 30,
                    borderRadius: "8px 8px 3px 3px",
                    background: "linear-gradient(180deg,#7a6bf5,#3a8bf0)",
                    height: `${(b.h / maxBar) * 100}%`,
                    transition: "height .5s",
                  }}
                />
                <span style={{ fontSize: 11.5, color: "var(--muted-3)", fontWeight: 600 }}>{b.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* verification queue */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Verification queue</div>
            <Link href="/admin/verify" style={{ fontSize: 12, color: "var(--muted-3)" }}>7 pending</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {QUEUE.map((q) => (
              <div key={q.name} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg,${q.c1},${q.c2})`, flexShrink: 0 }} />
                <Link href="/admin/verify" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{q.name}</div>
                  <div style={{ fontSize: 12, color: q.metaColor }}>{q.meta}</div>
                </Link>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1fae82", background: "#dff6ea", padding: "4px 9px", borderRadius: 99, cursor: "pointer" }}>Approve</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#f1543f", background: "#ffeae6", padding: "4px 9px", borderRadius: 99, cursor: "pointer" }}>Reject</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* flagged content */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)", marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Flagged content</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr", fontSize: 12, color: "var(--muted-3)", fontWeight: 700, paddingBottom: 10, borderBottom: "1px solid rgba(24,32,59,.07)" }}>
          <span>ITEM</span>
          <span>REPORTER</span>
          <span>REASON</span>
          <span>STATUS</span>
        </div>
        {FLAGGED.map((f, i) => (
          <div
            key={f.item}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.4fr 1fr 1fr",
              fontSize: 13.5,
              padding: "13px 0",
              borderBottom: i < FLAGGED.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600 }}>{f.item}</span>
            <span style={{ color: "var(--muted-1)" }}>{f.reporter}</span>
            <span style={{ color: "var(--muted-1)" }}>{f.reason}</span>
            <span>
              <span style={{ fontSize: 11, fontWeight: 700, color: f.sColor, background: f.sBg, padding: "4px 10px", borderRadius: 99 }}>{f.status}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
