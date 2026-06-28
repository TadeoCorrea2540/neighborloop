"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Icon from "@/components/icons";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function formatHour(h: number): string {
  const h12 = h % 12 || 12;
  return `${h12} ${h < 12 ? "AM" : "PM"}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseValue(value: string): { date: string; time: string | null } {
  if (!value) return { date: "", time: null };
  const [date, timePart] = value.split("T");
  if (!timePart || timePart.length < 5) return { date, time: null };
  return { date, time: timePart.slice(0, 5) };
}

function combine(date: string, time: string | null): string {
  if (!date) return "";
  if (!time) return `${date}T`;
  return `${date}T${time}`;
}

function formatDate(date: string): string {
  if (!date) return "Select date";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "Select date";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(time: string | null): string {
  if (!time) return "Select time";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "Select time";
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const cells: { date: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    });
  }
  return cells;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function computePopStyle(): CSSProperties {
  return {
    position: "fixed",
    zIndex: 300,
  };
}

type Popover = "date" | "time" | null;

export default function BrandedDateTimeField({
  id,
  label,
  value,
  onChange,
  optional = false,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  error?: string;
  }) {
  const errId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const timeBtnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<Popover>(null);
  const [popStyle, setPopStyle] = useState<CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const [draftHour, setDraftHour] = useState<number | null>(null);
  const [draftMinute, setDraftMinute] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { date, time } = parseValue(value);
  const viewDate = date ? new Date(`${date}T12:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(viewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(viewDate.getMonth());

  useEffect(() => {
    if (open !== "time") {
      setDraftHour(null);
      setDraftMinute(null);
      return;
    }
    if (time) {
      const h = parseInt(time.split(":")[0], 10);
      setDraftHour(Number.isNaN(h) ? null : h);
    } else {
      setDraftHour(null);
    }
    setDraftMinute(null);
  }, [open, time]);

  useEffect(() => {
    if (!date) return;
    const d = new Date(`${date}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [date]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setPopStyle({});
      return;
    }
    function update() {
      setPopStyle(computePopStyle());
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  function pickDay(nextDate: string) {
    if (nextDate < todayIso()) return;
    onChange(combine(nextDate, time));
    setOpen(null);
  }

  function pickHour(h: number) {
    setDraftHour(h);
  }

  function pickMinute(m: number) {
    if (draftHour === null) return;
    onChange(combine(date, `${pad(draftHour)}:${pad(m)}`));
    setOpen(null);
  }

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    if (delta < 0) {
      const n = new Date();
      const minMonth = new Date(n.getFullYear(), n.getMonth(), 1);
      if (d < minMonth) return;
    }
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function toggleDatePopover() {
    if (open === "date") {
      setOpen(null);
      return;
    }
    const n = new Date();
    const cy = n.getFullYear();
    const cm = n.getMonth();
    if (viewYear < cy || (viewYear === cy && viewMonth < cm)) {
      setViewYear(cy);
      setViewMonth(cm);
    }
    setOpen("date");
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const today = todayIso();
  const now = new Date();
  const canGoPrevMonth =
    viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth > now.getMonth());
  const cells = monthMatrix(viewYear, viewMonth);

  const portal =
    open && mounted
      ? createPortal(
          <div ref={portalRef} className="mf-dt-portal">
            <div className="mf-pop-backdrop" onClick={() => setOpen(null)} aria-hidden />

            {open === "date" && (
              <div
                className="mf-cal-pop mf-cal-pop--floating mf-cal-pop--centered"
                role="dialog"
                aria-label={`Choose ${label.toLowerCase()} date`}
                style={popStyle}
              >
                <div className="mf-cal-head">
                  <button
                    type="button"
                    className="mf-cal-nav"
                    aria-label="Previous month"
                    disabled={!canGoPrevMonth}
                    onClick={() => shiftMonth(-1)}
                  >
                    <Icon name="arrow-left" size={16} />
                  </button>
                  <span className="mf-cal-title">{monthLabel}</span>
                  <button
                    type="button"
                    className="mf-cal-nav"
                    aria-label="Next month"
                    onClick={() => shiftMonth(1)}
                    style={{ transform: "scaleX(-1)" }}
                  >
                    <Icon name="arrow-left" size={16} />
                  </button>
                </div>
                <div className="mf-cal-weekdays" aria-hidden>
                  {WEEKDAYS.map((d) => (
                    <span key={d} className="mf-cal-weekday">{d}</span>
                  ))}
                </div>
                <div className="mf-cal-grid" role="grid">
                  {cells.map((cell) => {
                    const isPast = cell.date < today;
                    return (
                    <button
                      key={cell.date}
                      type="button"
                      role="gridcell"
                      disabled={isPast}
                      className={[
                        "mf-cal-day",
                        !cell.inMonth ? "mf-cal-day--muted" : "",
                        isPast ? "mf-cal-day--disabled" : "",
                        cell.date === today ? "mf-cal-day--today" : "",
                        cell.date === date ? "mf-cal-day--selected" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => pickDay(cell.date)}
                      aria-label={cell.date}
                      aria-selected={cell.date === date}
                      aria-disabled={isPast}
                    >
                      {cell.day}
                    </button>
                    );
                  })}
                </div>
              </div>
            )}

            {open === "time" && date && (
              <div
                className="mf-time-pop mf-time-pop--floating mf-time-pop--centered"
                role="dialog"
                aria-label={`Choose ${label.toLowerCase()} time`}
                style={popStyle}
              >
                <p className="mf-time-title" style={{ margin: "0 0 12px" }}>Select time</p>
                <div className="mf-time-columns">
                  <div>
                    <span className="mf-time-col-label">Hour</span>
                    <div className="mf-time-list" role="listbox" aria-label="Hour">
                      {HOURS.map((h) => {
                        const selected = h === draftHour;
                        return (
                          <button
                            key={h}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`mf-time-opt${selected ? " mf-time-opt--selected" : ""}`}
                            onClick={() => pickHour(h)}
                          >
                            <span className="mf-time-opt-dot" aria-hidden />
                            {formatHour(h)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="mf-time-col-label">Minute</span>
                    <div
                      className={`mf-time-list${draftHour === null ? " mf-time-list--disabled" : ""}`}
                      role="listbox"
                      aria-label="Minute"
                      aria-disabled={draftHour === null}
                    >
                      {MINUTES.map((m) => {
                        const selected = m === draftMinute;
                        return (
                          <button
                            key={m}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            disabled={draftHour === null}
                            className={`mf-time-opt${selected ? " mf-time-opt--selected" : ""}`}
                            onClick={() => pickMinute(m)}
                          >
                            <span className="mf-time-opt-dot" aria-hidden />
                            :{pad(m)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="mf-field mf-dt" ref={rootRef}>
      <span className="mf-label">
        {label}
        {optional ? <span className="mf-label-hint"> (optional)</span> : null}
      </span>

      <div className="mf-dt-split">
        <button
          ref={dateBtnRef}
          type="button"
          id={id}
          className={`mf-dt-trigger${date ? "" : " mf-dt-trigger--placeholder"}`}
          aria-haspopup="dialog"
          aria-expanded={open === "date"}
          aria-describedby={error ? errId : undefined}
          onClick={toggleDatePopover}
        >
          <span className="mf-dt-trigger-icon" aria-hidden>
            <Icon name="calendar" size={17} />
          </span>
          <span>{formatDate(date)}</span>
        </button>

        <button
          ref={timeBtnRef}
          type="button"
          id={`${id}-time`}
          className={`mf-dt-trigger${date && time ? "" : " mf-dt-trigger--placeholder"}`}
          disabled={!date}
          aria-haspopup="dialog"
          aria-expanded={open === "time"}
          aria-label={`${label} time`}
          onClick={() => setOpen((o) => (o === "time" ? null : "time"))}
        >
          <span className="mf-dt-trigger-icon" aria-hidden>
            <Icon name="clock" size={17} />
          </span>
          <span>{date ? formatTime(time) : "Select time"}</span>
        </button>
      </div>

      {error ? (
        <p className="mf-error" id={errId} role="alert">
          {error}
        </p>
      ) : null}

      {portal}
    </div>
  );
}
