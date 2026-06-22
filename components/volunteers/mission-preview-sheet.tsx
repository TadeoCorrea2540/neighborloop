"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Mission, causeArt, spotStyle } from "@/lib/data";
import { missionPurpose } from "@/lib/volunteers-mobile-data";

export default function MissionPreviewSheet({
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
    // move focus into the sheet for keyboard + screen-reader users
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
      <div className="vol-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="vol-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vol-sheet-title"
      >
        <div className="vol-sheet-handle" aria-hidden="true" />
        <button
          type="button"
          ref={closeRef}
          className="vol-sheet-close"
          onClick={onClose}
          aria-label="Close mission preview"
        >
          ×
        </button>
        <div
          className="vol-sheet-media"
          style={{ background: causeArt(mission) }}
        >
          <span className="vol-stack-badge">{mission.cause}</span>
        </div>
        <h3 id="vol-sheet-title" className="vol-sheet-title">
          {mission.title}
        </h3>
        <p className="vol-sheet-desc">{missionPurpose(mission)}</p>
        <ul className="vol-sheet-meta">
          <li>{mission.date}</li>
          <li>{mission.dist}</li>
          <li>{mission.diff}</li>
          <li>
            <span style={{ ...ss, padding: "4px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
              {mission.spots} spots left
            </span>
          </li>
        </ul>
        <div className="vol-sheet-actions">
          <button
            type="button"
            className={`vol-sheet-save${saved ? " vol-sheet-save--on" : ""}`}
            onClick={onSave}
            aria-pressed={saved}
          >
            {saved ? "Saved ✓" : "Save mission"}
          </button>
          <Link href={`/missions/${mission.slug}`} className="vol-btn-primary" onClick={onClose}>
            View mission
          </Link>
        </div>
      </div>
    </>
  );
}
