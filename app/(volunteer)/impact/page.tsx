import Link from "next/link";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server";
import { getVolunteerDashboardSummary } from "@/lib/data/applications";
import { getVolunteerImpactSummary } from "@/lib/data/volunteer-impact";
import { getVolunteerCertificates } from "@/lib/data/certificates";
import { getVolunteerTimeline, getVolunteerCauseBreakdown, milestonesFromSummary } from "@/lib/data/analytics/volunteer";
import { fmtDate } from "@/components/admin/badges";
import DefaultAvatar from "@/components/default-avatar";

export const dynamic = "force-dynamic";

export default async function Impact() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);
  const [summary, impact, certificates, timelineAll, causeBreakdown] = user
    ? await Promise.all([
        getVolunteerDashboardSummary(user.id),
        getVolunteerImpactSummary(user.id),
        getVolunteerCertificates(user.id),
        getVolunteerTimeline(user.id),
        getVolunteerCauseBreakdown(user.id),
      ])
    : [
        { savedCount: 0, pendingCount: 0, approvedCount: 0, totalApplied: 0, nextUpcoming: null },
        { completedCount: 0, totalHours: 0, certificatesCount: 0, causes: [], recentCompleted: [] },
        [],
        [],
        [],
      ];

  const milestones = milestonesFromSummary(impact);
  const timeline = timelineAll.slice(-12); // last 12 months
  const maxHours = Math.max(1, ...timeline.map((t) => t.hours));

  const name = profile?.display_name?.trim() || "Neighbor";
  const city = profile?.city?.trim();
  const bio = profile?.bio?.trim();
  const interests = profile?.interests ?? [];

  const stats = [
    { v: impact.totalHours, l: "volunteer hours", c: "#e8543f" },
    { v: impact.completedCount, l: "completed", c: "#1fae82" },
    { v: summary.approvedCount, l: "approved", c: "#3a8bf0" },
    { v: summary.totalApplied, l: "applied", c: "#7a6bf5" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px -50px rgba(24,32,59,.55)", border: "1px solid rgba(24,32,59,.06)" }}>
      <div style={{ height: 150, background: "linear-gradient(120deg,#ece2ff,#dbeeff,#ffe3d6)", backgroundSize: "200% 200%", animation: "gshift 10s ease infinite", position: "relative" }}>
        <span style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.6),transparent 70%)", top: -60, right: 80 }} />
      </div>

      <div style={{ padding: "0 34px 34px", marginTop: -52, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
          <DefaultAvatar size={104} radius={28} kind="user" style={{ border: "5px solid #fff", boxShadow: "0 16px 32px -16px rgba(24,32,59,.5)" }} />
          <div style={{ paddingBottom: 6 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>{name}</h2>
            <div style={{ fontSize: 14, color: "#6b7799", marginTop: 3 }}>
              {city ? `📍 ${city}` : "📍 Your neighborhood"} · Volunteer
            </div>
          </div>
        </div>

        {bio && <p style={{ fontSize: 15, color: "#4a5475", lineHeight: 1.6, maxWidth: 620, margin: "20px 0 0" }}>{bio}</p>}

        {interests.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 24px" }}>
            {interests.map((c) => (
              <span key={c} style={{ fontSize: 13, fontWeight: 600, background: "#ece7ff", color: "#7a6bf5", padding: "7px 14px", borderRadius: 999 }}>{c}</span>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, margin: interests.length ? "0 0 26px" : "24px 0 26px" }} className="card-grid-4">
          {stats.map((s) => (
            <div key={s.l} style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: 20 }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: s.c }}>{s.v.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: "#9aa3bd" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {timeline.length > 0 && (
          <div style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: "20px 22px", margin: "0 0 26px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 2px" }}>Impact over time</h3>
            <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "0 0 18px" }}>Confirmed volunteer hours by month</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
              {timeline.map((t) => (
                <div key={t.period} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end", minWidth: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#e8543f" }}>{t.hours}h</span>
                  <div title={`${t.label}: ${t.hours}h · ${t.completed} completed`} style={{ width: "100%", maxWidth: 40, borderRadius: "9px 9px 4px 4px", background: "linear-gradient(180deg,#ffb39c,#ff6f5e)", height: `${Math.max(4, (t.hours / maxHours) * 100)}%`, transition: "height .5s" }} />
                  <span style={{ fontSize: 10.5, color: "var(--muted-3)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }} className="detail-split">
          {/* real hours & mission history */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>Hours &amp; mission history</h3>
            {impact.recentCompleted.length === 0 ? (
              <div style={{ border: "1px dashed rgba(24,32,59,.16)", borderRadius: 16, padding: "32px 20px", textAlign: "center", color: "var(--muted-2)", background: "#fbfcfe" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>⏱️</div>
                <div style={{ fontWeight: 700, color: "var(--ink)" }}>No confirmed hours yet</div>
                <div style={{ fontSize: 13.5, marginTop: 4 }}>Once organizers confirm your attendance, your hours and completed missions appear here.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {impact.recentCompleted.map((m) => (
                  <div key={m.attendanceId} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "12px 14px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{m.missionTitle}</div>
                      <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>{m.organizationName} · {fmtDate(m.startsAt)}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#e8543f" }}>{m.hoursCredited}h</span>
                    {m.certificateId && (
                      <Link href={`/certificates/${m.certificateId}`} style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#18203b", padding: "6px 11px", borderRadius: 9 }}>Certificate</Link>
                    )}
                  </div>
                ))}
                {causeBreakdown.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 11 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>Causes supported</div>
                    {causeBreakdown.map((c) => (
                      <div key={c.categoryId}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13 }}>
                          <span style={{ fontWeight: 600 }}>{c.iconKey ?? "✨"} {c.name}</span>
                          <span style={{ color: "var(--muted-3)", fontWeight: 700, fontSize: 12.5 }}>{c.hours}h · {c.completed} mission{c.completed === 1 ? "" : "s"}</span>
                        </div>
                        <div style={{ height: 7, borderRadius: 99, background: "#eef0f5", overflow: "hidden", marginTop: 5 }}>
                          <span style={{ display: "block", height: "100%", width: `${Math.max(4, c.pct)}%`, borderRadius: 99, background: c.accentColor ?? "#7a6bf5" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* certificates (real) + badges (coming soon) */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px" }}>Certificates</h3>
            {certificates.length === 0 ? (
              <div style={{ border: "1px dashed rgba(24,32,59,.16)", borderRadius: 14, padding: "20px", textAlign: "center", fontSize: 13.5, color: "var(--muted-2)", background: "#fbfcfe", marginBottom: 24 }}>
                Certificates appear here after organizers confirm your attendance.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {certificates.map((c) => (
                  <Link key={c.id} href={`/certificates/${c.id}`} style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(180deg,#fff,#fffaf8)", border: "1px solid rgba(255,111,94,.25)", borderRadius: 14, padding: "12px 14px" }}>
                    <span style={{ fontSize: 20 }}>🏅</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.missionTitle}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{c.hoursCredited}h · {c.certificateNumber}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--coral-deep,#e8543f)" }}>View →</span>
                  </Link>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 14px" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Milestones</h3>
              <Link href="/badges" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--coral-deep,#e8543f)" }}>All →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {milestones.map((m) => (
                <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, border: `1px solid ${m.achieved ? "rgba(31,174,130,.3)" : "rgba(24,32,59,.08)"}`, background: m.achieved ? "#f1fbf6" : "#fbfcfe" }}>
                  <span style={{ fontSize: 22, filter: m.achieved ? "none" : "grayscale(.8)", opacity: m.achieved ? 1 : 0.5 }}>{m.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: m.achieved ? "var(--ink)" : "var(--muted-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: m.achieved ? "var(--mint,#1fae82)" : "var(--muted-3)", marginTop: 2, fontWeight: 600 }}>
                      {m.achieved ? "Unlocked ✓" : `${Math.min(m.current, m.target)} / ${m.target}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
