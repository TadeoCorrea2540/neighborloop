import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { getVolunteerImpactSummary } from "@/lib/data/volunteer-impact";
import { milestonesFromSummary } from "@/lib/data/analytics/volunteer";

export const dynamic = "force-dynamic";

export default async function Badges() {
  const user = await getCurrentUser();
  const impact = user
    ? await getVolunteerImpactSummary(user.id)
    : { completedCount: 0, totalHours: 0, certificatesCount: 0, causes: [], recentCompleted: [] };
  const milestones = milestonesFromSummary(impact);

  const unlocked = milestones.filter((m) => m.achieved).length;
  const next = milestones.find((m) => !m.achieved) ?? null;
  const pctOf = (current: number, target: number) => Math.min(100, Math.round((current / target) * 100));

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Milestones &amp; Rewards</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7799", fontSize: 14.5 }}>
            {unlocked} of {milestones.length} unlocked · earned from real completed missions
          </p>
        </div>
        <Link href="/explore" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)" }}>
          ✦ Find a mission
        </Link>
      </div>

      {/* next milestone progress banner (real) */}
      {next ? (
        <div style={{ background: "linear-gradient(120deg,#fff0ec,#f0ecff)", borderRadius: 18, padding: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#ff8a5c,#ff5e7a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
            {next.emoji}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Next: {next.label}</div>
            <div style={{ fontSize: 13, color: "#5a6685", margin: "3px 0 8px" }}>
              {Math.min(next.current, next.target)} of {next.target} · {pctOf(next.current, next.target)}% there
            </div>
            <div style={{ height: 9, borderRadius: 99, background: "rgba(255,255,255,.7)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${Math.max(4, pctOf(next.current, next.target))}%`, borderRadius: 99, background: "linear-gradient(90deg,#ff8a5c,#ff5e7a)", transition: "width .5s" }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: "linear-gradient(120deg,#eafaf2,#f0ecff)", borderRadius: 18, padding: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 30 }}>🏆</span>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Every milestone unlocked — incredible impact. Thank you for showing up.</div>
        </div>
      )}

      {/* milestone grid (real) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="card-grid-3">
        {milestones.map((m) => {
          const locked = !m.achieved;
          return (
            <div key={m.key} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: 20, textAlign: "center", opacity: locked ? 0.82 : 1 }}>
              <div style={{ width: 64, height: 64, margin: "0 auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, background: locked ? "#eef0f5" : "linear-gradient(135deg,#ffe08a,#ff9e3c)", filter: locked ? "grayscale(.7)" : "none", boxShadow: locked ? "none" : "0 10px 20px -12px rgba(255,158,60,.7)" }}>
                {m.emoji}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 12 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: locked ? "#9aa3bd" : "var(--mint,#1fae82)", marginTop: 2, fontWeight: 600 }}>
                {locked ? `${Math.min(m.current, m.target)} / ${m.target}` : "Unlocked ✓"}
              </div>
              {locked && (
                <div style={{ height: 6, borderRadius: 99, background: "#eef0f5", overflow: "hidden", marginTop: 11 }}>
                  <span style={{ display: "block", height: "100%", width: `${Math.max(4, pctOf(m.current, m.target))}%`, borderRadius: 99, background: "#bca6ff" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
