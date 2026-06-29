"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { MissionCard } from "@/lib/data/mission-cards";
import {
  fmtMissionDate,
  locationLabel,
  spotsLabel,
} from "@/lib/explore-card-helpers";
import SaveButton from "@/components/volunteer/save-button";

export default function MissionPreviewSheet({
  card,
  onClose,
}: {
  card: MissionCard | null;
  onClose: () => void;
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
  const coverStyle = card.coverImageUrl
    ? { backgroundImage: `url('${card.coverImageUrl}')` }
    : {
        background: card.categoryAccentColor
          ? `linear-gradient(135deg, ${card.categoryAccentColor}, ${card.categoryAccentColor}cc)`
          : "linear-gradient(135deg,#ffd9c2,#ff9e7d)",
      };

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
        <div className="vol-sheet-media vol-sheet-media--cover" style={coverStyle}>
          {card.categoryName && (
            <span className="vol-stack-badge">{card.categoryName}</span>
          )}
        </div>
        <h3 id="vol-sheet-title" className="vol-sheet-title">
          {m.title}
        </h3>
        <p className="vol-sheet-org">{card.organizationName ?? "Organization"}</p>
        {m.summary && <p className="vol-sheet-desc">{m.summary}</p>}
        <ul className="vol-sheet-meta">
          <li>{fmtMissionDate(m.startsAt)}</li>
          <li>{locationLabel(card)}</li>
          {m.difficulty && <li>{m.difficulty}</li>}
          <li>{spotsLabel(card)}</li>
        </ul>
        <div className="vol-sheet-actions">
          <SaveButton missionId={m.id} initialSaved={card.isSaved} variant="full" />
          <Link href={`/missions/${m.slug}`} className="vol-btn-primary" onClick={onClose}>
            View mission
          </Link>
        </div>
      </div>
    </>
  );
}
