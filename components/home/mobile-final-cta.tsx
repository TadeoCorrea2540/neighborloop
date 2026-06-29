"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";

export default function MobileFinalCTA() {
  const account = useSession();
  const primaryHref = account ? "/explore" : "/auth";

  return (
    <section className="home-cta-mobile home-mobile-only" aria-labelledby="mobile-cta-heading">
      <div className="home-cta-mobile-inner">
        <h2 id="mobile-cta-heading">Your community is waiting.</h2>
        <p>Join free in 30 seconds — no commitment, just impact.</p>
        <div className="home-cta-mobile-actions">
          <Link href={primaryHref} className="home-cta-btn home-cta-btn--solid">
            Get started free
          </Link>
          <Link href="/pricing" className="home-cta-btn home-cta-btn--ghost">
            For organizations
          </Link>
        </div>
      </div>
    </section>
  );
}
