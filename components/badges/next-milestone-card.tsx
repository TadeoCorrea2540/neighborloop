"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/icons";
import { MILESTONE_ICON } from "./milestone-meta";
import type { VolunteerMilestone } from "@/lib/data/analytics/volunteer";

function pct(current: number, target: number): number {
  return target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
}

export default function NextMilestoneCard({ next }: { next: VolunteerMilestone | null }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAnimated(true);
      return;
    }
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (!next) {
    return (
      <section className="badges-next-card badges-next-card--complete" aria-label="All milestones unlocked">
        <span className="badges-next-emblem" style={{ background: "linear-gradient(145deg,#1fae82,#147a57)" }}>
          <Icon name="award" size={26} strokeWidth={2} />
        </span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.02em" }}>Every milestone unlocked</div>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted-2)", lineHeight: 1.5 }}>
            Incredible impact. Thank you for showing up for your community — your achievement path is complete.
          </p>
        </div>
      </section>
    );
  }

  const progress = pct(next.current, next.target);
  const width = animated ? Math.max(4, progress) : 4;

  return (
    <section className="badges-next-card" aria-label="Next reward progress">
      <span className="badges-next-emblem">
        <Icon name={MILESTONE_ICON[next.key] ?? "sparkles"} size={26} strokeWidth={2.1} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "var(--coral-deep)", marginBottom: 4 }}>
          NEXT REWARD
        </div>
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.02em" }}>{next.label}</div>
        <div style={{ fontSize: 13, color: "var(--muted-2)", margin: "6px 0 10px" }}>
          {Math.min(next.current, next.target)} / {next.target} completed · {progress}% there
        </div>
        <div
          className="badges-progress-track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress}% progress toward ${next.label}`}
        >
          <span className="badges-progress-fill" style={{ width: `${width}%` }} />
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--muted-3)", fontWeight: 600 }}>
          You&apos;re building momentum — one mission at a time.
        </p>
      </div>
    </section>
  );
}
