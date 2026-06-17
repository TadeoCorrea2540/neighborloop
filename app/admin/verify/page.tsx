import Link from "next/link";

/* ---------- local sample org under review (not in lib/data) ---------- */
const DETAILS: { label: string; value: string; color?: string }[] = [
  { label: "Legal name", value: "GreenRoots Collective Inc." },
  { label: "EIN / Tax ID", value: "82-•••4471 ✓" },
  { label: "Contact", value: "Dana Cole · Director" },
  { label: "Email", value: "dana@greenroots.org ✓" },
  { label: "Website", value: "greenroots.org", color: "#3a8bf0" },
  { label: "Year founded", value: "2019" },
];

const DOCS: { name: string; status: string; statusColor: string; icon: string; tile: string }[] = [
  { name: "IRS 501(c)(3) Letter", status: "✓ Verified · PDF", statusColor: "#1fae82", icon: "📄", tile: "#ffe3da" },
  { name: "Articles of Incorporation", status: "✓ Verified · PDF", statusColor: "#1fae82", icon: "📄", tile: "#e2effd" },
  { name: "Director ID", status: "✓ Verified · JPG", statusColor: "#1fae82", icon: "🪪", tile: "#ece7ff" },
  { name: "Proof of Address", status: "⚠ Low resolution", statusColor: "#ff8a3c", icon: "🏦", tile: "#fff0dd" },
];

const RISK: { icon: string; iconColor: string; text: string }[] = [
  { icon: "✓", iconColor: "#1fae82", text: "EIN matches IRS nonprofit registry" },
  { icon: "✓", iconColor: "#1fae82", text: "Domain age > 5 years" },
  { icon: "✓", iconColor: "#1fae82", text: "No prior reports or flags" },
  { icon: "⚠", iconColor: "#ff8a3c", text: "1 document needs re-upload" },
];

export default function OrgVerification() {
  return (
    <div>
      {/* breadcrumb */}
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/admin/verify">Verification queue</Link> / <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>GreenRoots Collective</span>
      </div>

      {/* org header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg,#8fe3bd,#1fae82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            🌱
          </span>
          <div>
            <h2 style={{ fontSize: 23, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>GreenRoots Collective</h2>
            <div style={{ fontSize: 13.5, color: "var(--muted-3)" }}>Submitted Jun 14, 2026 · 501(c)(3) · San Francisco, CA</div>
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#ff8a3c", background: "#fff0dd", padding: "7px 14px", borderRadius: 99 }}>⏳ Pending review</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }} className="detail-split">
        {/* left: details + docs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.05)", padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Organization details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {DETAILS.map((d) => (
                <div key={d.label}>
                  <div style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600 }}>{d.label}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 3, color: d.color }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.05)", padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Uploaded documents</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="card-grid-3">
              {DOCS.map((doc) => (
                <div key={doc.name} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(24,32,59,.08)", borderRadius: 14, padding: 14 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 11, background: doc.tile, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{doc.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{doc.name}</div>
                    <div style={{ fontSize: 11.5, color: doc.statusColor }}>{doc.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right: risk + notes + actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.05)", padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Risk indicators</div>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
              <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#eef0f5" strokeWidth="9" />
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#1fae82" strokeWidth="9" strokeLinecap="round" strokeDasharray="170" strokeDashoffset="30" transform="rotate(-90 32 32)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#1fae82" }}>Low</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted-1)", lineHeight: 1.5 }}>
                Trust score <b style={{ color: "var(--ink)" }}>82/100</b>. Documents and tax ID verified against IRS records.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {RISK.map((r) => (
                <div key={r.text} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: "#3a425e" }}>
                  <span style={{ color: r.iconColor }}>{r.icon}</span> {r.text}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.05)", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Reviewer notes</div>
            <div style={{ border: "1px solid rgba(24,32,59,.12)", borderRadius: 12, padding: "12px 14px", fontSize: 13.5, color: "var(--muted-3)", minHeight: 64, lineHeight: 1.5 }}>
              Tax ID and incorporation check out. Requested clearer proof of address before final approval…
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#1fae82", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 13, boxShadow: "0 14px 28px -12px rgba(31,174,130,.7)", cursor: "pointer" }}>✓ Approve organization</div>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ flex: 1, textAlign: "center", fontSize: 13.5, fontWeight: 700, color: "#ff8a3c", background: "#fff0dd", padding: 12, borderRadius: 12, cursor: "pointer" }}>Request info</span>
              <span style={{ flex: 1, textAlign: "center", fontSize: 13.5, fontWeight: 700, color: "#f1543f", background: "#ffeae6", padding: 12, borderRadius: 12, cursor: "pointer" }}>Reject</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
