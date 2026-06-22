import Link from "next/link";

export default function MobileOrganizerFinalCTA() {
  return (
    <section className="org-final-cta org-mobile-only" aria-labelledby="org-final-heading">
      <div className="org-final-cta-inner">
        <h2 id="org-final-heading">Your community is waiting for your mission.</h2>
        <p>Start free in minutes — post your first mission and welcome your first volunteers.</p>
        <Link href="/auth" className="org-btn-primary">
          Post a Mission
        </Link>
      </div>
    </section>
  );
}
