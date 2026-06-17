import { ORG_CHART } from "@/lib/data";

const SUMMARY = [
  { label: "Total hours contributed", value: "1,240", grad: "linear-gradient(135deg,#dff6ea,#c8f0dd)", labelColor: "#1a8c66", valueColor: "#147a57" },
  { label: "Volunteers engaged", value: "312", grad: "linear-gradient(135deg,#e6f0fd,#d6e8fc)", labelColor: "#2b6cc4", valueColor: "#2360b5" },
  { label: "People helped", value: "2,840", grad: "linear-gradient(135deg,#fff0ec,#ffe3da)", labelColor: "#d4452f", valueColor: "#c23b27" },
  { label: "Retention rate", value: "68%", grad: "linear-gradient(135deg,#f0ecff,#e6dcff)", labelColor: "#6450c8", valueColor: "#5a45bd" },
];

const CAUSES = [
  { label: "🌱 Community gardens", pct: 48, color: "#1fae82" },
  { label: "🍲 Food security", pct: 27, color: "#ff8a5c" },
  { label: "🌊 Environment", pct: 17, color: "#3a8bf0" },
  { label: "📚 Education", pct: 8, color: "#7a6bf5" },
];

export default function Reports() {
  const maxBar = Math.max(...ORG_CHART.map((c) => c.value));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Impact report · GreenRoots</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Jan – Jun 2026 · 6 months</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted-1)", background: "#fff", border: "1px solid rgba(24,32,59,.1)", padding: "10px 16px", borderRadius: 12, cursor: "pointer" }}>↗ Share</span>
          <span className="btn-coral" style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", padding: "10px 16px", borderRadius: 12, boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)", cursor: "pointer" }}>⇩ Export PDF</span>
        </div>
      </div>

      {/* summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 18 }} className="card-grid-4">
        {SUMMARY.map((s) => (
          <div key={s.label} style={{ background: s.grad, borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 13, color: s.labelColor, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color: s.valueColor }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }} className="dash-split">
        {/* monthly hours bars */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Monthly hours contributed</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 180 }}>
            {ORG_CHART.map((b) => (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", maxWidth: 38, borderRadius: "9px 9px 4px 4px", background: "linear-gradient(180deg,#8fe3bd,#1fae82)", height: `${(b.value / maxBar) * 100}%`, transition: "height .5s" }} />
                <span style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* cause breakdown */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Impact by cause</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {CAUSES.map((c) => (
              <div key={c.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{c.label}</span>
                  <span style={{ color: "var(--muted-3)" }}>{c.pct}%</span>
                </div>
                <div style={{ height: 9, borderRadius: 99, background: "#eef0f5", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${c.pct}%`, borderRadius: 99, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, background: "#dff6ea", borderRadius: 14, padding: 14, fontSize: 13, color: "#147a57", lineHeight: 1.5 }}>
            🌍 Equivalent to <b>156 trees planted</b> and <b>9,400 meals served</b> this period.
          </div>
        </div>
      </div>
    </div>
  );
}
