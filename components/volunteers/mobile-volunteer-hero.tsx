"use client";

import Link from "next/link";
import { VOL_NEARBY_COUNT } from "@/lib/volunteers-mobile-data";

function scrollToSection(id: string, e: React.MouseEvent) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export default function MobileVolunteerHero() {
  return (
    <section
      id="vol-hero-mobile"
      className="vol-hero-mobile vol-mobile-only"
      aria-labelledby="vol-hero-heading"
    >
      <div className="vol-hero-mobile-inner">
        <div className="vol-hero-mobile-copy">
          <span className="vol-nearby-signal">
            <span className="vol-nearby-dot" aria-hidden="true" />
            {VOL_NEARBY_COUNT} missions near you
          </span>
          <h1 id="vol-hero-heading">
            Find your people. Do something that matters.
          </h1>
          <p className="vol-hero-lead">
            Discover missions nearby, join in a tap, meet people who care, and build real experience.
          </p>
          <div className="vol-hero-actions">
            <Link href="/explore" className="vol-btn-primary">
              Find Missions
            </Link>
            <a
              href="#vol-how-it-works"
              className="vol-btn-secondary"
              onClick={(e) => scrollToSection("vol-how-it-works", e)}
            >
              How It Works
            </a>
          </div>
          <ul className="vol-trust-chips" aria-label="Volunteer benefits">
            <li>No experience needed</li>
            <li>Flexible opportunities</li>
            <li>Track your impact</li>
          </ul>
        </div>

        <div className="vol-hero-visual">
          <div className="vol-profile-card">
            <div className="vol-profile-head">
              <span className="vol-profile-avatar" aria-hidden="true" />
              <div>
                <div className="vol-profile-name">Maya Rivera</div>
                <div className="vol-profile-meta">42 hrs · 8 missions</div>
              </div>
            </div>
            <div className="vol-profile-mission">
              <span className="vol-profile-mission-tag">Recommended</span>
              <div className="vol-profile-mission-title">Saturday Food Bank Sort</div>
              <div className="vol-profile-mission-meta">Sat 9 AM · 1.2 mi · 6 spots left</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
