"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { MissionCard } from "@/lib/data/mission-cards";
import { fmtMissionDate, locationLabel, spotsLabel } from "@/lib/explore-card-helpers";
import { MissionDateLabel, MissionLocationLabel } from "@/components/mission-meta-label";

export default function ExploreMissionPreviewSheet({
  card,
  saved,
  onClose,
  onSave,
}: {
  card: MissionCard | null;
  saved: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!card) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const focusId = requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(focusId);
      prevFocus?.focus?.();
    };
  }, [card, onClose]);

  if (!card) return null;

  const m = card.mission;
  const spots = spotsLabel(card);

  return (
    <>
      <div className="exp-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="exp-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exp-sheet-title"
      >
        <div className="exp-sheet-handle" aria-hidden="true" />
        <button
          type="button"
          ref={closeRef}
          className="exp-sheet-close"
          onClick={onClose}
          aria-label="Close mission preview"
        >
          ×
        </button>
        <span className="exp-sheet-accent exp-brand-accent" aria-hidden="true" />
        {card.coverImageUrl ? (
          <div className="exp-sheet-cover" style={{ backgroundImage: `url('${card.coverImageUrl}')` }} aria-hidden="true" />
        ) : null}
        <div className="exp-sheet-badges">
          {card.categoryName && <span className="exp-tag">{card.categoryName}</span>}
          {m.isBeginnerFriendly && <span className="exp-tag exp-tag--beginner">Beginner-friendly</span>}
        </div>
        <h3 id="exp-sheet-title" className="exp-sheet-title">
          {m.title}
        </h3>
        <p className="exp-sheet-org">{card.organizationName ?? "Organization"}</p>
        {m.summary && <p className="exp-sheet-desc">{m.summary}</p>}
        <ul className="exp-sheet-meta">
          <li>
            <MissionDateLabel>{fmtMissionDate(m.startsAt)}</MissionDateLabel>
          </li>
          <li>
            <MissionLocationLabel virtual={m.isVirtual}>{locationLabel(card)}</MissionLocationLabel>
          </li>
          <li className="exp-sheet-meta-tags">
            {m.difficulty && (
              <span className="exp-tag exp-tag--diff">
                {m.difficulty.charAt(0).toUpperCase() + m.difficulty.slice(1).toLowerCase()}
              </span>
            )}
            <span className="exp-tag exp-tag--spots">{spots}</span>
          </li>
        </ul>
        <div className="exp-sheet-actions">
          <button
            type="button"
            className={`exp-sheet-save${saved ? " exp-sheet-save--on" : ""}`}
            onClick={onSave}
            aria-pressed={saved}
          >
            {saved ? "Saved ✓" : "Save mission"}
          </button>
          <Link href={`/missions/${m.slug}`} className="exp-btn-primary" onClick={onClose}>
            View mission
          </Link>
        </div>
      </div>
    </>
  );
}
