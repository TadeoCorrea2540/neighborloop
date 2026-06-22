"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mission, causeArt, spotStyle } from "@/lib/data";
import { mockMatchScore } from "@/lib/explore-mobile-data";
import { missionPurpose } from "@/lib/volunteers-mobile-data";

export default function ExploreMissionSwipeStack({
  missions,
  saved,
  onOpen,
  onSave,
}: {
  missions: Mission[];
  saved: Set<string>;
  onOpen: (m: Mission) => void;
  onSave: (slug: string, e: React.MouseEvent) => void;
}) {
  const stack = missions.slice(0, 3);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

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

  if (stack.length === 0) return null;

  return (
    <section className="exp-swipe exp-mobile-only" aria-labelledby="exp-swipe-heading">
      <div className="exp-section-kicker">For you</div>
      <h2 id="exp-swipe-heading" className="exp-section-heading">
        Swipe to preview
      </h2>

      <div
        className="exp-swipe-stage"
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
          setDragging(true);
        }}
        onTouchMove={(e) => {
          if (!dragging) return;
          setDragX(e.touches[0].clientX - startX.current);
        }}
        onTouchEnd={() => {
          setDragging(false);
          if (dragX < -60) goNext();
          else if (dragX > 60) goPrev();
          setDragX(0);
        }}
      >
        {stack.map((m, i) => {
          const offset = (i - index + stack.length) % stack.length;
          const isActive = offset === 0;
          const isPeek = offset === 1;
          const rotate = isActive ? dragX * 0.03 : 0;
          const transform = isActive
            ? `translateX(${dragX}px) rotate(${rotate}deg)`
            : isPeek
              ? "translateY(12px) scale(0.96)"
              : "translateY(22px) scale(0.92)";

          const ss = spotStyle(m.spots);

          return (
            <button
              key={m.slug}
              type="button"
              className={`exp-swipe-card${isActive ? " exp-swipe-card--active" : ""}`}
              style={{
                zIndex: stack.length - offset,
                opacity: offset > 1 ? 0 : isActive ? 1 : 0.5,
                transform,
                pointerEvents: isActive ? "auto" : "none",
              }}
              onClick={() => isActive && onOpen(m)}
            >
              <div className="exp-swipe-media" style={{ background: causeArt(m) }}>
                <span className="exp-swipe-match">{mockMatchScore(m, i)}% match</span>
              </div>
              <div className="exp-swipe-body">
                <span className="exp-swipe-cause">{m.cause}</span>
                <h3>{m.title}</h3>
                <p>{missionPurpose(m)}</p>
                <div className="exp-swipe-meta">
                  <span>{m.date.split("·")[0]?.trim()}</span>
                  <span>{m.dist}</span>
                  <span className="exp-tag exp-tag--spots" style={ss}>
                    {m.spots} left
                  </span>
                </div>
                <button
                  type="button"
                  className={`exp-save-btn exp-save-btn--sm${saved.has(m.slug) ? " exp-save-btn--on" : ""}`}
                  onClick={(e) => onSave(m.slug, e)}
                  aria-pressed={saved.has(m.slug)}
                >
                  {saved.has(m.slug) ? "Saved" : "Save"}
                </button>
              </div>
            </button>
          );
        })}
      </div>

      {stack.length > 1 && (
        <div className="exp-swipe-dots" role="tablist" aria-label="Select mission">
          {stack.map((m, i) => (
            <button
              key={m.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={i === index ? "exp-swipe-dot--on" : ""}
              onClick={() => setIndex(i)}
              aria-label={`Mission ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
