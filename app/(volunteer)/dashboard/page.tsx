import Link from "next/link";
import { iconKeyToEmoji } from "@/lib/categories";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server";
import { getVolunteerDashboardSummary } from "@/lib/data/applications";
import { getExploreMissionCards } from "@/lib/data/mission-cards";
import { getVolunteerImpactSummary } from "@/lib/data/volunteer-impact";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function Dashboard() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);
  const name = profile?.display_name?.trim();
  const greeting = name ? `Welcome back, ${name} 👋` : "Welcome back 👋";

  const [summary, impact] = user
    ? await Promise.all([getVolunteerDashboardSummary(user.id), getVolunteerImpactSummary(user.id)])
    : [
        { savedCount: 0, pendingCount: 0, approvedCount: 0, totalApplied: 0, nextUpcoming: null },
        { completedCount: 0, totalHours: 0, certificatesCount: 0, causes: [], recentCompleted: [] },
      ];
  const recs = await getExploreMissionCards({ sort: "soonest", limit: 3 }, { userId: user?.id });

  const sub = summary.nextUpcoming
    ? `Next up: ${summary.nextUpcoming.title} · ${fmtDate(summary.nextUpcoming.startsAt)}`
    : "Find a mission this week to get started.";

  const stats = [
    { tile: "#dff6ea", icon: "🔖", v: summary.savedCount, l: "saved missions", c: "var(--coral)" },
    { tile: "#fff0dd", icon: "⏳", v: summary.pendingCount, l: "pending applications", c: "var(--ink)" },
    { tile: "#e6f0fd", icon: "✅", v: summary.approvedCount, l: "approved missions", c: "var(--coral)" },
    { tile: "#f0ecff", icon: "🎯", v: summary.totalApplied, l: "total applied", c: "var(--ink)" },
  ];

  return (
    <div>
      {/* welcome */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>{greeting}</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14.5 }}>{sub}</p>
        </div>
        <Link href="/explore" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)" }}>+ Find a mission</Link>
      </div>

      {/* stat cards (real) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }} className="card-grid-4">
        {stats.map((s) => (
          <div key={s.l} style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid rgba(24,32,59,.05)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: s.tile, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 12, color: s.c }}>{s.v.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: "var(--muted-3)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }} className="dash-split">
        {/* real impact */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Your impact</div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "var(--coral)" }}>{impact.totalHours}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>volunteer hours</div>
            </div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "var(--ink)" }}>{impact.completedCount}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>completed missions</div>
            </div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "var(--coral)" }}>{impact.certificatesCount}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>certificates</div>
            </div>
          </div>
          {impact.recentCompleted.length === 0 ? (
            <div style={{ fontSize: 13.5, color: "var(--muted-3)", background: "#fbfcfe", border: "1px dashed rgba(24,32,59,.14)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
              Your confirmed hours appear here after organizers check you in. <Link href="/explore" style={{ color: "var(--coral-deep)", fontWeight: 600 }}>Find a mission →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {impact.recentCompleted.map((m, i) => (
                <div key={m.attendanceId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < impact.recentCompleted.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.missionTitle}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{m.organizationName}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#e8543f" }}>{m.hoursCredited}h</span>
                  {m.certificateId && <Link href={`/certificates/${m.certificateId}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)" }}>cert</Link>}
                </div>
              ))}
              <Link href="/impact" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)", paddingTop: 10 }}>View full impact →</Link>
            </div>
          )}
        </div>

        {/* next mission */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Next mission</div>
          {summary.nextUpcoming ? (
            <div style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--mint)" }}>✓ Approved</div>
              <div style={{ fontWeight: 700, fontSize: 15.5, marginTop: 6 }}>{summary.nextUpcoming.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted-3)", marginTop: 2 }}>📅 {fmtDate(summary.nextUpcoming.startsAt)}</div>
              <Link href="/my-missions" style={{ display: "inline-block", marginTop: 12, fontSize: 13, fontWeight: 700, color: "#fff", background: "#18203b", padding: "9px 14px", borderRadius: 11 }}>View My Missions</Link>
            </div>
          ) : (
            <div style={{ fontSize: 13.5, color: "var(--muted-3)", textAlign: "center", padding: "20px 8px" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>🗓️</div>
              No upcoming mission yet. <Link href="/explore" style={{ color: "var(--coral-deep)", fontWeight: 600 }}>Find one →</Link>
            </div>
          )}
        </div>
      </div>

      {/* recommended (real) */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Recommended for you</div>
          <Link href="/explore" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>See all →</Link>
        </div>
        {recs.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px dashed rgba(24,32,59,.14)", padding: "34px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 30 }}>🌱</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>No missions published yet</div>
            <div style={{ fontSize: 13.5, color: "var(--muted-3)", marginTop: 2 }}>New opportunities will appear here as organizations post them.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="card-grid-3">
            {recs.map((card) => {
              const m = card.mission;
              const accent = card.categoryAccentColor || "#ff8a5c";
              const spots = card.spotsLeft == null ? "Open" : card.isFull ? "Full" : `${card.spotsLeft} spots`;
              return (
                <Link key={m.id} href={`/missions/${m.slug}`} className="lift" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "block", textDecoration: "none", color: "inherit" }}>
                  <div style={{ height: 84, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, background: `linear-gradient(135deg, ${accent}33, ${accent})` }}>{iconKeyToEmoji(card.categoryIconKey)}</div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.25 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)", margin: "2px 0 10px" }}>📍 {m.isVirtual ? "Virtual" : m.city || m.locationLabel || "Nearby"} · {fmtDate(m.startsAt)}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 9px", borderRadius: 999, background: card.isFull ? "#f1f3f8" : "#dff6ea", color: card.isFull ? "var(--muted-2)" : "#1fae82" }}>{spots}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-deep)" }}>View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
