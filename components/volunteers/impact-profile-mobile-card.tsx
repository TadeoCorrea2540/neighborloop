export default function ImpactProfileMobileCard() {
  const stats = [
    { v: "42", l: "volunteer hours", c: "#1fae82" },
    { v: "8", l: "missions completed", c: "#3a8bf0" },
    { v: "4", l: "causes supported", c: "#f1543f" },
    { v: "3", l: "badges earned", c: "#7a6bf5" },
    { v: "2", l: "certificates", c: "#ff8a3c" },
  ];

  return (
    <section className="vol-impact vol-mobile-only" aria-labelledby="vol-impact-heading">
      <div className="vol-section-kicker">Your impact</div>
      <h2 id="vol-impact-heading" className="vol-section-heading">
        Keep the impact you create.
      </h2>
      <p className="vol-impact-lead">
        Build a record of the time, skills, and community moments that matter to you.
      </p>

      <article className="vol-impact-card">
        <div className="vol-impact-card-head">
          <span className="vol-impact-avatar" aria-hidden="true" />
          <div>
            <div className="vol-impact-name">Maya&apos;s impact profile</div>
            <div className="vol-impact-since">Volunteering since 2024</div>
          </div>
        </div>
        <div className="vol-impact-stats">
          {stats.map((s) => (
            <div key={s.l} className="vol-impact-stat">
              <div className="vol-impact-stat-v" style={{ color: s.c }}>
                {s.v}
              </div>
              <div className="vol-impact-stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </article>

      <p className="vol-impact-note">
        Certificates, references, stipends, meals, or transport support are only available when organizers explicitly provide them.
      </p>
    </section>
  );
}
