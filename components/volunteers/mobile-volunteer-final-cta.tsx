import Link from "next/link";

export default function MobileVolunteerFinalCTA() {
  return (
    <section className="vol-final-cta vol-mobile-only" aria-labelledby="vol-final-heading">
      <div className="vol-final-cta-inner">
        <h2 id="vol-final-heading">Your first mission could start this week.</h2>
        <p>Find a cause nearby and do something good with the time you already have.</p>
        <Link href="/explore" className="vol-btn-primary">
          Find Missions
        </Link>
      </div>
    </section>
  );
}
