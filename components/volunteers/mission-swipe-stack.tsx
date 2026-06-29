"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MissionCard } from "@/lib/data/mission-cards";
import ExploreMissionCard from "@/components/explore/explore-mission-card";
import MissionPreviewSheet from "./mission-preview-sheet";

export default function MissionSwipeStack({ cards }: { cards: MissionCard[] }) {
  const stack = cards.slice(0, 3);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [sheet, setSheet] = useState<MissionCard | null>(null);
  const startX = useRef(0);

  useEffect(() => {
    setIndex(0);
    setDragX(0);
  }, [cards]);

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

  return (
    <section className="vol-mission-stack vol-mobile-only" aria-labelledby="vol-stack-heading">
      <div className="vol-section-kicker">Featured opportunities</div>
      <h2 id="vol-stack-heading" className="vol-section-heading">
        Missions worth your time
      </h2>

      {stack.length === 0 ? (
        <div className="vol-stack-empty">
          <p>No live missions in this category yet.</p>
          <Link href="/explore" className="vol-btn-primary">
            Explore all missions
          </Link>
        </div>
      ) : (
        <>
          <div
            className="vol-stack-stage"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {stack.map((card, i) => {
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
                <div
                  key={card.mission.id}
                  className={`vol-stack-card${isActive ? " vol-stack-card--active" : ""}${dragging && isActive ? " vol-stack-card--dragging" : ""}`}
                  style={{
                    zIndex: stack.length - offset,
                    opacity: offset > 1 ? 0 : isActive ? 1 : 0.45,
                    transform,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  aria-hidden={!isActive}
                >
                  <ExploreMissionCard
                    card={card}
                    index={i}
                    layout="feed"
                    showCta
                    interactive="button"
                    onActivate={() => isActive && setSheet(card)}
                    className="vol-stack-exp-card"
                  />
                </div>
              );
            })}
          </div>

          <div className="vol-stack-nav" aria-label="Mission carousel">
            <p className="vol-stack-hint" aria-live="polite">
              {stack.length > 1 ? (
                <>
                  <strong>
                    {index + 1} of {stack.length}
                  </strong>{" "}
                  live missions
                </>
              ) : (
                "Tap for details"
              )}
            </p>
            {stack.length > 1 && (
              <div className="vol-stack-dots" role="tablist" aria-label="Select mission">
                {stack.map((card, i) => (
                  <button
                    key={card.mission.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    className={i === index ? "vol-stack-dot--on" : ""}
                    onClick={() => setIndex(i)}
                    aria-label={`Mission ${i + 1}: ${card.mission.title}`}
                  />
                ))}
              </div>
            )}
            {stack.length > 1 && (
              <p className="vol-stack-swipe-hint">Swipe left or right</p>
            )}
          </div>
        </>
      )}

      <div className="vol-stack-actions">
        <Link href="/explore" className="vol-btn-primary">
          Explore all missions
        </Link>
      </div>

      <MissionPreviewSheet
        card={sheet}
        onClose={() => setSheet(null)}
      />
    </section>
  );
}
