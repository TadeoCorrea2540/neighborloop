"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/icons";
import { ReportPanelEmpty } from "@/components/organization/reports/report-empty-state";
import type { MonthlyHoursPoint } from "@/lib/reports/helpers";

type Col = MonthlyHoursPoint & { ghost?: boolean };

const shortMonth = (label: string) => label.split(" ")[0];

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
    out.push({
      period: `${yy}-${String(mm).padStart(2, "0")}`,
      label: `${label.split(" ")[0]} ${String(yy).slice(2)}`,
      fullLabel: label,
      hours: 0,
      ghost: true,
    });
  }
  return out;
}

export default function MonthlyHoursChart({ data }: { data: MonthlyHoursPoint[] }) {
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

  if (data.length === 0) {
    return (
      <section className="impact-chart-panel" aria-labelledby="org-hours-heading">
        <h3 id="org-hours-heading" className="impact-section-title">
          Monthly hours contributed
        </h3>
        <p className="impact-section-sub">Confirmed volunteer hours by month</p>
        <ReportPanelEmpty
          title="No hours chart yet"
          copy="Confirmed hours will appear here once missions are completed in this range."
        />
      </section>
    );
  }

  const total = Math.round(data.reduce((s, d) => s + d.hours, 0) * 100) / 100;
  const maxHours = Math.max(1, ...data.map((d) => d.hours));
  const best = data.reduce((b, d) => (d.hours > b.hours ? d : b), data[0]);
  const activeMonths = data.filter((d) => d.hours > 0).length;
  const thisMonthPeriod = new Date().toISOString().slice(0, 7);
  const hoursThisMonth = data.find((d) => d.period === thisMonthPeriod)?.hours ?? 0;
  const last = data[data.length - 1];
  const prev = data.length >= 2 ? data[data.length - 2] : null;
  const rising = prev ? last.hours > prev.hours && last.hours > 0 : false;

  const ghosts = data.length < 4 ? ghostMonths(data[data.length - 1].period, 4 - data.length) : [];
  const cols: Col[] = [...data, ...ghosts];

  const bestShort = shortMonth(best.fullLabel);
  const insight =
    total <= 0
      ? "Your timeline is just getting started — each confirmed attendance adds to your impact."
      : activeMonths === 1
        ? `Your first tracked impact: ${best.hours}h in ${bestShort}. Keep the momentum going.`
        : `Your biggest impact month was ${bestShort} with ${best.hours} confirmed ${best.hours === 1 ? "hour" : "hours"}, across ${activeMonths} active months.`;

  return (
    <section className="impact-chart-panel ioc" aria-labelledby="org-hours-heading">
      <div className="ioc-glow" aria-hidden />

      <div className="ioc-header">
        <div>
          <h3 id="org-hours-heading" className="impact-section-title">
            Monthly hours contributed
          </h3>
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

      <div
        className="ioc-plot"
        role="img"
        aria-label={`Monthly volunteer hours. Peak ${best.hours} hours in ${best.fullLabel}. ${total} hours total across ${activeMonths} active month${activeMonths === 1 ? "" : "s"}.`}
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
                className={`ioc-col${c.ghost ? " ioc-col--ghost" : ""}${isBest ? " ioc-col--best" : ""}${active ? " is-active" : ""}`}
                onMouseEnter={() => !c.ghost && setHovered(c.period)}
                onMouseLeave={() => setHovered(null)}
              >
                {isBest && <div className="ioc-peak-beacon" aria-hidden />}

                <div className="ioc-label-slot">
                  {c.ghost ? (
                    <span className="ioc-val ioc-val--ghost">—</span>
                  ) : active ? (
                    <div className={`ioc-tip-open${isBest ? " ioc-tip-open--peak" : ""}`} role="presentation">
                      {isBest && (
                        <span className="ioc-tip-badge">
                          <Icon name="award" size={11} strokeWidth={2.3} />
                          Peak month
                        </span>
                      )}
                      <strong>{c.fullLabel}</strong>
                      <span>{c.hours}h confirmed</span>
                    </div>
                  ) : isBest ? (
                    <span className="ioc-medallion" aria-label={`Peak month: ${c.hours} hours`}>
                      <span className="ioc-medallion-halo" aria-hidden />
                      <span className="ioc-medallion-core">
                        <span className="ioc-medallion-val">{c.hours}h</span>
                      </span>
                    </span>
                  ) : (
                    <span className="ioc-val">
                      {c.hours}h
                      {isLast && rising && (
                        <Icon name="trending-up" size={11} strokeWidth={2.6} style={{ color: "var(--mint)", marginLeft: 2 }} />
                      )}
                    </span>
                  )}
                </div>

                <div className="ioc-bar-wrap">
                  <div
                    className={`ioc-bar${isBest ? " ioc-bar--best" : ""}${c.ghost ? " ioc-bar--ghost" : ""}`}
                    style={{
                      height: c.ghost ? "100%" : animated ? `${heightPct}%` : "0%",
                      transitionDelay: animated ? `${i * 70}ms` : "0ms",
                    }}
                  >
                    {isBest && (
                      <>
                        <span className="ioc-bar-shine" aria-hidden />
                        <span className="ioc-bar-flare ioc-bar-flare--l" aria-hidden />
                        <span className="ioc-bar-flare ioc-bar-flare--r" aria-hidden />
                      </>
                    )}
                  </div>
                </div>

                <span className={`ioc-month${c.ghost ? " ioc-month--ghost" : ""}${isBest ? " ioc-month--best" : ""}`}>
                  {isBest && <Icon name="sparkles" size={10} strokeWidth={2.2} />}
                  {shortMonth(c.fullLabel)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ioc-insight">
        <span className="ioc-insight-icon" aria-hidden>
          <Icon name="sparkles" size={14} />
        </span>
        <span>{insight}</span>
      </div>
    </section>
  );
}
