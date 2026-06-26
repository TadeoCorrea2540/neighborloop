"use client";

import { useEffect, useState } from "react";
import type { VolunteerTimelinePoint } from "@/lib/data/analytics/volunteer";
import Icon from "@/components/icons";
import ImpactEmptyState from "./impact-empty-state";

type Col = VolunteerTimelinePoint & { ghost?: boolean };

const shortMonth = (label: string) => label.split(" ")[0];

/** Real future month labels (no fabricated values) used to keep sparse charts feeling intentional. */
function ghostMonths(lastPeriod: string, n: number): Col[] {
  const [y, m] = lastPeriod.split("-").map(Number);
  const out: Col[] = [];
  let yy = y;
  let mm = m;
  for (let i = 0; i < n; i++) {
    mm += 1;
    if (mm > 12) {
      mm = 1;
      yy += 1;
    }
    const label = new Date(Date.UTC(yy, mm - 1, 1)).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    out.push({ period: `${yy}-${String(mm).padStart(2, "0")}`, label, hours: 0, completed: 0, ghost: true });
  }
  return out;
}

export default function ImpactOverTimeChart({ timeline }: { timeline: VolunteerTimelinePoint[] }) {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimated(true);
      return;
    }
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (timeline.length === 0) {
    return (
      <section className="impact-chart-panel" aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="impact-section-title">
          Impact over time
        </h2>
        <p className="impact-section-sub">Confirmed volunteer hours by month</p>
        <ImpactEmptyState
          icon="bar-chart"
          title="No chart data yet"
          body="Your monthly hours chart fills in after organizers confirm your attendance on completed missions."
        />
      </section>
    );
  }

  // ---- derived storytelling data (all from the same source) ----
  const total = timeline.reduce((s, t) => s + t.hours, 0);
  const maxHours = Math.max(1, ...timeline.map((t) => t.hours));
  const best = timeline.reduce((b, t) => (t.hours > b.hours ? t : b), timeline[0]);
  const activeMonths = timeline.filter((t) => t.hours > 0).length;
  const thisMonthPeriod = new Date().toISOString().slice(0, 7);
  const hoursThisMonth = timeline.find((t) => t.period === thisMonthPeriod)?.hours ?? 0;

  // momentum: did the most recent month grow vs the one before it?
  const last = timeline[timeline.length - 1];
  const prev = timeline.length >= 2 ? timeline[timeline.length - 2] : null;
  const rising = prev ? last.hours > prev.hours && last.hours > 0 : false;

  // keep sparse charts feeling full with clearly-marked upcoming months (no fake values)
  const ghosts = timeline.length < 4 ? ghostMonths(timeline[timeline.length - 1].period, 4 - timeline.length) : [];
  const cols: Col[] = [...timeline, ...ghosts];

  const bestShort = shortMonth(best.label);
  const insight =
    total <= 0
      ? "Your timeline is just getting started — each completed mission adds to your impact."
      : activeMonths === 1
        ? `Your first tracked impact: ${best.hours}h in ${bestShort}. Keep the momentum going.`
        : `Your biggest impact month was ${bestShort} with ${best.hours} confirmed ${best.hours === 1 ? "hour" : "hours"}, across ${activeMonths} active months.`;

  return (
    <section className="impact-chart-panel ioc" aria-labelledby="chart-heading">
      <div className="ioc-glow" aria-hidden />

      {/* header with at-a-glance intelligence */}
      <div className="ioc-header">
        <div>
          <h2 id="chart-heading" className="impact-section-title">
            Impact over time
          </h2>
          <p className="impact-section-sub" style={{ margin: 0 }}>
            Confirmed volunteer hours by month
          </p>
        </div>
        <div className="ioc-chips">
          {hoursThisMonth > 0 && <span className="ioc-chip ioc-chip--now">{hoursThisMonth}h this month</span>}
          {best.hours > 0 && (
            <span className="ioc-chip ioc-chip--peak">
              <Icon name="trending-up" size={13} strokeWidth={2.2} /> Peak {best.hours}h · {bestShort}
            </span>
          )}
          <span className="ioc-chip ioc-chip--total">
            <Icon name="clock" size={13} strokeWidth={2.2} /> {total}h total
          </span>
        </div>
      </div>

      {/* plot */}
      <div
        className="ioc-plot"
        role="img"
        aria-label={`Monthly confirmed volunteer hours. Peak ${best.hours} hours in ${best.label}. ${total} hours total across ${activeMonths} active month${activeMonths === 1 ? "" : "s"}.`}
      >
        <div className="ioc-grid" aria-hidden>
          <span style={{ bottom: "75%" }} />
          <span style={{ bottom: "50%" }} />
          <span style={{ bottom: "25%" }} />
        </div>

        <div className="ioc-bars">
          {cols.map((c, i) => {
            const heightPct = c.ghost ? 0 : Math.max(5, (c.hours / maxHours) * 100);
            const isBest = !c.ghost && c.period === best.period && c.hours > 0;
            const isLast = !c.ghost && c.period === last.period;
            const active = hovered === c.period;
            return (
              <div
                key={c.period}
                className={`ioc-col${c.ghost ? " ioc-col--ghost" : ""}${active ? " is-active" : ""}`}
                onMouseEnter={() => !c.ghost && setHovered(c.period)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="ioc-valwrap">
                  {!c.ghost && (
                    <div className="ioc-tip" role="presentation">
                      <strong>{c.label}</strong>
                      <span>
                        {c.hours}h · {c.completed} mission{c.completed === 1 ? "" : "s"}
                      </span>
                    </div>
                  )}
                  {c.ghost ? (
                    <span className="ioc-val ioc-val--ghost">—</span>
                  ) : (
                    <span className={`ioc-val${isBest ? " ioc-val--best" : ""}`}>
                      {c.hours}h
                      {isLast && rising && (
                        <Icon name="trending-up" size={11} strokeWidth={2.6} style={{ color: "var(--mint)", marginLeft: 2 }} />
                      )}
                    </span>
                  )}
                </div>

                <div className="ioc-bar-wrap">
                  {isBest && <span className="ioc-peak" aria-hidden />}
                  <div
                    className={`ioc-bar${isBest ? " ioc-bar--best" : ""}${c.ghost ? " ioc-bar--ghost" : ""}`}
                    style={{
                      height: c.ghost ? "100%" : animated ? `${heightPct}%` : "0%",
                      transitionDelay: animated ? `${i * 70}ms` : "0ms",
                    }}
                  />
                </div>

                <span className={`ioc-month${c.ghost ? " ioc-month--ghost" : ""}`}>{shortMonth(c.label)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* storytelling insight */}
      <div className="ioc-insight">
        <span className="ioc-insight-icon" aria-hidden>
          <Icon name="sparkles" size={14} />
        </span>
        <span>{insight}</span>
      </div>
    </section>
  );
}
