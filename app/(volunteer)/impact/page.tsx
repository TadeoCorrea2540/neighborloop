import { VOL_STATS } from "@/lib/data";

const STATS = [
  { v: VOL_STATS.hours, l: "total hours", c: "#1fae82" },
  { v: VOL_STATS.missions, l: "missions done", c: "#3a8bf0" },
  { v: VOL_STATS.people, l: "people helped", c: "#f1543f" },
  { v: VOL_STATS.badges, l: "badges", c: "#7a6bf5" },
];

const TIMELINE = [
  { title: "Community Garden Planting", meta: "May 31, 2026 · 4 hrs · GreenRoots", dot: "#1fae82" },
  { title: "Ocean Beach Cleanup", meta: "May 24, 2026 · 3 hrs · Blue Coast", dot: "#3a8bf0" },
  { title: "After-School Reading Buddy", meta: "May 17, 2026 · 2 hrs · BrightMinds", dot: "#7a6bf5" },
  { title: "Food Bank Sort", meta: "May 10, 2026 · 5 hrs · Helping Hands", dot: "#f1543f" },
];

const COLLECTION = [
  { emoji: "🌟", unlocked: true },
  { emoji: "⏱️", unlocked: true },
  { emoji: "🤝", unlocked: true },
  { emoji: "🌍", unlocked: true },
  { emoji: "📚", unlocked: false },
  { emoji: "🔥", unlocked: false },
  { emoji: "💯", unlocked: false },
  { emoji: "🏆", unlocked: false },
];

const CAUSES = [
  { label: "🍲 Food security", bg: "#dff6ea", color: "#1fae82" },
  { label: "🌊 Environment", bg: "#e2effd", color: "#3a8bf0" },
  { label: "📚 Education", bg: "#ece7ff", color: "#7a6bf5" },
  { label: "🐾 Animals", bg: "#fff0ec", color: "#f1543f" },
];

const CERTS = [
  { emoji: "📜", tile: "#fff0ec", title: "100 Hours of Service", sub: "Issued by NeighborLoop · 2026" },
  { emoji: "🏆", tile: "#dff6ea", title: "Earth Day Champion", sub: "Blue Coast Project · Apr 2026" },
];

export default function Impact() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 40px 80px -50px rgba(24,32,59,.55)",
        border: "1px solid rgba(24,32,59,.06)",
      }}
    >
      {/* cover */}
      <div
        style={{
          height: 150,
          background: "linear-gradient(120deg,#ece2ff,#dbeeff,#ffe3d6)",
          backgroundSize: "200% 200%",
          animation: "gshift 10s ease infinite",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(255,255,255,.6),transparent 70%)",
            top: -60,
            right: 80,
          }}
        />
      </div>

      <div style={{ padding: "0 34px 34px", marginTop: -52, position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <span
              style={{
                width: 104,
                height: 104,
                borderRadius: 28,
                background: "linear-gradient(135deg,#bca6ff,#7a6bf5)",
                border: "5px solid #fff",
                boxShadow: "0 16px 32px -16px rgba(24,32,59,.5)",
              }}
            />
            <div style={{ paddingBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>
                  Maya Rivera
                </h2>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#7a6bf5",
                    background: "#ece7ff",
                    padding: "4px 11px",
                    borderRadius: 99,
                  }}
                >
                  Level 4 · Changemaker
                </span>
              </div>
              <div style={{ fontSize: 14, color: "#6b7799", marginTop: 3 }}>
                📍 San Francisco · Volunteering since 2024
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, paddingBottom: 6 }}>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "#5a6685",
                background: "#fff",
                border: "1px solid rgba(24,32,59,.12)",
                padding: "10px 16px",
                borderRadius: 12,
              }}
            >
              ⬇ Certificate
            </span>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: "#fff",
                background: "#ff6f5e",
                padding: "10px 16px",
                borderRadius: 12,
                boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)",
              }}
            >
              ↗ Share impact card
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: 15,
            color: "#4a5475",
            lineHeight: 1.6,
            maxWidth: 620,
            margin: "20px 0 0",
          }}
        >
          Student &amp; animal lover turning weekends into impact. Passionate about food security and
          ocean conservation. Always up for a new mission. 💚🌊
        </p>

        {/* causes */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 24px" }}>
          {CAUSES.map((c) => (
            <span
              key={c.label}
              style={{
                fontSize: 13,
                fontWeight: 600,
                background: c.bg,
                color: c.color,
                padding: "7px 14px",
                borderRadius: 999,
              }}
            >
              {c.label}
            </span>
          ))}
        </div>

        {/* stat strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 26,
          }}
          className="card-grid-4"
        >
          {STATS.map((s) => (
            <div
              key={s.l}
              style={{
                background: "#fbfcfe",
                border: "1px solid rgba(24,32,59,.06)",
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 800, color: s.c }}>
                {s.v.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: "#9aa3bd" }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}
          className="detail-split"
        >
          {/* timeline */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>Mission timeline</h3>
            <div style={{ position: "relative", paddingLeft: 26 }}>
              <span
                style={{
                  position: "absolute",
                  left: 7,
                  top: 6,
                  bottom: 6,
                  width: 2,
                  background: "rgba(24,32,59,.1)",
                }}
              />
              {TIMELINE.map((t, i) => (
                <div
                  key={t.title}
                  style={{
                    position: "relative",
                    marginBottom: i === TIMELINE.length - 1 ? 0 : 18,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: -26,
                      top: 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: t.dot,
                      border: "3px solid #fff",
                      boxShadow: `0 0 0 2px ${t.dot}`,
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.title}</div>
                  <div style={{ fontSize: 12.5, color: "#9aa3bd" }}>{t.meta}</div>
                </div>
              ))}
            </div>
          </div>

          {/* badges + certs */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>Badge collection</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {COLLECTION.map((b, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    background: b.unlocked
                      ? "linear-gradient(135deg,#ffe08a,#ff9e3c)"
                      : "#eef0f5",
                    boxShadow: b.unlocked ? "0 10px 20px -12px rgba(255,158,60,.7)" : "none",
                    filter: b.unlocked ? "none" : "grayscale(.7)",
                    opacity: b.unlocked ? 1 : 0.7,
                  }}
                >
                  {b.emoji}
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px" }}>Certificates</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {CERTS.map((c) => (
                <div
                  key={c.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    background: "#fbfcfe",
                    border: "1px solid rgba(24,32,59,.06)",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      background: c.tile,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {c.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "#9aa3bd" }}>{c.sub}</div>
                  </div>
                  <span style={{ fontSize: 18, color: "#9aa3bd" }}>⬇</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
