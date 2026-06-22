export type OrgTypeId =
  | "nonprofit"
  | "school"
  | "community"
  | "family"
  | "business";

export type MissionCategoryId =
  | "food"
  | "animals"
  | "tutoring"
  | "cleanups"
  | "community"
  | "donations";

export type LaunchTab = "Details" | "Volunteers" | "Impact";

export const ORG_TYPES: {
  id: OrgTypeId;
  label: string;
  response: string;
}[] = [
  {
    id: "nonprofit",
    label: "Nonprofit",
    response: "Perfect for food drives, donation sorting, recurring service programs, and community outreach.",
  },
  {
    id: "school",
    label: "School or club",
    response: "Great for service hours, tutoring, campus events, and student-led volunteer projects.",
  },
  {
    id: "community",
    label: "Community group",
    response: "Ideal for neighborhood cleanups, mutual aid, faith groups, and local association events.",
  },
  {
    id: "family",
    label: "Family or individual",
    response: "Start a meal train, donation drive, or local help campaign — no big team required.",
  },
  {
    id: "business",
    label: "Local business",
    response: "Organize team volunteer days, sponsorship events, and neighborhood partnership missions.",
  },
];

export const MISSION_CATEGORIES: {
  id: MissionCategoryId;
  label: string;
  example: string;
  title: string;
  description: string;
  impact: string;
}[] = [
  {
    id: "food",
    label: "Food Support",
    example: "Prepare grocery boxes for local families.",
    title: "Weekend Food Box Packing",
    description: "Help prepare 120 food boxes for families in the neighborhood.",
    impact: "120 families supported",
  },
  {
    id: "animals",
    label: "Animal Rescue",
    example: "Walk dogs and prep adoption kits.",
    title: "Shelter Care Saturday",
    description: "Support rescued animals with walks, cleaning, and adoption prep.",
    impact: "40 animals cared for",
  },
  {
    id: "tutoring",
    label: "Tutoring",
    example: "Help students with reading after school.",
    title: "After-School Reading Buddies",
    description: "Pair up with students for one-on-one reading support.",
    impact: "24 students supported",
  },
  {
    id: "cleanups",
    label: "Cleanups",
    example: "Restore a park or shoreline together.",
    title: "Neighborhood Park Cleanup",
    description: "Clear trails, collect litter, and refresh shared outdoor spaces.",
    impact: "2 acres restored",
  },
  {
    id: "community",
    label: "Community Care",
    example: "Visit and support seniors nearby.",
    title: "Sunshine Senior Visits",
    description: "Share conversation, meals, and companionship with local seniors.",
    impact: "35 neighbors visited",
  },
  {
    id: "donations",
    label: "Donation Drives",
    example: "Sort coats, supplies, or essentials.",
    title: "Winter Coat Donation Drive",
    description: "Collect, sort, and distribute warm clothing for winter.",
    impact: "200 coats distributed",
  },
];

export const ORG_TILE_BG = ["#fff0ec", "#fff"] as const;

export const START_CHECKLIST = [
  "A mission title",
  "A simple description",
  "Date and location",
  "How many volunteers you need",
  "A contact person",
];

export const START_OPTIONAL = [
  "Optional cover image",
  "Age requirements",
  "Skills or materials",
  "Safety information",
  "Online mission option",
];

export const ORG_JOURNEY = [
  {
    title: "Post your mission",
    desc: "Add the cause, time, location, and the help you need.",
  },
  {
    title: "Welcome the right people",
    desc: "Review signups, send updates, and keep everyone clear.",
  },
  {
    title: "Track your impact",
    desc: "Check attendance, count hours, and share what happened.",
  },
];

export const ORG_BENEFITS = [
  {
    title: "Find people who care about your cause",
    desc: "Reach volunteers already looking for meaningful local missions.",
    bg: "#fff0ec",
  },
  {
    title: "Keep signups and updates in one place",
    desc: "Replace scattered messages, spreadsheets, and last-minute confusion.",
    bg: "#fff",
  },
  {
    title: "Show the impact your mission created",
    desc: "Track hours, attendance, and outcomes you can share with your community.",
    bg: "#fff0ec",
  },
];

export const MOMENTUM_EVENTS = [
  {
    status: "Mission published",
    title: "Weekend Food Box Packing is now live",
    time: "Just now",
    dot: "live" as const,
  },
  {
    status: "6 volunteers joined",
    title: "Your first signup arrived in 12 minutes",
    time: "12 min ago",
    dot: "join" as const,
  },
  {
    status: "Attendance confirmed",
    title: "18 neighbors showed up",
    time: "After event",
    dot: "done" as const,
  },
  {
    status: "Impact recorded",
    title: "120 families supported",
    time: "Mission complete",
    dot: "impact" as const,
  },
];

export const TRUST_POINTS = [
  "Clear mission details",
  "Organizer profiles",
  "Optional verification",
  "Safety notes where needed",
  "Volunteer communication in one place",
];

export const TRUST_DETAILS = [
  "Some organizers or missions may require review before publishing",
  "High-risk or sensitive missions may need extra details",
  "Users can report misleading, unsafe, or inappropriate posts",
  "Organizers should clearly state age, location, materials, and safety requirements",
];

export const PRIMARY_ORG_FAQ: [string, string][] = [
  [
    "Do I need to be a registered nonprofit?",
    "No. Nonprofits, schools, clubs, community groups, families, and individuals can all post missions — as long as the campaign is safe, honest, and community-focused.",
  ],
  [
    "Can a family or individual post a mission?",
    "Yes. Families and individuals can organize local help, donation drives, meal trains, and neighborhood support campaigns.",
  ],
  [
    "What kinds of missions are allowed?",
    "Missions that help people, animals, education, or your neighborhood. Unsafe, misleading, or exploitative posts are not allowed.",
  ],
  [
    "Can I manage volunteer applications?",
    "Yes. Review interested volunteers, approve participants, message everyone, and send updates from one place.",
  ],
];

export const MORE_ORG_FAQ: [string, string][] = [
  [
    "Do volunteers get paid?",
    "NeighborLoop is built for volunteer support. Any compensation must be stated clearly upfront.",
  ],
  [
    "Can I track volunteer hours?",
    "Yes. Check people in on the day and count hours automatically after each mission.",
  ],
  [
    "Does NeighborLoop verify organizers?",
    "Some organizers or higher-risk missions may need verification before publishing.",
  ],
];

export function categoryMission(id: MissionCategoryId) {
  return MISSION_CATEGORIES.find((c) => c.id === id) ?? MISSION_CATEGORIES[0];
}
