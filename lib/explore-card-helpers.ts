import type { MissionCard } from "@/lib/data/mission-cards";

export function fmtMissionDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function spotsLabel(card: MissionCard): string {
  if (card.spotsLeft == null) return "Open spots";
  if (card.isFull) return "Full";
  if (card.spotsLeft <= 3) return `${card.spotsLeft} spots left`;
  return `${card.spotsLeft} spots left`;
}

export function locationLabel(card: MissionCard): string {
  const m = card.mission;
  if (m.isVirtual) return "Virtual";
  return m.locationLabel || m.city || "Nearby";
}

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  pending: "Applied · pending",
  approved: "You're in",
  waitlisted: "Waitlisted",
  declined: "Not selected",
  withdrawn: "Withdrawn",
  cancelled: "Cancelled",
};
