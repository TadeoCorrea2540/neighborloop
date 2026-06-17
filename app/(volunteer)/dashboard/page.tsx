import Link from "next/link";
import { CHART, VOL_STATS, NOTIFS, MISSIONS, causeArt, spotStyle } from "@/lib/data";

export default function Dashboard() {
  const recs = MISSIONS.slice(0, 3);
  const maxBar = Math.max(...CHART.map((c) => c.value));

  return (
    <div>
      {/* welcome */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Welcome back, Maya 👋</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14.5 }}>You&apos;re on a 7-day streak. One mission this week keeps it alive.</p>
        </div>
        <Link href="/explore" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)" }}>+ Find a mission</Link>
      </div>

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }} className="card-grid-4">
        {[
          { tile: "#dff6ea", icon: "⏱️", v: VOL_STATS.hours, l: "hours completed", c: "var(--mint)" },
          { tile: "#e6f0fd", icon: "🎯", v: VOL_STATS.missions, l: "missions joined", c: "var(--blue)" },
          { tile: "#fff0ec", icon: "💚", v: VOL_STATS.people, l: "people helped", c: "var(--coral-deep)" },
          { tile: "#f0ecff", icon: "🏅", v: VOL_STATS.badges, l: "badges earned", c: "var(--lav)" },
        ].map((s) => (
          <div key={s.l} style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid rgba(24,32,59,.05)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: s.tile, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 12, color: s.c }}>{s.v.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: "var(--muted-3)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }} className="dash-split">
        {/* chart */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Hours this week</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--mint)", background: "#dff6ea", padding: "4px 10px", borderRadius: 999 }}>▲ 18% vs last week</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 170 }}>
            {CHART.map((b) => (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", maxWidth: 34, borderRadius: "9px 9px 4px 4px", background: "linear-gradient(180deg,#ff8a5c,#ff5e7a)", height: `${(b.value / maxBar) * 100}%`, transition: "height .5s ease" }} />
                <span style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* activity */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Activity</div>
            <span style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600 }}>Mark all read</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {NOTIFS.map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", animation: "slidein .5s ease both", animationDelay: `${i * 0.09}s` }}>
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

      {/* recommended */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Recommended for you</div>
          <Link href="/explore" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>See all →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="card-grid-3">
          {recs.map((m) => {
            const ss = spotStyle(m.spots);
            return (
              <Link key={m.slug} href={`/missions/${m.slug}`} className="lift" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "block" }}>
                <div style={{ height: 84, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, background: causeArt(m) }}>{m.emoji}</div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.25 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)", margin: "2px 0 10px" }}>📍 {m.dist} · {m.date}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 9px", borderRadius: 999, ...ss }}>{m.spots} spots</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-deep)" }}>Join →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
