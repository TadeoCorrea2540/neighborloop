"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LaunchTab,
  MissionCategoryId,
  categoryMission,
} from "@/lib/organizers-mobile-data";

const TABS: LaunchTab[] = ["Details", "Volunteers", "Impact"];

const STEPS = [
  { id: "idea", label: "Idea" },
  { id: "draft", label: "Draft" },
  { id: "published", label: "Published" },
] as const;

const VOLUNTEER_AVATARS = ["A", "M", "J", "K", "R", "S"];

const CATEGORY_ACCENT: Record<
  MissionCategoryId,
  { hue: string; soft: string; chip: string }
> = {
  food: { hue: "#ff6f5e", soft: "#fff0ec", chip: "Food Support" },
  animals: { hue: "#3a8bf0", soft: "#edf4ff", chip: "Animal Rescue" },
  tutoring: { hue: "#7a6bf5", soft: "#f0edff", chip: "Tutoring" },
  cleanups: { hue: "#1fae82", soft: "#e8f8f1", chip: "Cleanups" },
  community: { hue: "#ff8a3c", soft: "#fff4eb", chip: "Community Care" },
  donations: { hue: "#f1543f", soft: "#fff0ec", chip: "Donation Drives" },
};

const TAB_COPY: Record<LaunchTab, string> = {
  Details: "Cause, location, and what volunteers will do — all clear before anyone joins.",
  Volunteers: "Review signups, message your team, and keep headcount organized.",
  Impact: "Track attendance, hours, and share results after your mission.",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function useCountUp(target: number, active: boolean, duration = 900) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration, reduced]);

  return value;
}

