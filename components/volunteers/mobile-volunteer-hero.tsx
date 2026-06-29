"use client";

import Link from "next/link";
import type { MissionCard } from "@/lib/data/mission-cards";
import {
  fmtMissionDate,
  locationLabel,
  spotsLabel,
} from "@/lib/explore-card-helpers";
import { formatNearbyCount } from "@/lib/volunteers-mobile-data";

function scrollToSection(id: string, e: React.MouseEvent) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export default function MobileVolunteerHero({
  spotlight,
  totalCount,
}: {
  spotlight: MissionCard | null;
  totalCount: number;
}) {
  const nearbyLabel =
    totalCount > 0
      ? `${formatNearbyCount(totalCount)} live mission${totalCount === 1 ? "" : "s"} near you`
      : "Live missions on NeighborLoop";

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
            {nearbyLabel}
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

        {spotlight && (
          <div className="vol-hero-visual">
            <div className="vol-profile-card">
              <div className="vol-profile-head">
                <span className="vol-profile-avatar" aria-hidden="true" />
                <div>
                  <div className="vol-profile-name">Recommended</div>
                  <div className="vol-profile-meta">
                    {spotlight.organizationName ?? "Organization"}
                  </div>
                </div>
              </div>
              <div className="vol-profile-mission">
                <span className="vol-profile-mission-tag">
                  {spotlight.categoryName ?? "Mission"}
                </span>
                <div className="vol-profile-mission-title">{spotlight.mission.title}</div>
                <div className="vol-profile-mission-meta">
                  {fmtMissionDate(spotlight.mission.startsAt)} · {locationLabel(spotlight)} ·{" "}
                  {spotsLabel(spotlight)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
