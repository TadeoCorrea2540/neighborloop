import type { VolunteerCauseSlice } from "@/lib/data/analytics/volunteer";

export default function CauseImpactGrid({
  causes,
  interests,
}: {
  causes: VolunteerCauseSlice[];
  interests: string[];
}) {
  if (causes.length === 0 && interests.length === 0) return null;

  return (
    <section style={{ marginBottom: 22 }} aria-labelledby="causes-heading">
      <h2 id="causes-heading" className="impact-section-title">
        Causes supported
      </h2>
      <p className="impact-section-sub">Where your volunteer hours made a difference</p>

      {causes.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {causes.map((c) => (
            <div key={c.categoryId} className="impact-cause-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {c.hours}h · {c.completed} mission{c.completed === 1 ? "" : "s"}
                </span>
              </div>
              <div className="impact-cause-bar" aria-hidden>
                <span style={{ width: `${Math.max(4, c.pct)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {interests.map((i) => (
            <span key={i} className="impact-interest-pill">
              {i}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
