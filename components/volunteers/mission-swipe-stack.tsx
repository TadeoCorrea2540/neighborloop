"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mission, causeArt, spotStyle } from "@/lib/data";
import { missionPurpose } from "@/lib/volunteers-mobile-data";
import MissionPreviewSheet from "./mission-preview-sheet";

function MetaIcon({ type }: { type: "date" | "dist" | "diff" }) {
  const s = { stroke: "currentColor", strokeWidth: 1.8, fill: "none", strokeLinecap: "round" as const };
  if (type === "date") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" {...s} />
        <path d="M4 9h16M8 3v4M16 3v4" {...s} />
      </svg>
    );
  }
  if (type === "dist") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" {...s} />
        <circle cx="12" cy="10" r="2.2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20V10M12 10C9.5 10 7.5 8 7 5.5c3-.5 5 1.5 5 4.5z" {...s} />
      <path d="M12.2 12c2.5 0 4.5-2 5-4.5-3-.5-5 1.5-5 4.5z" {...s} />
    </svg>
  );
}

function MissionStackCard({
  m,
  indexLabel,
  matchScore,
  isSaved,
}: {
  m: Mission;
  indexLabel: string;
  matchScore?: number;
  isSaved: boolean;
}) {
  const ss = spotStyle(m.spots);
  const fillPct = Math.min(100, Math.round((m.spots / 16) * 100));
  const orgInitial = m.org.charAt(0).toUpperCase();
  const urgent = m.spots <= 4;

  return (
    <div className="vol-stack-card-inner">
      <div className="vol-stack-card-media" style={{ background: causeArt(m) }}>
        <div className="vol-stack-card-media-overlay" aria-hidden="true" />
        <div className="vol-stack-card-top">
          <span className="vol-stack-index">{indexLabel}</span>
          {matchScore != null && (
            <span className="vol-stack-match">{matchScore}% match</span>
          )}
        </div>
        <span className="vol-stack-cause">{m.cause}</span>
        {isSaved && (
          <span className="vol-stack-saved-mark" aria-label="Saved">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 17.3l-6.2 3.3 1.2-6.9L1 8.7l6.9-1L12 1l4.1 6.7 6.9 1-5.9 5.1 1.2 6.9z" />
            </svg>
          </span>
        )}
        <div className="vol-stack-card-hero-copy">
          <h3 className="vol-stack-title">{m.title}</h3>
          <p className="vol-stack-purpose">{missionPurpose(m)}</p>
        </div>
      </div>

      <div className="vol-stack-card-details">
        <div className="vol-stack-chips">
          <span className="vol-stack-chip">
            <MetaIcon type="date" />
            {m.date.split("·")[0]?.trim() ?? m.date}
          </span>
          <span className="vol-stack-chip">
            <MetaIcon type="dist" />
            {m.dist}
          </span>
          <span className="vol-stack-chip">
            <MetaIcon type="diff" />
            {m.diff}
          </span>
        </div>

        <div className="vol-stack-capacity">
          <div className="vol-stack-capacity-head">
            <span className={urgent ? "vol-stack-capacity-urgent" : ""}>
              {m.spots} spots left
            </span>
            <span className="vol-stack-capacity-label">Open seats</span>
          </div>
          <div className="vol-stack-capacity-track" aria-hidden="true">
            <span
              className={`vol-stack-capacity-fill${urgent ? " vol-stack-capacity-fill--urgent" : ""}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <div className="vol-stack-org">
          <span className="vol-stack-org-avatar" aria-hidden="true">
            {orgInitial}
          </span>
          <div>
            <span className="vol-stack-org-name">{m.org}</span>
            <span className="vol-stack-org-verified">Verified organizer</span>
          </div>
          <span className="vol-stack-spots-pill" style={ss}>
            Join
          </span>
        </div>
      </div>

      <div className="vol-stack-card-foot" aria-hidden="true">
        <span>Tap for full details</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export default function MissionSwipeStack({ missions }: { missions: Mission[] }) {
  const stack = missions.slice(0, 3);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [sheet, setSheet] = useState<Mission | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);
  const startX = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIndex(0);
    setDragX(0);
  }, [missions]);

  const goNext = useCallback(() => {
    if (stack.length <= 1) return;
    setIndex((i) => (i + 1) % stack.length);
    setDragX(0);
  }, [stack.length]);

  const goPrev = useCallback(() => {
    if (stack.length <= 1) return;
    setIndex((i) => (i - 1 + stack.length) % stack.length);
    setDragX(0);
  }, [stack.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    setDragX(e.touches[0].clientX - startX.current);
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (dragX < -60) goNext();
    else if (dragX > 60) goPrev();
    setDragX(0);
  };

  const toggleSave = (slug: string) => {
    setSaved((s) => {
      const next = new Set(s);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
        setToast(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(false), 2400);
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  if (stack.length === 0) return null;

  const matchScores = [94, 88, 82];

  return (
    <section className="vol-mission-stack vol-mobile-only" aria-labelledby="vol-stack-heading">
      <div className="vol-section-kicker">Featured opportunities</div>
      <h2 id="vol-stack-heading" className="vol-section-heading">
        Missions worth your time
      </h2>

      <div
        className="vol-stack-stage"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {stack.map((m, i) => {
          const offset = (i - index + stack.length) % stack.length;
          const isActive = offset === 0;
          const isPeek = offset === 1;
          const rotate = isActive ? dragX * 0.035 : 0;
          const transform = isActive
            ? `translateX(${dragX}px) rotate(${rotate}deg) scale(1)`
            : isPeek
              ? "translateY(14px) scale(0.96)"
              : "translateY(26px) scale(0.91)";

          return (
            <button
              key={m.slug}
              type="button"
              className={`vol-stack-card${isActive ? " vol-stack-card--active" : ""}${dragging && isActive ? " vol-stack-card--dragging" : ""}`}
              style={{
                zIndex: stack.length - offset,
                opacity: offset > 1 ? 0 : isActive ? 1 : 0.45,
                transform,
                pointerEvents: isActive ? "auto" : "none",
              }}
              onClick={() => isActive && setSheet(m)}
              aria-label={`${m.title}, ${m.cause}, ${m.date}`}
            >
              <MissionStackCard
                m={m}
                indexLabel={`${i + 1}/${stack.length}`}
                matchScore={isActive ? matchScores[i] ?? 80 : undefined}
                isSaved={saved.has(m.slug)}
              />
            </button>
          );
        })}
      </div>

      <div className="vol-stack-nav" aria-label="Mission carousel">
        <p className="vol-stack-hint" aria-live="polite">
          {stack.length > 1 ? (
            <>
              <strong>{index + 1} of {stack.length}</strong> curated picks
            </>
          ) : (
            "Tap for details"
          )}
        </p>
        {stack.length > 1 && (
          <div className="vol-stack-dots" role="tablist" aria-label="Select mission">
            {stack.map((m, i) => (
              <button
                key={m.slug}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={i === index ? "vol-stack-dot--on" : ""}
                onClick={() => setIndex(i)}
                aria-label={`Mission ${i + 1}: ${m.title}`}
              />
            ))}
          </div>
        )}
        {stack.length > 1 && (
          <p className="vol-stack-swipe-hint">Swipe left or right</p>
        )}
      </div>

      <div className="vol-stack-actions">
        <Link href="/explore" className="vol-btn-primary">
          Explore all missions
        </Link>
      </div>

      <MissionPreviewSheet
        mission={sheet}
        saved={sheet ? saved.has(sheet.slug) : false}
        onClose={() => setSheet(null)}
        onSave={() => sheet && toggleSave(sheet.slug)}
      />

      <div
        className={`vol-save-toast${toast ? " vol-save-toast--in" : ""}`}
        role="status"
        aria-live="polite"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#1fae82" />
          <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Saved for later
        <Link href="/my-missions" className="nl-link-coral" onClick={() => setToast(false)}>
          View
        </Link>
      </div>
    </section>
  );
}
