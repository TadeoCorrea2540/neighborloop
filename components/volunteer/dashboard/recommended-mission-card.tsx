import Link from "next/link";
import Icon from "@/components/icons";
import SaveButton from "@/components/volunteer/save-button";
import { MISSION_PLACEHOLDER_BG } from "@/lib/data";
import type { MissionCard } from "@/lib/data/mission-cards";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function locationLabel(card: MissionCard): string {
  const m = card.mission;
  if (m.isVirtual) return "Virtual";
  return m.city || m.locationLabel || "Nearby";
}

export default function RecommendedMissionCard({ card }: { card: MissionCard }) {
  const m = card.mission;
  const spots =
    card.spotsLeft == null ? "Open spots" : card.isFull ? "Full" : `${card.spotsLeft} spots left`;
  const coverStyle = card.coverImageUrl
    ? {
        background: `linear-gradient(180deg, rgba(8,12,28,0) 35%, rgba(8,12,28,.5)), url('${card.coverImageUrl}') center/cover no-repeat`,
      }
    : { background: MISSION_PLACEHOLDER_BG };

  return (
    <article className="vol-rec-card lift" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
        <SaveButton missionId={m.id} initialSaved={card.isSaved} />
      </div>
      <Link href={`/missions/${m.slug}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        <div className="vol-rec-cover" style={coverStyle}>
          <div className="vol-rec-badges">
            {card.categoryName && <span className="vol-rec-badge">{card.categoryName}</span>}
            {m.isBeginnerFriendly && <span className="vol-rec-badge">Beginner-friendly</span>}
          </div>
        </div>
        <div className="vol-rec-body">
          <div style={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.3, paddingRight: 28 }}>{m.title}</div>
          {card.organizationName && (
            <div style={{ fontSize: 12, color: "var(--muted-3)", marginTop: 3 }}>{card.organizationName}</div>
          )}
          <div
            style={{
              fontSize: 12,
              color: "var(--muted-3)",
              margin: "8px 0 10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 10px",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="pin" size={12} />
              {locationLabel(card)}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="calendar" size={12} />
              {fmtDate(m.startsAt)}
            </span>
            {m.estimatedHours != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="clock" size={12} />
                ~{m.estimatedHours}h
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: "4px 9px",
                borderRadius: 999,
                background: card.isFull ? "#f1f3f8" : "#dff6ea",
                color: card.isFull ? "var(--muted-2)" : "#1fae82",
              }}
            >
              {spots}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-deep)" }}>View →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
