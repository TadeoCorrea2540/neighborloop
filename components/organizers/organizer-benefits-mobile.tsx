import { ORG_BENEFITS } from "@/lib/organizers-mobile-data";

export default function OrganizerBenefitsMobile() {
  return (
    <section className="org-benefits org-mobile-only" aria-labelledby="org-benefits-heading">
      <div className="org-section-kicker">Why organizers</div>
      <h2 id="org-benefits-heading" className="org-section-heading">
        Less organizing. More impact.
      </h2>
      <p className="org-benefits-lead">
        Replace scattered messages, spreadsheets, and last-minute confusion with one clear mission space.
      </p>
      <ul className="org-benefits-list">
        {ORG_BENEFITS.map((item) => (
          <li key={item.title} className="org-benefit-item" style={{ background: item.bg }}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
