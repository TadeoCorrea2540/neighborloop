import { MOBILE_JOURNEY } from "@/lib/volunteers-mobile-data";

export default function MobileVolunteerJourney() {
  return (
    <section
      id="vol-how-it-works"
      className="vol-journey vol-mobile-only"
      aria-labelledby="vol-journey-heading"
      tabIndex={-1}
    >
      <div className="vol-section-kicker">How it works</div>
      <h2 id="vol-journey-heading" className="vol-section-heading">
        Start helping in minutes.
      </h2>
      <ol className="vol-journey-steps">
        {MOBILE_JOURNEY.map((step, i) => (
          <li key={step.title} className="vol-journey-step">
            <span className="vol-journey-node" aria-hidden="true">
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
