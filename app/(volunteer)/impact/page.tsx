import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server";
import { getVolunteerDashboardSummary } from "@/lib/data/applications";

const COLLECTION = [
  { emoji: "🌟" }, { emoji: "⏱️" }, { emoji: "🤝" }, { emoji: "🌍" },
  { emoji: "📚" }, { emoji: "🔥" }, { emoji: "💯" }, { emoji: "🏆" },
];

function ComingSoon() {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-3)", background: "#f1f3f8", padding: "2px 8px", borderRadius: 999, marginLeft: 8 }}>
      Coming soon
    </span>
  );
}

export default async function Impact() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);
  const summary = user
    ? await getVolunteerDashboardSummary(user.id)
    : { savedCount: 0, pendingCount: 0, approvedCount: 0, totalApplied: 0, nextUpcoming: null };

  const name = profile?.display_name?.trim() || "Neighbor";
  const city = profile?.city?.trim();
  const bio = profile?.bio?.trim();
  const interests = profile?.interests ?? [];

  const stats = [
    { v: summary.totalApplied, l: "missions applied", c: "#3a8bf0" },
    { v: summary.approvedCount, l: "approved", c: "#1fae82" },
    { v: summary.savedCount, l: "saved", c: "#7a6bf5" },
    { v: summary.pendingCount, l: "pending", c: "#f1543f" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px -50px rgba(24,32,59,.55)", border: "1px solid rgba(24,32,59,.06)" }}>
      <div style={{ height: 150, background: "linear-gradient(120deg,#ece2ff,#dbeeff,#ffe3d6)", backgroundSize: "200% 200%", animation: "gshift 10s ease infinite", position: "relative" }}>
        <span style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.6),transparent 70%)", top: -60, right: 80 }} />
      </div>

      <div style={{ padding: "0 34px 34px", marginTop: -52, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
          <span style={{ width: 104, height: 104, borderRadius: 28, background: "linear-gradient(135deg,#bca6ff,#7a6bf5)", border: "5px solid #fff", boxShadow: "0 16px 32px -16px rgba(24,32,59,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#fff", fontWeight: 800 }}>
            {name.charAt(0).toUpperCase()}
          </span>
          <div style={{ paddingBottom: 6 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>{name}</h2>
            <div style={{ fontSize: 14, color: "#6b7799", marginTop: 3 }}>
              {city ? `📍 ${city}` : "📍 Your neighborhood"} · Volunteer
            </div>
          </div>
        </div>

        {bio && (
          <p style={{ fontSize: 15, color: "#4a5475", lineHeight: 1.6, maxWidth: 620, margin: "20px 0 0" }}>{bio}</p>
        )}

        {interests.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 24px" }}>
            {interests.map((c) => (
              <span key={c} style={{ fontSize: 13, fontWeight: 600, background: "#ece7ff", color: "#7a6bf5", padding: "7px 14px", borderRadius: 999 }}>{c}</span>
            ))}
          </div>
        )}

        {/* real activity counts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, margin: interests.length ? "0 0 26px" : "24px 0 26px" }} className="card-grid-4">
          {stats.map((s) => (
            <div key={s.l} style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: 20 }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: s.c }}>{s.v.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: "#9aa3bd" }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }} className="detail-split">
          {/* hours timeline — placeholder */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", display: "flex", alignItems: "center" }}>
              Hours &amp; mission history <ComingSoon />
            </h3>
            <div style={{ border: "1px dashed rgba(24,32,59,.16)", borderRadius: 16, padding: "32px 20px", textAlign: "center", color: "var(--muted-2)", background: "#fbfcfe" }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>⏱️</div>
              <div style={{ fontWeight: 700, color: "var(--ink)" }}>Verified hours are on the way</div>
              <div style={{ fontSize: 13.5, marginTop: 4 }}>Once organizers check you in at missions, your logged hours and history will appear here.</div>
            </div>
          </div>

          {/* badges + certs — placeholder */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", display: "flex", alignItems: "center" }}>
              Badges <ComingSoon />
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24, opacity: 0.55 }}>
              {COLLECTION.map((b, i) => (
                <div key={i} style={{ aspectRatio: "1", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, background: "#eef0f5", filter: "grayscale(.7)" }}>
                  {b.emoji}
                </div>
              ))}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px", display: "flex", alignItems: "center" }}>
              Certificates <ComingSoon />
            </h3>
            <div style={{ border: "1px dashed rgba(24,32,59,.16)", borderRadius: 14, padding: "20px", textAlign: "center", fontSize: 13.5, color: "var(--muted-2)", background: "#fbfcfe" }}>
              Earn certificates by completing verified missions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
