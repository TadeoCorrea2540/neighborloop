import Link from "next/link";
import { CHART, NOTIFS } from "@/lib/data";
import { iconKeyToEmoji } from "@/lib/categories";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server";
import { getVolunteerDashboardSummary } from "@/lib/data/applications";
import { getExploreMissionCards } from "@/lib/data/mission-cards";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function Dashboard() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);
  const name = profile?.display_name?.trim();
  const greeting = name ? `Welcome back, ${name} 👋` : "Welcome back 👋";

  const summary = user
    ? await getVolunteerDashboardSummary(user.id)
    : { savedCount: 0, pendingCount: 0, approvedCount: 0, totalApplied: 0, nextUpcoming: null };
  const recs = await getExploreMissionCards({ sort: "soonest", limit: 3 }, { userId: user?.id });

  const maxBar = Math.max(...CHART.map((c) => c.value));
  const sub = summary.nextUpcoming
    ? `Next up: ${summary.nextUpcoming.title} · ${fmtDate(summary.nextUpcoming.startsAt)}`
    : "Find a mission this week to get started.";

  const stats = [
    { tile: "#dff6ea", icon: "🔖", v: summary.savedCount, l: "saved missions", c: "var(--mint)" },
    { tile: "#fff0dd", icon: "⏳", v: summary.pendingCount, l: "pending applications", c: "var(--coral-deep)" },
    { tile: "#e6f0fd", icon: "✅", v: summary.approvedCount, l: "approved missions", c: "var(--blue)" },
    { tile: "#f0ecff", icon: "🎯", v: summary.totalApplied, l: "total applied", c: "var(--lav)" },
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
        {/* chart — placeholder until attendance/hours tracking exists */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              Hours this week{" "}
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-3)", background: "#f1f3f8", padding: "2px 8px", borderRadius: 999, marginLeft: 6 }}>Coming soon</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 170, opacity: 0.55 }}>
            {CHART.map((b) => (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", maxWidth: 34, borderRadius: "9px 9px 4px 4px", background: "linear-gradient(180deg,#ff8a5c,#ff5e7a)", height: `${(b.value / maxBar) * 100}%` }} />
                <span style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* activity — placeholder sample */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              Activity{" "}
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-3)", background: "#f1f3f8", padding: "2px 8px", borderRadius: 999, marginLeft: 6 }}>Coming soon</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, opacity: 0.6 }}>
            {NOTIFS.map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <span style={{ width: 34, height: 34, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, background: n.tile }}>{n.emoji}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{n.text}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
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
