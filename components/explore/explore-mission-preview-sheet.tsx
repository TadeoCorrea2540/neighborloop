"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Mission, causeArt, spotStyle } from "@/lib/data";
import { missionPurpose } from "@/lib/volunteers-mobile-data";

export default function ExploreMissionPreviewSheet({
  mission,
  saved,
  onClose,
  onSave,
}: {
  mission: Mission | null;
  saved: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mission) return;
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
  }, [mission, onClose]);

  if (!mission) return null;

  const ss = spotStyle(mission.spots);

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
        <div className="exp-sheet-media" style={{ background: causeArt(mission) }}>
          <span className="exp-sheet-cause">{mission.cause}</span>
        </div>
        <h3 id="exp-sheet-title" className="exp-sheet-title">
          {mission.title}
        </h3>
        <p className="exp-sheet-desc">{missionPurpose(mission)}</p>
        <ul className="exp-sheet-meta">
          <li>{mission.date}</li>
          <li>{mission.dist}</li>
          <li>{mission.diff}</li>
          <li>
            <span
              style={{
                ...ss,
                padding: "4px 9px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {mission.spots} spots left
            </span>
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
          <Link href={`/missions/${mission.slug}`} className="exp-btn-primary" onClick={onClose}>
            View mission
          </Link>
        </div>
      </div>
    </>
  );
}
