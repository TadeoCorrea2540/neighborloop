import Link from "next/link";

export default function VolunteerOrganizerSplit() {
  return (
    <section className="home-split-mobile home-mobile-only" aria-labelledby="mobile-split-heading">
      <h2 id="mobile-split-heading" className="home-section-heading">
        How do you want to make impact?
      </h2>
      <div className="home-split-mobile-cards">
        <article className="home-split-card home-split-card--volunteer">
          <h3>Volunteer</h3>
          <p>Find causes, meet people, and join missions nearby.</p>
          <Link href="/for-volunteers" className="home-split-card-link">
            Explore as a Volunteer →
          </Link>
        </article>
        <article className="home-split-card home-split-card--organizer">
          <h3>Organizer</h3>
          <p>Post a mission and bring your community together.</p>
          <Link href="/for-organizers" className="home-split-card-link">
            Post a Mission →
          </Link>
        </article>
      </div>
    </section>
  );
}
