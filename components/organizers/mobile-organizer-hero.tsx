"use client";

import Link from "next/link";
import { MissionCategoryId } from "@/lib/organizers-mobile-data";
import MissionLaunchMobilePreview from "./mission-launch-mobile-preview";

function scrollToHowItWorks(e: React.MouseEvent) {
  e.preventDefault();
  const el = document.getElementById("org-how-it-works");
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export default function MobileOrganizerHero({ categoryId }: { categoryId: MissionCategoryId }) {
  return (
    <section
      id="org-hero-mobile"
      className="org-hero-mobile org-mobile-only"
      aria-labelledby="org-hero-heading"
    >
      <div className="org-hero-mobile-inner">
        <div className="org-hero-mobile-copy">
          <span className="org-hero-label">
            Nonprofits, clubs, families — all welcome
          </span>
          <h1 id="org-hero-heading">
            Start a mission. Rally your community.
          </h1>
          <p className="org-hero-lead">
            Find volunteers and stay organized from one place — no complicated tools required.
          </p>
          <div className="org-hero-actions">
            <Link href="/auth" className="org-btn-primary">
              Post a Mission
            </Link>
            <a
              href="#org-how-it-works"
              className="org-btn-secondary"
              onClick={scrollToHowItWorks}
            >
              See How It Works
            </a>
          </div>
          <p className="org-hero-trust">Free to start · Built for local communities</p>
        </div>
        <MissionLaunchMobilePreview categoryId={categoryId} embedded />
      </div>
    </section>
  );
}
