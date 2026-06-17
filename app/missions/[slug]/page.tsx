import Link from "next/link";
import { notFound } from "next/navigation";
import PublicNav from "@/components/public-nav";
import {
  MISSIONS,
  MISSION_DETAILS,
  getMission,
  causeArt,
  type Mission,
  type MissionDetail,
} from "@/lib/data";

/** Build a sensible generic detail from a mission's own fields. */
function genericDetail(m: Mission): MissionDetail {
  return {
    whatYoullDo: `Join ${m.org} for ${m.title}. You'll work alongside a friendly crew making a real difference in your neighborhood. Training and guidance are provided on arrival — newcomers are always welcome. 💚`,
    bullets: [
      "Show up ready to lend a hand",
      "Work as part of a small, supportive team",
      "Leave the community better than you found it",
    ],
    impactGoal: `Help ${m.org} reach more neighbors and make ${m.cause.toLowerCase()} efforts go further this month.`,
    skills: ["Reliable", "Team player", "No experience needed"],
    safety:
      "Closed-toe shoes recommended. Please bring water and dress for the weather. Supplies are provided on site.",
    coverGrad: causeArt(m),
    date: m.date,
    time: m.date,
    spotsLeft: m.spots,
    spotsTotal: Math.max(m.spots, m.spots + 5),
  };
}

export default function MissionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const mission = getMission(params.slug);
  if (!mission) notFound();

  const detail =
    MISSION_DETAILS[params.slug] ?? genericDetail(mission);

  const recs = MISSIONS.filter((m) => m.slug !== mission.slug).slice(0, 3);

  const pct = Math.round((detail.spotsLeft / detail.spotsTotal) * 100);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <PublicNav />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* hero */}
        <div
          style={{
            height: 300,
            position: "relative",
            background: detail.coverGrad,
            display: "flex",
            alignItems: "flex-end",
            padding: 24,
          }}
        >
          <Link
            href="/explore"
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(255,255,255,.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ←
          </Link>
          <span style={{ position: "absolute", top: 18, right: 18, display: "flex", gap: 10 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(255,255,255,.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ♡
            </span>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(255,255,255,.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ↗
            </span>
          </span>
          <span style={{ position: "absolute", right: 30, bottom: 24, fontSize: 96, opacity: 0.85 }}>
            {mission.emoji}
          </span>
          <span
            style={{
              background: "rgba(255,255,255,.92)",
              fontSize: 13,
              fontWeight: 700,
              padding: "7px 14px",
              borderRadius: 999,
            }}
          >
            {mission.emoji} {mission.cause} · {mission.diff}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: 26,
            padding: "30px 34px 40px",
          }}
          className="detail-split"
        >
          {/* main */}
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em", margin: "0 0 8px" }}>
              {mission.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: causeArt(mission),
                }}
              />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{mission.org}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--mint)",
                  background: "#dff6ea",
                  padding: "4px 10px",
                  borderRadius: 99,
                }}
              >
                ✓ Verified org
              </span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>What you&apos;ll do</h3>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#4a5475", margin: "0 0 16px" }}>
              {detail.whatYoullDo}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 26 }}>
              {detail.bullets.map((b) => (
                <div
                  key={b}
                  style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: "#3a425e" }}
                >
                  <span style={{ color: "var(--mint)" }}>✓</span> {b}
                </div>
              ))}
            </div>

            <div style={{ background: "#dff6ea", borderRadius: 18, padding: 20, marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--mint)", letterSpacing: ".04em" }}>
                🎯 IMPACT GOAL
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                {detail.impactGoal}
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "6px 0 10px" }}>Required skills</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
              {detail.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    background: "#f1f3f8",
                    padding: "7px 14px",
                    borderRadius: 999,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>

            <div style={{ background: "#fff0dd", borderRadius: 18, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)", letterSpacing: ".04em" }}>
                ⚠ SAFETY NOTES
              </div>
              <div style={{ fontSize: 14, color: "#4a5475", marginTop: 6, lineHeight: 1.5 }}>
                {detail.safety}
              </div>
            </div>
          </div>

          {/* sticky join card */}
          <div>
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(24,32,59,.08)",
                borderRadius: 20,
                padding: 22,
                boxShadow: "0 24px 48px -28px rgba(24,32,59,.4)",
                position: "sticky",
                top: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "#ece7ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    📅
                  </span>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)" }}>Date &amp; time</div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{detail.date}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "#e2effd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    📍
                  </span>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)" }}>Location</div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                      {mission.org} · {mission.dist} away
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "#fff0ec",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    👥
                  </span>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)" }}>Spots left</div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--coral-deep)" }}>
                      {detail.spotsLeft} of {detail.spotsTotal} remaining
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  height: 8,
                  borderRadius: 99,
                  background: "#f1f3f8",
                  overflow: "hidden",
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 99,
                    background: "linear-gradient(90deg,#1fae82,#8fe3bd)",
                  }}
                />
              </div>

              <div
                className="btn-coral"
                style={{
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: 14,
                  borderRadius: 13,
                  boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
                }}
              >
                Join this mission →
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 11 }}>
                <span
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--ink)",
                    border: "1px solid rgba(24,32,59,.12)",
                    padding: 11,
                    borderRadius: 12,
                  }}
                >
                  ♡ Save
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--ink)",
                    border: "1px solid rgba(24,32,59,.12)",
                    padding: 11,
                    borderRadius: 12,
                  }}
                >
                  💬 Message org
                </span>
              </div>
              <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted-3)", textAlign: "center" }}>
                🔒 You&apos;ll get a QR check-in code after joining
              </div>
            </div>
          </div>
        </div>

        {/* similar */}
        <div style={{ padding: "8px 34px 48px" }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 16px" }}>Similar missions</h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}
            className="card-grid-3"
          >
            {recs.map((m) => (
              <Link
                key={m.slug}
                href={`/missions/${m.slug}`}
                className="lift"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(24,32,59,.06)",
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "block",
                }}
              >
                <div
                  style={{
                    height: 84,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 30,
                    background: causeArt(m),
                  }}
                >
                  {m.emoji}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)", margin: "2px 0 0" }}>
                    📍 {m.dist} · {m.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
