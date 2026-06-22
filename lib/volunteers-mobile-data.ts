import { CauseKey, MISSIONS, Mission } from "@/lib/data";

export const VOL_NEARBY_COUNT = "3,194";

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
  count: number;
}[] = [
  { label: "Food Support", key: "Food", count: 48 },
  { label: "Animal Rescue", key: "Animals", count: 31 },
  { label: "Tutoring", key: "Tutoring", count: 22 },
  { label: "Cleanups", key: "Cleanup", count: 27 },
  { label: "Community Care", key: "Elderly", count: 19 },
  { label: "Environment", key: "Garden", count: 24 },
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

export const MISSION_PURPOSE: Record<string, string> = {
  "saturday-food-bank-sort": "Sort donations and pack meals for families in need.",
  "ocean-beach-cleanup": "Restore the shoreline with a local environmental team.",
  "after-school-reading-buddy": "Help younger students build confidence through reading.",
  "cat-shelter-care-crew": "Care for rescued cats and support adoption prep.",
  "sunshine-senior-visits": "Share conversation and companionship with seniors.",
  "community-garden-planting": "Plant and green shared neighborhood spaces.",
  "winter-coat-donation-drive": "Sort and distribute warm clothing for winter.",
  "park-trail-restoration": "Restore trails and keep outdoor spaces accessible.",
};

export function missionPurpose(m: Mission): string {
  return MISSION_PURPOSE[m.slug] ?? `Support ${m.org} with a local ${m.cause.toLowerCase()} mission.`;
}

export function filterMissions(cause: CauseKey): Mission[] {
  return cause === "All" ? MISSIONS : MISSIONS.filter((m) => m.cause === cause);
}

export function preferenceMatchCount(selected: PreferenceChip[]): number {
  if (selected.length === 0) return MISSIONS.length;
  const base = 18;
  const reduced = selected.length * 2;
  return Math.max(4, Math.min(MISSIONS.length, base - reduced + 6));
}
