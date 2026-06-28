import Link from "next/link";
import SaveButton from "@/components/volunteer/save-button";
import { MissionDateLabel, MissionLocationLabel } from "@/components/mission-meta-label";
import {
  APPLICATION_STATUS_LABEL,
  fmtMissionDate,
  locationLabel,
  spotsLabel,
} from "@/lib/explore-card-helpers";
import type { MissionCard } from "@/lib/data/mission-cards";

export default function ExploreMissionCard({
  card,
  index = 0,
  layout = "grid",
  showCta = false,
  interactive = "link",
  onActivate,
  saveSlot,
  className,
}: {
  card: MissionCard;
  index?: number;
  layout?: "grid" | "feed" | "compact";
  showCta?: boolean;
  interactive?: "link" | "button";
  onActivate?: () => void;
  saveSlot?: React.ReactNode;
  className?: string;
}) {
  const m = card.mission;
  const spots = spotsLabel(card);
  const nearlyFull =
    card.spotsLeft != null && card.spotsLeft > 0 && card.spotsLeft <= 3 && !card.isFull;

  const body = (
    <>
      <h3 className="exp-card-title">{m.title}</h3>
      <p className="exp-card-org">{card.organizationName ?? "Organization"}</p>

      {layout === "feed" || layout === "compact" ? (
        <p className="exp-card-meta">
          <MissionDateLabel>{fmtMissionDate(m.startsAt)}</MissionDateLabel>
          {" · "}
          <MissionLocationLabel virtual={m.isVirtual}>
            {locationLabel(card)}
            {m.estimatedHours ? ` · ${m.estimatedHours}h` : ""}
          </MissionLocationLabel>
        </p>
      ) : (
        <div className="exp-card-meta">
          <MissionDateLabel>{fmtMissionDate(m.startsAt)}</MissionDateLabel>
          <MissionLocationLabel virtual={m.isVirtual}>
            {locationLabel(card)}
            {m.estimatedHours ? ` · ${m.estimatedHours}h` : ""}
          </MissionLocationLabel>
        </div>
      )}

      <div className="exp-card-foot">
        <span
          className={[
            "exp-card-spots",
            card.isFull ? "exp-card-spots--full" : "",
            nearlyFull ? "exp-card-spots--low" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {spots}
        </span>
        {card.applicationStatus && (
          <span className="exp-card-status">
            {APPLICATION_STATUS_LABEL[card.applicationStatus] ?? card.applicationStatus}
          </span>
        )}
        {showCta && <span className="exp-card-cta">View mission →</span>}
      </div>
    </>
  );

  const saveEl = saveSlot ?? <SaveButton missionId={m.id} initialSaved={card.isSaved} />;

  return (
    <article
      className={[
        "exp-card",
        layout === "feed" ? "exp-card--feed" : "",
        layout === "compact" ? "exp-card--compact" : "",
        "exp-card-stagger",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` } as React.CSSProperties}
    >
      <span className="exp-card-accent exp-brand-accent" aria-hidden="true" />

      {card.coverImageUrl ? (
        <div
          className="exp-card-cover"
          style={{ backgroundImage: `url('${card.coverImageUrl}')` }}
          aria-hidden="true"
        >
          <span className="exp-card-cover-shade" />
        </div>
      ) : null}

      <div className="exp-card-inner">
        <div className="exp-card-head">
          <div className="exp-card-badges">
            {card.categoryName && (
              <span className="exp-card-badge exp-card-badge--category">{card.categoryName}</span>
            )}
            {m.isBeginnerFriendly && (
              <span className="exp-card-badge exp-card-badge--beginner">Beginner-friendly</span>
            )}
            {m.difficulty && layout !== "compact" && (
              <span className="exp-card-badge exp-card-badge--diff">{m.difficulty}</span>
            )}
          </div>
          {saveEl}
        </div>

        {interactive === "button" && onActivate ? (
          <button type="button" className="exp-card-link" onClick={onActivate}>
            {body}
          </button>
        ) : (
          <Link href={`/missions/${m.slug}`} className="exp-card-link">
            {body}
          </Link>
        )}
      </div>
    </article>
  );
}
