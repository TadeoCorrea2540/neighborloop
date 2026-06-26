import DefaultAvatar from "@/components/default-avatar";
import Icon from "@/components/icons";

export default function VolunteerImpactHero({
  name,
  city,
  bio,
  interests,
  totalHours,
  completedCount,
  causes,
}: {
  name: string;
  city: string | null;
  bio: string | null;
  interests: string[];
  totalHours: number;
  completedCount: number;
  causes: string[];
}) {
  const firstName = name.split(/\s+/)[0] ?? name;
  const story =
    completedCount > 0
      ? `${totalHours} volunteer hour${totalHours === 1 ? "" : "s"} contributed across ${completedCount} completed mission${completedCount === 1 ? "" : "s"}.`
      : "Your impact story starts with your first completed mission.";

  const causeNote =
    causes.length > 0
      ? ` Supporting ${causes.slice(0, 3).join(", ")}${causes.length > 3 ? ` +${causes.length - 3} more` : ""}.`
      : "";

  return (
    <header>
      <div className="impact-hero-banner" aria-hidden>
        <span className="impact-hero-glow" />
      </div>
      <div className="impact-hero-body">
        <div className="impact-hero-head">
          <DefaultAvatar
            size={104}
            radius={28}
            kind="user"
            style={{ border: "5px solid #fff", boxShadow: "0 16px 32px -16px rgba(24,32,59,.5)" }}
          />
          <div className="impact-hero-meta">
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.03em", lineHeight: 1.15 }}>
              {firstName}&apos;s Impact Story
            </h1>
            <div style={{ fontSize: 14, color: "var(--muted-2)", marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {city && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="pin" size={14} />
                  {city}
                </span>
              )}
              <span className="impact-role-badge">
                <Icon name="sparkles" size={12} />
                Volunteer
              </span>
            </div>
          </div>
          <span className="impact-btn-ghost" aria-disabled title="Coming soon">
            Share impact
          </span>
        </div>

        <p className="impact-story-line">
          {story}
          {causeNote}
        </p>

        {totalHours > 0 && (
          <div className="impact-hours-highlight" aria-label={`${totalHours} total volunteer hours`}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--coral-deep)", lineHeight: 1 }}>{totalHours}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-2)" }}>total hours</span>
          </div>
        )}

        {bio && (
          <p style={{ fontSize: 14.5, color: "var(--muted-1)", lineHeight: 1.6, maxWidth: 620, margin: "14px 0 0" }}>{bio}</p>
        )}

        {interests.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }} aria-label="Interests">
            {interests.map((c) => (
              <span key={c} className="impact-interest-pill">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
