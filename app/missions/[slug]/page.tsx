import Link from "next/link";
import { notFound } from "next/navigation";
import PublicNav from "@/components/public-nav";
import { causeArt } from "@/lib/data";
import { loadLiveMissionView } from "@/lib/mission-view";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";
import { getVolunteerApplicationForMission } from "@/lib/data/applications";
import { getSavedMissionIdsForUser } from "@/lib/data/profiles";
import { getVolunteerAttendanceForMission, type AttendanceStatus } from "@/lib/data/attendance";
import MissionActions from "@/components/volunteer/mission-actions";
import type { ApplicationStatus } from "@/types/database";

type ViewerRole = "anon" | "volunteer" | "organizer" | "admin";

export default async function MissionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // Real-only: a published Supabase mission, or 404. No mock fallback.
  const view = await loadLiveMissionView(params.slug);
  if (!view) notFound();
  const { missionId, mission, detail, recs } = view;

  // Viewer context drives the apply/save CTA.
  const user = await getCurrentUser();
  let role: ViewerRole = "anon";
  let appStatus: ApplicationStatus | null = null;
  let appId: string | null = null;
  let isSaved = false;
  let attendanceStatus: AttendanceStatus | null = null;
  let hoursCredited: number | null = null;
  let certificateId: string | null = null;
  if (user) {
    role = (await getCurrentUserRole()) ?? "volunteer";
    if (role === "volunteer") {
      const [app, savedIds, attendance] = await Promise.all([
        getVolunteerApplicationForMission(user.id, missionId),
        getSavedMissionIdsForUser(user.id),
        getVolunteerAttendanceForMission(user.id, missionId),
      ]);
      appStatus = app?.status ?? null;
      appId = app?.id ?? null;
      isSaved = savedIds.includes(missionId);
      attendanceStatus = attendance?.status ?? null;
      hoursCredited = attendance?.hoursCredited ?? null;
      certificateId = attendance?.certificateId ?? null;
    }
  }

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
                      {mission.dist === "Virtual" ? "Virtual mission" : mission.dist}
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

              <MissionActions
                missionId={missionId}
                missionSlug={params.slug}
                role={role}
                initialStatus={appStatus}
                initialApplicationId={appId}
                initialSaved={isSaved}
                attendanceStatus={attendanceStatus}
                hoursCredited={hoursCredited}
                certificateId={certificateId}
              />
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
