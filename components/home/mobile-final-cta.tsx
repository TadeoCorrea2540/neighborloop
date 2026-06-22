import Link from "next/link";

export default function MobileFinalCTA() {
  return (
    <section className="home-cta-mobile home-mobile-only" aria-labelledby="mobile-cta-heading">
      <div className="home-cta-mobile-inner">
        <h2 id="mobile-cta-heading">Your community is waiting.</h2>
        <p>Join free in 30 seconds — no commitment, just impact.</p>
        <Link href="/explore" className="home-btn-primary">
          Find Missions
        </Link>
      </div>
    </section>
  );
}
