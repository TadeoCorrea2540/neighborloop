import DefaultAvatar from "@/components/default-avatar";
import Icon from "@/components/icons";
import ImpactHeroFootprint from "./impact-hero-footprint";
import type { CompletedMission } from "@/lib/data/volunteer-impact";

function formatCauseSentence(causes: string[]): string {
  if (causes.length === 0) return "";
  const list = causes.slice(0, 3).map((c) => c.toLowerCase());
  if (list.length === 1) return `Supporting ${list[0]} in your community.`;
  if (list.length === 2) return `Supporting ${list[0]} and ${list[1]} in your community.`;
  const tail = list.pop()!;
  return `Supporting ${list.join(", ")}, and ${tail} in your community.`;
}

export default function VolunteerImpactHero({
  name,
  city,
  bio,
  interests,
  totalHours,
  completedCount,
  causes,
  recentCompleted = [],
}: {
  name: string;
  city: string | null;
  bio: string | null;
  interests: string[];
  totalHours: number;
  completedCount: number;
  causes: string[];
  recentCompleted?: CompletedMission[];
}) {
  const firstName = name.split(/\s+/)[0] ?? name;
  const hasImpact = completedCount > 0;
  const causeSentence = formatCauseSentence(causes);

  return (
    <header className="impact-hero">
      <div className="impact-hero-banner" aria-hidden>
        <span className="impact-hero-glow" />
        <span className="impact-hero-banner-orb impact-hero-banner-orb--left" />
        <span className="impact-hero-banner-orb impact-hero-banner-orb--right" />
      </div>

      <div className="impact-hero-body">
        <div className="impact-hero-card">
          <span className="impact-hero-card-accent" aria-hidden />
          <span className="impact-hero-card-texture" aria-hidden />

          <div className="impact-hero-grid">
            <div className="impact-hero-identity impact-hero-reveal impact-hero-reveal--1">
              <div className="impact-hero-avatar-block">
                <span className="impact-hero-avatar-blob" aria-hidden />
                <div className="impact-hero-avatar-inner">
                  <DefaultAvatar
                    size={84}
                    radius={22}
                    kind="user"
                    style={{
                      border: "3px solid #fff",
                      boxShadow: "0 10px 24px -14px rgba(24,32,59,.45)",
                    }}
                  />
                </div>
                <span className="impact-hero-avatar-badge">
                  <Icon name="sparkles" size={11} strokeWidth={2.3} />
                  Volunteer
                </span>
              </div>

              <div className="impact-hero-meta">
                <p className="impact-hero-eyebrow">
                  <Icon name="award" size={12} strokeWidth={2.2} />
                  Personal impact
                </p>
                <h1 className="impact-hero-title">
                  {firstName}&apos;s
                  <span className="impact-hero-title-dot" aria-hidden>
                    ·
                  </span>
                  <span className="impact-hero-title-accent">Impact</span> Story
                </h1>
                {city && (
                  <p className="impact-hero-location">
                    <Icon name="pin" size={14} strokeWidth={2.2} />
                    {city}
                  </p>
                )}
                <div className="impact-hero-story-copy">
                  {hasImpact ? (
                    <p className="impact-story-line">
                      <strong className="impact-story-em">{totalHours}</strong> volunteer hour
                      {totalHours === 1 ? "" : "s"} contributed across{" "}
                      <strong className="impact-story-em">{completedCount}</strong> completed mission
                      {completedCount === 1 ? "" : "s"}.
                    </p>
                  ) : (
                    <p className="impact-story-line impact-story-line--empty">
                      Your impact story starts with your first completed mission.
                    </p>
                  )}
                  {causeSentence && <p className="impact-story-causes">{causeSentence}</p>}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="impact-btn-share impact-hero-reveal impact-hero-reveal--2"
              disabled
              aria-disabled="true"
              title="Coming soon"
            >
              <Icon name="send" size={15} strokeWidth={2.2} />
              Share impact
            </button>

            <div className="impact-hero-footprint-row impact-hero-reveal impact-hero-reveal--3">
              <ImpactHeroFootprint missions={hasImpact ? recentCompleted : []} />
            </div>
          </div>

          {(bio || interests.length > 0) && (
            <div className="impact-hero-footer impact-hero-reveal impact-hero-reveal--3">
              {bio && <p className="impact-hero-bio">{bio}</p>}
              {interests.length > 0 && (
                <div className="impact-hero-interests" aria-label="Interests">
                  {interests.map((c) => (
                    <span key={c} className="impact-interest-pill">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
