import { MOBILE_WHY } from "@/lib/volunteers-mobile-data";

export default function MobileWhyVolunteer() {
  return (
    <section className="vol-why vol-mobile-only" aria-labelledby="vol-why-heading">
      <div className="vol-section-kicker">Why volunteer</div>
      <h2 id="vol-why-heading" className="vol-section-heading">
        Make time feel meaningful.
      </h2>
      <p className="vol-why-lead">
        Join locally. Learn by doing. Build a story you can be proud of.
      </p>
      <ul className="vol-why-list">
        {MOBILE_WHY.map((item) => (
          <li key={item.title} className="vol-why-item" style={{ background: item.bg }}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
