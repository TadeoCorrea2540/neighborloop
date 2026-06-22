import { COMMUNITY_ACTIVITY } from "@/lib/volunteers-mobile-data";

export default function CommunityActivityStrip() {
  return (
    <section className="vol-community vol-mobile-only" aria-labelledby="vol-community-heading">
      <div className="vol-section-kicker">Community</div>
      <h2 id="vol-community-heading" className="vol-section-heading">
        People are showing up near you.
      </h2>
      <ul className="vol-activity-list">
        {COMMUNITY_ACTIVITY.map((item, i) => (
          <li
            key={item.text}
            className="vol-activity-item"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="vol-activity-avatar" style={{ background: item.color }}>
              {item.initials}
            </span>
            <div className="vol-activity-copy">
              <div className="vol-activity-text">{item.text}</div>
              <div className="vol-activity-time">
                {item.pin && <span className="vol-activity-pin" aria-hidden="true" />}
                {item.time}
              </div>
            </div>
            <span className="vol-activity-dot" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  );
}
