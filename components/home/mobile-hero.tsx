"use client";

import Link from "next/link";
import { MISSIONS } from "@/lib/data";

function scrollToHowItWorks(e: React.MouseEvent) {
  e.preventDefault();
  const el = document.getElementById("how-it-works");
  if (!el) return;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
}

export default function MobileHero() {
  const spotlight = MISSIONS[0];

  return (
    <section
      id="home-hero-mobile"
      className="home-hero-mobile home-mobile-only"
      aria-labelledby="mobile-hero-heading"
    >
      <div className="home-hero-mobile-inner">
        <div className="home-hero-mobile-copy">
          <span className="home-eyebrow">
            <span className="home-hero-mobile-dot" aria-hidden="true" />
            3,194 missions live near you
          </span>
          <h1 id="mobile-hero-heading">
            Find a meaningful local mission.
          </h1>
          <p className="home-hero-mobile-lead">
            Join people who care and make an impact without friction.
          </p>
          <div className="home-hero-mobile-actions">
            <Link href="/explore" className="home-btn-primary">
              Find Missions
            </Link>
            <a
              href="#how-it-works"
              className="home-btn-secondary"
              onClick={scrollToHowItWorks}
            >
              How It Works
            </a>
          </div>
          <div className="home-hero-mobile-trust">
            <div className="home-hero-mobile-trust-avatars" aria-hidden="true">
              <span style={{ background: "linear-gradient(135deg,#ffb09a,#ff7a5c)" }} />
              <span style={{ background: "#c8cdd8" }} />
              <span style={{ background: "linear-gradient(135deg,#bca6ff,#7a6bf5)" }} />
            </div>
            <span>
              <strong style={{ color: "var(--ink)" }}>12,480+ neighbors</strong>{" "}
              volunteered this year
            </span>
          </div>
          <ul className="home-hero-mobile-signals" aria-label="Why people trust NeighborLoop">
            <li>Beginner-friendly</li>
            <li>Verified organizers</li>
            <li>Free to join</li>
          </ul>
        </div>

        <div className="home-hero-mobile-visual">
          <div className="home-hero-mobile-card">
            <span className="home-hero-mobile-card-tag">{spotlight.cause}</span>
            <div className="home-hero-mobile-card-title">{spotlight.title}</div>
            <div className="home-hero-mobile-card-meta">
              {spotlight.date} · {spotlight.dist}
            </div>
            <div className="home-hero-mobile-card-progress" aria-hidden="true">
              <span style={{ width: "68%" }} />
            </div>
            <div className="home-hero-mobile-card-row">
              <span className="home-hero-mobile-card-joined" aria-hidden="true">
                <i style={{ background: "linear-gradient(135deg,#8fe3bd,#1fae82)" }} />
                <i style={{ background: "linear-gradient(135deg,#8bc0ff,#3a8bf0)" }} />
                <i style={{ background: "linear-gradient(135deg,#ffb09a,#ff7a5c)" }} />
                <em>Joined by 12</em>
              </span>
              <span className="home-hero-mobile-spots">
                {spotlight.spots} spots left
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
