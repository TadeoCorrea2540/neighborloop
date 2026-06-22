"use client";

import Link from "next/link";
import {
  MISSIONS,
  CauseKey,
  causeArt,
  spotStyle,
  Mission,
} from "@/lib/data";

const MOBILE_CAUSES: { label: string; key: CauseKey }[] = [
  { label: "All", key: "All" },
  { label: "Food Support", key: "Food" },
  { label: "Animal Rescue", key: "Animals" },
  { label: "Tutoring", key: "Tutoring" },
  { label: "Cleanups", key: "Cleanup" },
  { label: "Community Care", key: "Elderly" },
  { label: "Environment", key: "Garden" },
];

const CAUSE_INFO: Record<string, string> = {
  All: "Beginner-friendly picks across every cause",
  Food: "Sort donations and pack meals for families",
  Animals: "Walk, foster, and care for rescued animals",
  Tutoring: "Help students read, learn, and grow",
  Cleanup: "Restore parks, beaches, and shared spaces",
  Elderly: "Share time with neighbors who need company",
  Garden: "Plant and green your neighborhood",
};

function MissionCard({ m, compact }: { m: Mission; compact?: boolean }) {
  const ss = spotStyle(m.spots);
  return (
    <Link href={`/missions/${m.slug}`} className="home-mission-card lift">
      <div
        className="home-mission-card-media"
        style={{ background: causeArt(m) }}
      >
        <span className="home-mission-card-badge">{m.cause}</span>
      </div>
      <div className="home-mission-card-body">
        <div className="home-mission-card-title">{m.title}</div>
        {!compact && (
          <div className="home-mission-card-org">{m.org}</div>
        )}
        <div className="home-mission-card-meta">
          <span>{m.date}</span>
          <span>{m.dist}</span>
          <span>{m.diff}</span>
        </div>
        <div className="home-mission-card-footer">
          <span style={{ fontSize: 12, color: "var(--muted-3)" }}>
            {m.org}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 9px",
              borderRadius: 999,
              ...ss,
            }}
          >
            {m.spots} spots left
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MobileMissions({
  cause,
  onCauseChange,
}: {
  cause: CauseKey;
  onCauseChange: (c: CauseKey) => void;
}) {
  const filtered =
    cause === "All" ? MISSIONS : MISSIONS.filter((m) => m.cause === cause);
  const featured = filtered[0];
  const rest = filtered.slice(1, 5);
  const activeLabel =
    MOBILE_CAUSES.find((c) => c.key === cause)?.label ?? "All";
  const count = filtered.length;

  return (
    <section className="home-missions-mobile home-mobile-only" aria-labelledby="mobile-missions-heading">
      <div className="home-missions-mobile-header">
        <div className="home-section-title">Featured missions</div>
        <h2 id="mobile-missions-heading" className="home-section-heading">
          Missions near you
        </h2>
      </div>

      <div className="home-causes-scroll" role="tablist" aria-label="Filter by cause">
        {MOBILE_CAUSES.map(({ label, key }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={cause === key}
            className={`home-cause-chip${cause === key ? " home-cause-chip--active" : ""}`}
            onClick={() => onCauseChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div key={cause} className="home-cause-pulse" aria-live="polite">
        <span className="home-cause-pulse-count">
          {count} mission{count === 1 ? "" : "s"}
        </span>
        <span className="home-cause-pulse-sep" aria-hidden="true">·</span>
        <span className="home-cause-pulse-desc">
          {CAUSE_INFO[cause] ?? `Near you · ${activeLabel}`}
        </span>
      </div>

      {featured && (
        <div className="home-missions-mobile-featured">
          <MissionCard m={featured} />
        </div>
      )}

      {rest.length > 0 && (
        <>
          <p className="home-missions-scroll-hint">Swipe for more missions →</p>
          <div className="home-missions-scroll">
            {rest.map((m) => (
              <MissionCard key={m.slug} m={m} compact />
            ))}
          </div>
        </>
      )}

      <div className="home-missions-explore">
        <Link href="/explore" className="home-btn-primary">
          Explore all missions
        </Link>
      </div>
    </section>
  );
}
