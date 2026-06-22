import { ORG_JOURNEY } from "@/lib/organizers-mobile-data";

export default function OrganizerJourneyMobile() {
  return (
    <section
      id="org-how-it-works"
      className="org-journey org-mobile-only"
      aria-labelledby="org-journey-heading"
      tabIndex={-1}
    >
      <div className="org-section-kicker">How it works</div>
      <h2 id="org-journey-heading" className="org-section-heading">
        From idea to volunteers in minutes.
      </h2>
      <ol className="org-journey-steps">
        {ORG_JOURNEY.map((step, i) => (
          <li key={step.title} className="org-journey-step">
            <span className="org-journey-node" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
