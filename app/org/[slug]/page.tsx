import PublicNav from "@/components/public-nav";
import { loadOrgView } from "@/lib/org-view";

// Demo-only sections below have no DB source yet, so they stay identical for
// live and mock orgs (noted where rendered).
const STATS = [
  { v: "312", l: "volunteers hosted", c: "#1fae82" },
  { v: "1,240", l: "hours contributed", c: "#3a8bf0" },
  { v: "18", l: "gardens built", c: "#f1543f" },
  { v: "7 yrs", l: "on NeighborLoop", c: "#7a6bf5" },
];

const REVIEWS = [
  {
    name: "Maya R.",
    art: "linear-gradient(135deg,#bca6ff,#7a6bf5)",
    text:
      '"Best-run volunteer day I\'ve been to. Organized, warm, and you can see the impact instantly."',
  },
  {
    name: "Leo T.",
    art: "linear-gradient(135deg,#8bc0ff,#3a8bf0)",
    text:
      '"Came alone, left with new friends and dirt under my nails. Already signed up again."',
  },
];

const GALLERY = [
  { emoji: "🌻", art: "linear-gradient(135deg,#eaf7cf,#c2e58a)" },
  { emoji: "🥕", art: "linear-gradient(135deg,#d6f6e6,#8fe3bd)" },
  { emoji: "🍅", art: "linear-gradient(135deg,#fff0dd,#ffc48f)" },
  { emoji: "💧", art: "linear-gradient(135deg,#e2effd,#9fd0ff)" },
  { emoji: "🌷", art: "linear-gradient(135deg,#f0ecff,#bca6ff)" },
  { emoji: "🐝", art: "linear-gradient(135deg,#ffe3da,#ffb09a)" },
];

export default async function OrgProfile({
  params,
}: {
  params: { slug: string };
}) {
  // Live-first by slug; falls back to the GreenRoots demo when not a live org.
  const view = await loadOrgView(params.slug);
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <PublicNav />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* cover */}
        <div
          style={{
            height: 180,
            background: view.coverUrl
              ? `url('${view.coverUrl}') center/cover no-repeat`
              : "linear-gradient(120deg,#d6f6e6,#a6e3c2,#8fe3bd)",
            position: "relative",
          }}
        >
          {!view.coverUrl && (
            <>
              <span
                style={{
                  position: "absolute",
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background: "radial-gradient(circle,rgba(255,255,255,.5),transparent 70%)",
                  top: -80,
                  right: 120,
                }}
              />
              <span style={{ position: "absolute", right: 40, bottom: 24, fontSize: 80, opacity: 0.5 }}>🌱</span>
            </>
          )}
        </div>

        <div style={{ padding: "0 34px 34px", marginTop: -46, position: "relative" }}>
          {/* header */}
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
                  width: 100,
                  height: 100,
                  borderRadius: 26,
                  background: view.logoUrl
                    ? `url('${view.logoUrl}') center/cover no-repeat`
                    : "linear-gradient(135deg,#8fe3bd,#1fae82)",
                  border: "5px solid #fff",
                  boxShadow: "0 16px 32px -16px rgba(24,32,59,.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                }}
              >
                {!view.logoUrl && "🌱"}
              </span>
              <div style={{ paddingBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontSize: 27, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>
                    {view.name}
                  </h2>
                  {view.verifiedLabel && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--mint)",
                        background: "#dff6ea",
                        padding: "5px 12px",
                        borderRadius: 99,
                      }}
                    >
                      {view.verifiedLabel}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: "var(--muted-2)", marginTop: 4 }}>
                  {view.metaLine}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, paddingBottom: 6 }}>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "var(--muted-1)",
                  background: "#fff",
                  border: "1px solid rgba(24,32,59,.12)",
                  padding: "10px 16px",
                  borderRadius: 12,
                }}
              >
                💬 Message
              </span>
              <span
                className="btn-coral"
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: 12,
                  boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)",
                }}
              >
                + Follow
              </span>
            </div>
          </div>

          <p
            style={{
              fontSize: 15.5,
              color: "#4a5475",
              lineHeight: 1.65,
              maxWidth: 680,
              margin: "20px 0 24px",
            }}
          >
            {view.description}
          </p>

          {/* stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
              marginBottom: 28,
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
                <div style={{ fontSize: 28, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 13, color: "var(--muted-3)" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* split */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}
            className="detail-split"
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px" }}>
                Active opportunities
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {view.opps.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed rgba(24,32,59,.16)",
                      borderRadius: 16,
                      padding: "24px 18px",
                      textAlign: "center",
                      fontSize: 14,
                      color: "var(--muted-2)",
                      background: "#fbfcfe",
                    }}
                  >
                    No active opportunities posted right now — check back soon.
                  </div>
                ) : (
                  view.opps.map((o) => (
                  <div
                    key={o.title}
                    style={{
                      display: "flex",
                      gap: 14,
                      background: "#fff",
                      border: "1px solid rgba(24,32,59,.07)",
                      borderRadius: 16,
                      padding: 13,
                      boxShadow: "0 12px 28px -24px rgba(24,32,59,.4)",
                    }}
                  >
                    <span
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 13,
                        background: o.art,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                      }}
                    >
                      {o.emoji}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{o.title}</div>
                      <div style={{ fontSize: 12.5, color: "var(--muted-3)", margin: "2px 0 0" }}>
                        {o.meta}
                      </div>
                    </div>
                    <span
                      className="btn-coral"
                      style={{
                        alignSelf: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#fff",
                        padding: "9px 16px",
                        borderRadius: 11,
                      }}
                    >
                      Join
                    </span>
                  </div>
                  ))
                )}
              </div>

              {/* Reviews — demo content, no DB source yet */}
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "24px 0 14px" }}>Reviews</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {REVIEWS.map((r) => (
                  <div
                    key={r.name}
                    style={{
                      background: "#fbfcfe",
                      border: "1px solid rgba(24,32,59,.06)",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: r.art }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#ffb01f" }}>★★★★★</div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#4a5475", lineHeight: 1.55 }}>
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px" }}>Past impact</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {GALLERY.map((g, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 14,
                      background: g.art,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 30,
                    }}
                  >
                    {g.emoji}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 18,
                  background: "linear-gradient(135deg,#dff6ea,#c8f0dd)",
                  borderRadius: 16,
                  padding: 18,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#147a57" }}>
                  🌍 LIFETIME IMPACT
                </div>
                <div style={{ fontSize: 14.5, color: "var(--ink)", marginTop: 6, lineHeight: 1.5 }}>
                  <b>9,400 meals</b> grown and <b>156 trees</b> planted with the community.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
