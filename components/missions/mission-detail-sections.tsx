import Icon from "@/components/icons";

export default function MissionDetailSections({
  whatYoullDo,
  bullets,
  impactGoal,
  skills,
  isBeginnerFriendly,
  safety,
  orgVerified,
}: {
  whatYoullDo: string;
  bullets: string[];
  impactGoal: string;
  skills: string[];
  isBeginnerFriendly: boolean;
  safety: string;
  orgVerified: boolean;
}) {
  const showSkills = skills.length > 0 || isBeginnerFriendly;

  return (
    <div className="md-sections">
      <section className="md-section md-reveal md-reveal--delay-2">
        <h2 className="md-section-title">What you&apos;ll do</h2>
        <div className="md-section-card">
          <p className="md-section-lead">{whatYoullDo}</p>
          {bullets.length > 0 && (
            <ul className="md-checklist">
              {bullets.map((item) => (
                <li key={item}>
                  <Icon name="check" size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="md-impact md-reveal md-reveal--delay-3" aria-labelledby="md-impact-heading">
        <div className="md-impact-glow" aria-hidden="true" />
        <div className="md-impact-icon" aria-hidden="true">
          <Icon name="sparkles" size={18} />
        </div>
        <div className="md-impact-kicker" id="md-impact-heading">
          Impact goal
        </div>
        <p className="md-impact-text">{impactGoal}</p>
      </section>

      {showSkills && (
        <section className="md-section md-reveal md-reveal--delay-4">
          <h2 className="md-section-title">Required skills</h2>
          <div className="md-chips">
            {skills.map((s) => (
              <span key={s} className="md-chip">
                {s}
              </span>
            ))}
            {skills.length === 0 && isBeginnerFriendly && (
              <span className="md-chip md-chip--mint">No prior experience needed</span>
            )}
          </div>
        </section>
      )}

      <section className="md-safety md-reveal md-reveal--delay-5">
        <div className="md-safety-label">
          <Icon name="shield-check" size={16} />
          Safety notes
        </div>
        <p className="md-safety-text">{safety}</p>
      </section>

      <section className="md-trust md-reveal md-reveal--delay-6" aria-label="Trust and check-in">
        <div className="md-trust-item">
          <Icon name="check-circle" size={16} />
          <span>QR check-in after you&apos;re approved</span>
        </div>
        {orgVerified && (
          <div className="md-trust-item">
            <Icon name="verified" size={16} />
            <span>Verified organization</span>
          </div>
        )}
        <div className="md-trust-item">
          <Icon name="clock" size={16} />
          <span>Hours can be confirmed by your organizer</span>
        </div>
      </section>
    </div>
  );
}
