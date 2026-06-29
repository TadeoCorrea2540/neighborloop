import { CauseKey } from "@/lib/data";
import type { MissionCard } from "@/lib/data/mission-cards";
import { missionCardMatchesCause } from "@/lib/explore-mobile-data";

export const PREFERENCE_CHIPS = [
  "This weekend",
  "Under 2 hours",
  "Near me",
  "Beginner-friendly",
  "With friends",
  "Certificates",
  "Animal causes",
  "Food support",
] as const;

export type PreferenceChip = (typeof PREFERENCE_CHIPS)[number];

export const MOBILE_VOL_CAUSES: {
  label: string;
  key: CauseKey;
}[] = [
  { label: "Food Support", key: "Food" },
  { label: "Animal Rescue", key: "Animals" },
  { label: "Tutoring", key: "Tutoring" },
  { label: "Cleanups", key: "Cleanup" },
  { label: "Community Care", key: "Elderly" },
  { label: "Environment", key: "Garden" },
];

/** Peach ↔ white, alternating */
export const CAUSE_TILE_BG = ["#fff0ec", "#fff"] as const;

export const MOBILE_WHY = [
  {
    title: "Meet people who care",
    desc: "Join missions alongside students, neighbors, and locals who show up for the same causes.",
    bg: "#fff0ec",
  },
  {
    title: "Turn free time into real help",
    desc: "Pick a mission that fits your schedule and make a tangible difference nearby.",
    bg: "#fff",
  },
  {
    title: "Build experience you can keep",
    desc: "Track hours, skills, and certificates for school, work, or your own story.",
    bg: "#fff0ec",
  },
];

export const MOBILE_JOURNEY = [
  {
    title: "Choose a cause",
    desc: "Browse missions by what matters to you — food, animals, tutoring, and more.",
  },
  {
    title: "Join a mission",
    desc: "Tap to sign up, get approved, and connect with the organizer.",
  },
  {
    title: "Show up and make impact",
    desc: "Volunteer locally and watch your hours, badges, and impact grow.",
  },
];

export const COMMUNITY_ACTIVITY = [
  {
    initials: "MR",
    color: "linear-gradient(135deg,#bca6ff,#7a6bf5)",
    text: "Maya joined Saturday Food Bank Sort",
    time: "18 minutes ago",
    pin: true,
  },
  {
    initials: "PC",
    color: "linear-gradient(135deg,#8fe3bd,#1fae82)",
    text: "Park cleanup reached 12 volunteers",
    time: "Near Riverside",
    pin: true,
  },
  {
    initials: "RB",
    color: "linear-gradient(135deg,#8bc0ff,#3a8bf0)",
    text: "A new tutor signed up for Reading Buddies",
    time: "This afternoon",
    pin: false,
  },
];

export const TRUST_CHECKLIST = [
  "A free profile",
  "A cause you care about",
  "Time to show up",
  "Respect for mission guidelines",
];

export const TRUST_DETAILS = [
  "Review date, location, and mission details",
  "Check age or skill requirements",
  "Confirm whether supplies are provided",
  "Ask the organizer questions before you join",
  "Cancel early if plans change",
  "Report unsafe or misleading missions",
];

export const PRIMARY_FAQ: [string, string][] = [
  [
    "Do I need experience?",
    "No. Many missions are beginner-friendly and only require your time, attention, and willingness to help.",
  ],
  [
    "Can I volunteer with friends?",
    "Yes. Save missions and invite friends to join the same event so you can help out together.",
  ],
  [
    "Will I get paid?",
    "Most missions are unpaid. Some organizers may offer meals, transport, certificates, or a small stipend — always shown upfront.",
  ],
  [
    "Can I receive hours or certificates?",
    "Yes. Check in on the day and your hours, badges, and certificates are recorded on your impact profile.",
  ],
];

export const MORE_FAQ: [string, string][] = [
  [
    "Does it cost anything to join?",
    "No. Creating a NeighborLoop profile and joining missions is completely free for volunteers.",
  ],
  [
    "How do I find missions near me?",
    "Explore by cause, date, location, difficulty, or time commitment — we'll surface your best matches.",
  ],
  [
    "Is there a minimum age?",
    "It depends on the mission. Age requirements are listed on each listing.",
  ],
  [
    "What if I can't make it after joining?",
    "Cancel early from your dashboard so the organizer can offer your spot to someone else.",
  ],
];

export function filterVolunteerMissionCards(
  cause: CauseKey,
  cards: MissionCard[]
): MissionCard[] {
  if (cause === "All") return cards;
  return cards.filter((c) => missionCardMatchesCause(c, cause));
}

export function causeMissionCounts(
  cards: MissionCard[]
): Record<Exclude<CauseKey, "All">, number> {
  const counts = {} as Record<Exclude<CauseKey, "All">, number>;
  for (const { key } of MOBILE_VOL_CAUSES) {
    counts[key as Exclude<CauseKey, "All">] = cards.filter((c) =>
      missionCardMatchesCause(c, key)
    ).length;
  }
  return counts;
}

export function formatNearbyCount(count: number): string {
  return count.toLocaleString();
}

export function preferenceMatchCount(selected: PreferenceChip[], total: number): number {
  if (selected.length === 0) return total;
  const base = Math.max(total, 4);
  const reduced = selected.length * 2;
  return Math.max(0, Math.min(total, base - reduced + Math.min(6, total)));
}