function parseImpactNumber(impact: string) {
  const match = impact.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;

  return (
    <svg
      className="org-launch-ring-svg"
      viewBox="0 0 44 44"
      width="44"
      height="44"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="org-launch-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a5c" />
          <stop offset="100%" stopColor="#ff5e7a" />
        </linearGradient>
      </defs>
      <circle className="org-launch-ring-track" cx="22" cy="22" r={r} />
      <circle
        className="org-launch-ring-fill"
        cx="22"
        cy="22"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export default function MissionLaunchMobilePreview({
  categoryId,
  progress = 92,
  embedded = false,
}: {
  categoryId: MissionCategoryId;
  progress?: number;
  embedded?: boolean;
}) {
  const [tab, setTab] = useState<LaunchTab>("Details");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pressed, setPressed] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const mission = categoryMission(categoryId);
  const accent = CATEGORY_ACCENT[categoryId];
  const impactNum = parseImpactNumber(mission.impact);

  const animatedProgress = useCountUp(progress, mounted, 1100);
  const animatedVolunteers = useCountUp(18, mounted, 1200);
  const animatedImpact = useCountUp(impactNum, mounted, 1300);

  const syncIndicator = useCallback(() => {
    const idx = TABS.indexOf(tab);
    const el = tabRefs.current[idx];
    const rail = tabsRef.current;
    if (!el || !rail) return;
    const railRect = rail.getBoundingClientRect();
    const tabRect = el.getBoundingClientRect();
    setIndicator({
      left: tabRect.left - railRect.left,
      width: tabRect.width,
    });
  }, [tab]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTab("Details");
  }, [categoryId]);

  useEffect(() => {
    syncIndicator();
    window.addEventListener("resize", syncIndicator);
    return () => window.removeEventListener("resize", syncIndicator);
  }, [syncIndicator, categoryId]);

  useEffect(() => {
    if (!sheetOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const card = (
    <button
      type="button"
      className={`org-launch-card org-launch-card--pro${pressed ? " org-launch-card--pressed" : ""}`}
      onClick={() => setSheetOpen(true)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      aria-label="Open mission setup preview"
      style={
        {
          "--launch-accent": accent.hue,
          "--launch-soft": accent.soft,
        } as React.CSSProperties
      }
    >
      <span className="org-launch-card-bg" aria-hidden="true" />
      <span className="org-launch-card-grid" aria-hidden="true" />
      <span className="org-launch-card-sheen" aria-hidden="true" />

      <div className="org-launch-card-top">
        <div className="org-launch-status-pill">
          <ProgressRing progress={animatedProgress} />
          <div className="org-launch-status-copy">
            <span className="org-launch-status-label">Mission ready</span>
            <strong className="org-launch-status-value">{animatedProgress}%</strong>
          </div>
        </div>
        <div className="org-launch-live-badge">
          <span className="org-launch-live-indicator" aria-hidden="true">
            <span className="org-launch-live-ring" />
            <span className="org-launch-live-dot" />
          </span>
          <span className="org-launch-live-label">Live preview</span>
        </div>
      </div>

      <div className="org-launch-pipeline" aria-hidden="true">
        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className={`org-launch-pipe-step${
              i === STEPS.length - 1
                ? " org-launch-pipe-step--active"
                : " org-launch-pipe-step--done"
            }`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <span className="org-launch-pipe-node">
              {i === STEPS.length - 1 ? (
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                  <path
                    d="M2.5 6.2l2.2 2.2 4.8-4.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className="org-launch-pipe-label">{step.label}</span>
          </div>
        ))}
        <span className="org-launch-pipeline-line" aria-hidden="true" />
      </div>

      <div key={categoryId} className="org-launch-content">
        <div className="org-launch-mission-head">
          <span className="org-launch-cause-chip">{accent.chip}</span>
          <h3 className="org-launch-title">{mission.title}</h3>
          <p className="org-launch-desc">{mission.description}</p>
        </div>

        <div className="org-launch-stats">
          <div className="org-launch-stat org-launch-stat--time">
            <span className="org-launch-stat-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v4.2l2.6 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <span className="org-launch-stat-k">When</span>
              <span className="org-launch-stat-v">Saturday · 10:00 AM</span>
            </div>
          </div>

          <div className="org-launch-stat org-launch-stat--volunteers">
            <div className="org-launch-avatar-stack" aria-hidden="true">
              {VOLUNTEER_AVATARS.slice(0, 4).map((initial, i) => (
                <span
                  key={initial}
                  className="org-launch-avatar"
                  style={{ animationDelay: `${0.35 + i * 0.08}s` }}
                >
                  {initial}
                </span>
              ))}
              <span className="org-launch-avatar org-launch-avatar--more">
                +{Math.max(animatedVolunteers - 4, 0)}
              </span>
            </div>
            <div>
              <span className="org-launch-stat-k">Interest</span>
              <span className="org-launch-stat-v">
                <strong>{animatedVolunteers}</strong> volunteers curious
              </span>
            </div>
          </div>

          <div className="org-launch-capacity">
            <div className="org-launch-capacity-head">
              <span className="org-launch-stat-k">Spots open</span>
              <span className="org-launch-stat-v">
                <strong>8</strong> of 20 left
              </span>
            </div>
            <div className="org-launch-capacity-track" aria-hidden="true">
              <span className="org-launch-capacity-fill" style={{ width: "60%" }} />
            </div>
          </div>
        </div>

        <div className="org-launch-impact-card">
          <span className="org-launch-impact-k">Estimated impact</span>
          <span className="org-launch-impact-v">
            <strong>{animatedImpact}</strong>
            <span>{mission.impact.replace(/^\d+\s*/, "")}</span>
          </span>
        </div>
      </div>

      <div className="org-launch-tabs-wrap">
        <div
          ref={tabsRef}
          className="org-launch-tabs"
          role="tablist"
          aria-label="Preview tabs"
        >
          <span
            className="org-launch-tab-indicator"
            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
            aria-hidden="true"
          />
          {TABS.map((t, i) => (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={`org-launch-tab${tab === t ? " org-launch-tab--on" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setTab(t);
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div key={`${categoryId}-${tab}`} className="org-launch-tab-body">
          <p>{TAB_COPY[tab]}</p>
        </div>
      </div>

      <span className="org-launch-tap">
        <span>Open full mission builder</span>
        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
          <path
            d="M7 5l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );

  return (
    <>
      {embedded ? (
        <div className="org-launch org-launch--embedded org-mobile-only" id="org-hero-preview">
          {card}
        </div>
      ) : (
        <section className="org-launch org-mobile-only" aria-labelledby="org-launch-heading">
          <div className="org-section-kicker">Launch preview</div>
          <h2 id="org-launch-heading" className="org-section-heading">
            See your mission come together.
          </h2>
          {card}
        </section>
      )}

      {sheetOpen && (
        <>
          <div className="org-sheet-backdrop" onClick={() => setSheetOpen(false)} aria-hidden="true" />
          <div className="org-sheet" role="dialog" aria-modal="true" aria-label="Mission setup preview">
            <div className="org-sheet-handle" aria-hidden="true" />
            <button type="button" className="org-sheet-close" onClick={() => setSheetOpen(false)} aria-label="Close">
              ×
            </button>
            <h3 className="org-sheet-title">{mission.title}</h3>
            <p className="org-sheet-desc">{mission.description}</p>
            <ul className="org-sheet-list">
              <li>Saturday · 10:00 AM · Community Center</li>
              <li>8 volunteers needed · Beginner-friendly</li>
              <li>Estimated impact: {mission.impact}</li>
            </ul>
            <Link href="/auth" className="org-btn-primary" onClick={() => setSheetOpen(false)}>
              Post a Mission
            </Link>
          </div>
        </>
      )}
    </>
  );
}
