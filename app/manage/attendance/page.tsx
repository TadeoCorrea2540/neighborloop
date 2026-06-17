const CHECKED_IN = [
  { name: "Maya Rivera", time: "10:02 AM", c1: "#bca6ff", c2: "#7a6bf5", status: "On time", pill: { background: "#dff6ea", color: "#1fae82" } },
  { name: "Leo Tanaka", time: "10:05 AM", c1: "#8bc0ff", c2: "#3a8bf0", status: "On time", pill: { background: "#dff6ea", color: "#1fae82" } },
  { name: "Aisha Khan", time: "10:14 AM", c1: "#8fe3bd", c2: "#1fae82", status: "Late", pill: { background: "#fff0dd", color: "#ff8a3c" } },
];

const NOT_ARRIVED = ["Daniel Okafor", "Priya Shah"];

export default function Attendance() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }} className="two-pane">
      {/* scanner */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#11182b", borderRadius: 20, padding: 28, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#7fe3bd", letterSpacing: ".06em", marginBottom: 6 }}>● LIVE · Community Garden Planting</div>
          <div style={{ color: "#aeb6cf", fontSize: 13, marginBottom: 22 }}>Point a volunteer&apos;s QR code at the scanner</div>
          <div style={{ position: "relative", width: 220, height: 220, borderRadius: 24, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* fake QR */}
            <div style={{ width: 160, height: 160, background: "conic-gradient(#11182b 0 25%,#fff 0 50%,#11182b 0 75%,#fff 0)", backgroundSize: "20px 20px", borderRadius: 8, position: "relative" }}>
              <span style={{ position: "absolute", top: 8, left: 8, width: 38, height: 38, border: "7px solid #11182b", borderRadius: 6, background: "#fff" }} />
              <span style={{ position: "absolute", top: 8, right: 8, width: 38, height: 38, border: "7px solid #11182b", borderRadius: 6, background: "#fff" }} />
              <span style={{ position: "absolute", bottom: 8, left: 8, width: 38, height: 38, border: "7px solid #11182b", borderRadius: 6, background: "#fff" }} />
            </div>
            {/* scan line */}
            <span style={{ position: "absolute", left: 18, right: 18, height: 3, borderRadius: 3, background: "linear-gradient(90deg,transparent,#1fae82,transparent)", boxShadow: "0 0 14px 3px rgba(31,174,130,.7)", top: 30, animation: "scanline 2.2s ease-in-out infinite" }} />
            {/* corner brackets */}
            <span style={{ position: "absolute", top: 14, left: 14, width: 26, height: 26, borderTop: "3px solid #1fae82", borderLeft: "3px solid #1fae82", borderRadius: "7px 0 0 0" }} />
            <span style={{ position: "absolute", top: 14, right: 14, width: 26, height: 26, borderTop: "3px solid #1fae82", borderRight: "3px solid #1fae82", borderRadius: "0 7px 0 0" }} />
            <span style={{ position: "absolute", bottom: 14, left: 14, width: 26, height: 26, borderBottom: "3px solid #1fae82", borderLeft: "3px solid #1fae82", borderRadius: "0 0 0 7px" }} />
            <span style={{ position: "absolute", bottom: 14, right: 14, width: 26, height: 26, borderBottom: "3px solid #1fae82", borderRight: "3px solid #1fae82", borderRadius: "0 0 7px 0" }} />
          </div>
          <div style={{ marginTop: 22, background: "rgba(127,227,189,.15)", color: "#7fe3bd", fontSize: 13, fontWeight: 700, padding: "9px 16px", borderRadius: 12 }}>Maya Rivera just checked in ✓</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <span style={{ flex: 1, textAlign: "center", background: "#fff", border: "1px solid rgba(24,32,59,.1)", fontWeight: 600, fontSize: 13.5, color: "var(--muted-1)", padding: 12, borderRadius: 13, cursor: "pointer" }}>⌨ Manual check-in</span>
          <span style={{ flex: 1, textAlign: "center", background: "#fff", border: "1px solid rgba(24,32,59,.1)", fontWeight: 600, fontSize: 13.5, color: "var(--muted-1)", padding: 12, borderRadius: 13, cursor: "pointer" }}>📋 Roster</span>
        </div>
      </div>

      {/* attendance lists */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* progress ring */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(24,32,59,.05)", padding: 22, display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ position: "relative", width: 104, height: 104, flexShrink: 0 }}>
            <svg width="104" height="104" viewBox="0 0 104 104">
              <circle cx="52" cy="52" r="44" fill="none" stroke="#eef0f5" strokeWidth="12" />
              <circle cx="52" cy="52" r="44" fill="none" stroke="#1fae82" strokeWidth="12" strokeLinecap="round" strokeDasharray="276" strokeDashoffset="83" transform="rotate(-90 52 52)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: "var(--mint)" }}>70%</span>
              <span style={{ fontSize: 11, color: "var(--muted-3)" }}>checked in</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--mint)" }}>7</div>
              <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>checked in</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#ff8a3c" }}>3</div>
              <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>expected · not yet arrived</div>
            </div>
          </div>
        </div>

        {/* checked in + not arrived */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(24,32,59,.05)", padding: 20, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>✅ Checked in</div>
            <span style={{ fontSize: 12, color: "var(--muted-3)" }}>7 of 10</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {CHECKED_IN.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg,${p.c1},${p.c2})` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted-3)" }}>{p.time}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, ...p.pill }}>{p.status}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(24,32,59,.06)", margin: "15px 0" }} />

          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 11 }}>⌛ Not yet arrived</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {NOT_ARRIVED.map((name) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 11, opacity: 0.6 }}>
                <span style={{ width: 34, height: 34, borderRadius: 11, background: "#eef0f5" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-1)", background: "#f1f3f8", padding: "3px 9px", borderRadius: 99, cursor: "pointer" }}>Check in</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
