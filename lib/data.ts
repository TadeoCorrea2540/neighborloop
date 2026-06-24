/* ============================================================
   NeighborLoop — shared seed data (ported from NeighborLoop.dc.html)
   ============================================================ */

export type CauseKey =
  | "All"
  | "Food"
  | "Cleanup"
  | "Tutoring"
  | "Animals"
  | "Elderly"
  | "Garden";

export const CAUSE_EMOJI: Record<CauseKey, string> = {
  All: "✦",
  Food: "🍲",
  Cleanup: "🌊",
  Tutoring: "📚",
  Animals: "🐾",
  Elderly: "🤝",
  Garden: "🌱",
};

export type Mission = {
  slug: string;
  title: string;
  org: string;
  cause: Exclude<CauseKey, "All">;
  emoji: string;
  /** gradient stops for the art tile */
  c1: string;
  c2: string;
  deep: string;
  spots: number;
  date: string;
  dist: string;
  diff: "Easy" | "Medium" | "Hard";
  /** optional cover photo; falls back to the gradient tile when absent */
  img?: string;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const mk = (
  title: string,
  org: string,
  cause: Mission["cause"],
  emoji: string,
  c1: string,
  c2: string,
  deep: string,
  spots: number,
  date: string,
  dist: string,
  diff: Mission["diff"]
): Mission => ({
  slug: slugify(title),
  title,
  org,
  cause,
  emoji,
  c1,
  c2,
  deep,
  spots,
  date,
  dist,
  diff,
});

export const MISSIONS: Mission[] = [
  { ...mk("Saturday Food Bank Sort", "Helping Hands SF", "Food", "🍲", "#ffd9c2", "#ff9e7d", "#ff7a4d", 6, "Sat, Jun 21 · 9:00 AM", "1.2 mi", "Easy"), img: "/food_bank.png" },
  { ...mk("Ocean Beach Cleanup", "Blue Coast Project", "Cleanup", "🌊", "#cfe6ff", "#8bc0ff", "#3a8bf0", 14, "Sun, Jun 22 · 8:30 AM", "3.4 mi", "Easy"), img: "/ocean.png" },
  { ...mk("After-School Reading Buddy", "BrightMinds", "Tutoring", "📚", "#e6dcff", "#bca6ff", "#7a6bf5", 3, "Wed, Jun 25 · 3:30 PM", "0.8 mi", "Medium"), img: "/school.png" },
  mk("Cat Shelter Care Crew", "Whiskers Rescue", "Animals", "🐾", "#d6f6e6", "#8fe3bd", "#1fae82", 5, "Fri, Jun 27 · 11:00 AM", "2.1 mi", "Easy"),
  mk("Sunshine Senior Visits", "Golden Years Co.", "Elderly", "🤝", "#ffe0d6", "#ffb09a", "#ff7a5c", 8, "Thu, Jun 26 · 1:00 PM", "1.7 mi", "Medium"),
  mk("Community Garden Planting", "GreenRoots", "Garden", "🌱", "#eaf7cf", "#c2e58a", "#7cb342", 10, "Sat, Jun 28 · 10:00 AM", "4.0 mi", "Easy"),
  mk("Winter Coat Donation Drive", "WarmTogether", "Food", "🧥", "#ffe7d0", "#ffc48f", "#ef9d3a", 4, "Sun, Jun 29 · 12:00 PM", "2.6 mi", "Easy"),
  mk("Park Trail Restoration", "Trailblazers", "Cleanup", "🥾", "#d6ecff", "#9fd0ff", "#3a8bf0", 12, "Mon, Jun 30 · 9:00 AM", "5.1 mi", "Hard"),
];

/**
 * Brand placeholder banner for any mission card without an uploaded cover
 * image — a soft coral diagonal fade, used everywhere so missing photos look
 * consistent instead of a per-cause rainbow.
 */
export const MISSION_PLACEHOLDER_BG =
  "linear-gradient(135deg, rgba(255,138,92,0.2), rgb(255,138,92))";

export const causeArt = (m: Mission) =>
  m.img
    ? `linear-gradient(180deg, rgba(8,12,28,0) 45%, rgba(8,12,28,.35)), url('${m.img}') center/cover no-repeat`
    : MISSION_PLACEHOLDER_BG;

/** coral pill when spots are scarce, mint otherwise */
export const spotStyle = (spots: number) =>
  spots <= 4
    ? { background: "#ffeae6", color: "#f1543f" }
    : { background: "#dff6ea", color: "#1fae82" };

/* ---------- live impact counters (landing) ---------- */
export const LIVE = {
  hours: 48213,
  volunteers: 12480,
  missions: 3194,
  meals: 91240,
};

/* ---------- volunteer dashboard stats ---------- */
export const VOL_STATS = {
  hours: 126,
  missions: 18,
  people: 540,
  badges: 9,
  goalPct: 72,
};

/* ---------- weekly hours chart ---------- */
export const CHART: { label: string; value: number }[] = [
  { label: "Mon", value: 46 },
  { label: "Tue", value: 72 },
  { label: "Wed", value: 58 },
  { label: "Thu", value: 88 },
  { label: "Fri", value: 64 },
  { label: "Sat", value: 96 },
  { label: "Sun", value: 50 },
];

/* org event-performance chart (same shape, mint gradient) */
export const ORG_CHART = CHART;

/* ---------- volunteer sidebar nav ---------- */
export const VOL_NAV: { label: string; icon: string; href: string }[] = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard" },
  { label: "My Missions", icon: "🎯", href: "/my-missions" },
  { label: "Impact", icon: "✨", href: "/impact" },
  { label: "Badges", icon: "🏅", href: "/badges" },
  { label: "Messages", icon: "💬", href: "/messages" },
  { label: "Settings", icon: "⚙️", href: "/settings" },
];

/* ---------- org sidebar nav ---------- */
export const ORG_NAV: {
  label: string;
  icon: string;
  href: string;
  badge?: string;
}[] = [
  { label: "Dashboard", icon: "📊", href: "/manage/dashboard" },
  { label: "Missions", icon: "🎯", href: "/manage/missions" },
  { label: "Applicants", icon: "📋", href: "/manage/applicants", badge: "9" },
  { label: "Attendance", icon: "✅", href: "/manage/attendance" },
  { label: "Messages", icon: "💬", href: "/manage/messages" },
  { label: "Impact reports", icon: "📈", href: "/manage/reports" },
];

/* ---------- my missions (by tab) ---------- */
export type MyMission = {
  title: string;
  date: string;
  loc: string;
  status: string;
  emoji: string;
  art: string;
  pill: { background: string; color: string };
};

export const MY_MISSIONS: Record<string, MyMission[]> = {
  Upcoming: [
    { title: "Saturday Food Bank Sort", date: "Sat, Jun 21 · 9:00 AM", loc: "SF Marina Food Bank", status: "Confirmed", emoji: "🍲", art: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", pill: { background: "#dff6ea", color: "#1fae82" } },
    { title: "Ocean Beach Cleanup", date: "Sun, Jun 22 · 8:30 AM", loc: "Ocean Beach, SF", status: "Waitlist", emoji: "🌊", art: "linear-gradient(135deg,#cfe6ff,#8bc0ff)", pill: { background: "#fff0dd", color: "#ff8a3c" } },
  ],
  Completed: [
    { title: "Community Garden Planting", date: "May 31 · 10:00 AM", loc: "Mission Community Garden", status: "4 hrs logged", emoji: "🌱", art: "linear-gradient(135deg,#eaf7cf,#c2e58a)", pill: { background: "#ece7ff", color: "#7a6bf5" } },
    { title: "After-School Reading", date: "May 24 · 3:30 PM", loc: "BrightMinds Center", status: "2 hrs logged", emoji: "📚", art: "linear-gradient(135deg,#e6dcff,#bca6ff)", pill: { background: "#ece7ff", color: "#7a6bf5" } },
  ],
  Saved: [
    { title: "Cat Shelter Care Crew", date: "Fri, Jun 27 · 11:00 AM", loc: "Whiskers Rescue", status: "Saved", emoji: "🐾", art: "linear-gradient(135deg,#d6f6e6,#8fe3bd)", pill: { background: "#e2effd", color: "#3a8bf0" } },
  ],
  Cancelled: [
    { title: "Winter Coat Drive", date: "Jun 7 · 12:00 PM", loc: "Downtown Shelter", status: "Cancelled", emoji: "🧥", art: "linear-gradient(135deg,#eef0f5,#dfe3ec)", pill: { background: "#eef0f5", color: "#98a2b8" } },
  ],
};
export const MY_TABS = ["Upcoming", "Completed", "Saved", "Cancelled"] as const;

/* ---------- badges ---------- */
export type Badge = {
  name: string;
  emoji: string;
  unlocked: boolean;
  pct: number;
  sub: string;
};
export const BADGES: Badge[] = [
  { name: "First Mission", emoji: "🌟", unlocked: true, pct: 100, sub: "Unlocked" },
  { name: "10 Hours", emoji: "⏱️", unlocked: true, pct: 100, sub: "Unlocked" },
  { name: "Team Player", emoji: "🤝", unlocked: true, pct: 100, sub: "Unlocked" },
  { name: "Eco Hero", emoji: "🌍", unlocked: true, pct: 100, sub: "Unlocked" },
  { name: "Bookworm", emoji: "📚", unlocked: false, pct: 60, sub: "3 of 5 missions" },
  { name: "Streak x7", emoji: "🔥", unlocked: false, pct: 71, sub: "5 of 7 days" },
  { name: "Century Club", emoji: "💯", unlocked: false, pct: 42, sub: "42 of 100 hrs" },
  { name: "Animal Ally", emoji: "🐾", unlocked: false, pct: 25, sub: "1 of 4 missions" },
  { name: "Legend", emoji: "🏆", unlocked: false, pct: 10, sub: "Top 1% goal" },
];

/* ---------- notifications ---------- */
export const NOTIFS: { emoji: string; text: string; time: string; tile: string }[] = [
  { emoji: "✅", text: "You checked in at Ocean Beach Cleanup", time: "2m ago", tile: "#dff6ea" },
  { emoji: "🏅", text: "New badge unlocked: Eco Hero", time: "1h ago", tile: "#fff0dd" },
  { emoji: "💬", text: "BrightMinds sent you a message", time: "3h ago", tile: "#e2effd" },
  { emoji: "📅", text: "Reminder: Food Bank Sort on Saturday", time: "1d ago", tile: "#ece7ff" },
];

/* ---------- messages ---------- */
export type Conversation = {
  name: string;
  emoji: string;
  last: string;
  time: string;
  c1: string;
  c2: string;
  unread: boolean;
};
export const CONVERSATIONS: Conversation[] = [
  { name: "BrightMinds", emoji: "📚", last: "Thanks for signing up! See you Wed.", time: "2m", c1: "#e6dcff", c2: "#bca6ff", unread: true },
  { name: "Blue Coast Project", emoji: "🌊", last: "Bring gloves for the cleanup 🧤", time: "1h", c1: "#cfe6ff", c2: "#8bc0ff", unread: false },
  { name: "Whiskers Rescue", emoji: "🐾", last: "Your application is approved 🎉", time: "3h", c1: "#d6f6e6", c2: "#8fe3bd", unread: false },
  { name: "GreenRoots", emoji: "🌱", last: "Announcement: new garden plots open", time: "1d", c1: "#eaf7cf", c2: "#c2e58a", unread: false },
  { name: "Golden Years Co.", emoji: "🤝", last: "We loved having you last week ❤", time: "2d", c1: "#ffe0d6", c2: "#ffb09a", unread: false },
];

/* ---------- applicants (org) ---------- */
export type Applicant = {
  name: string;
  meta: string;
  c1: string;
  c2: string;
  skills: string[];
  cause: string;
  note: string;
};
export const APPLICANTS: Record<string, Applicant[]> = {
  Pending: [
    { name: "Maya Rivera", meta: "126 hrs · 4.9★", c1: "#bca6ff", c2: "#7a6bf5", skills: ["Tutoring", "Reliable"], cause: "📚 Education", note: "New" },
    { name: "Leo Tanaka", meta: "48 hrs · 4.7★", c1: "#8bc0ff", c2: "#3a8bf0", skills: ["Outdoors", "First aid"], cause: "🌊 Environment", note: "New" },
    { name: "Priya Shah", meta: "First mission", c1: "#ffb09a", c2: "#ff7a5c", skills: ["Organized"], cause: "🌱 Garden", note: "New" },
    { name: "Daniel Okafor", meta: "24 hrs · 4.8★", c1: "#8fe3bd", c2: "#1fae82", skills: ["Driving", "Lifting"], cause: "🍲 Food", note: "New" },
  ],
  Approved: [
    { name: "Aisha Khan", meta: "210 hrs · 5.0★", c1: "#ffd28a", c2: "#ff9e3c", skills: ["Lead", "Tutoring"], cause: "📚 Education", note: "✓ Approved" },
    { name: "Marcus Lee", meta: "88 hrs · 4.6★", c1: "#a6e3c2", c2: "#3ab87f", skills: ["Outdoors"], cause: "🌊 Environment", note: "✓ Approved" },
  ],
  Rejected: [
    { name: "Sam Doe", meta: "No history", c1: "#cfd4e0", c2: "#98a2b8", skills: ["—"], cause: "—", note: "✕ Declined" },
  ],
};
export const APP_TABS = ["Pending", "Approved", "Rejected"] as const;

export const notePill = (note: string) =>
  note === "New"
    ? { background: "#fff0dd", color: "#ff8a3c" }
    : note.startsWith("✓")
    ? { background: "#dff6ea", color: "#1fae82" }
    : { background: "#ffeae6", color: "#f1543f" };

/* ---------- manage missions rows (org) ---------- */
export type ManageRow = {
  title: string;
  emoji: string;
  date: string;
  vol: number;
  cap: number;
  status: "Full" | "Open" | "Draft";
  pill: { background: string; color: string };
  art: string;
};
export const MANAGE_ROWS: ManageRow[] = [
  { title: "Community Garden Planting", emoji: "🌱", date: "Jun 28", vol: 10, cap: 10, status: "Full", pill: { background: "#dff6ea", color: "#1fae82" }, art: "linear-gradient(135deg,#eaf7cf,#c2e58a)" },
  { title: "Compost Workshop", emoji: "🌿", date: "Jul 5", vol: 6, cap: 12, status: "Open", pill: { background: "#e2effd", color: "#3a8bf0" }, art: "linear-gradient(135deg,#d6f6e6,#8fe3bd)" },
  { title: "Ocean Beach Cleanup", emoji: "🌊", date: "Jul 9", vol: 8, cap: 20, status: "Open", pill: { background: "#e2effd", color: "#3a8bf0" }, art: "linear-gradient(135deg,#cfe6ff,#8bc0ff)" },
  { title: "Seedling Giveaway", emoji: "🪴", date: "Jul 12", vol: 2, cap: 8, status: "Draft", pill: { background: "#fff0dd", color: "#ff8a3c" }, art: "linear-gradient(135deg,#eaf7cf,#c2e58a)" },
  { title: "Harvest Festival Setup", emoji: "🌻", date: "Jul 20", vol: 0, cap: 15, status: "Draft", pill: { background: "#fff0dd", color: "#ff8a3c" }, art: "linear-gradient(135deg,#fff0dd,#ffc48f)" },
];

/* ---------- pricing ---------- */
export const PRICING = {
  monthly: { pro: "$29", impact: "$99" },
  annual: { pro: "$23", impact: "$79" },
};

/* ---------- mission detail rich content (cat shelter is the designed one) ---------- */
export type MissionDetail = {
  whatYoullDo: string;
  bullets: string[];
  impactGoal: string;
  skills: string[];
  safety: string;
  coverGrad: string;
  date: string;
  time: string;
  spotsLeft: number;
  spotsTotal: number;
};

export const MISSION_DETAILS: Record<string, MissionDetail> = {
  "cat-shelter-care-crew": {
    whatYoullDo:
      "Join a small crew helping our rescue cats thrive. You'll feed and water the cats, refresh bedding, and spend time socializing shy kittens so they're ready for adoption. Training is provided on arrival — first-timers are very welcome. 💚",
    bullets: [
      "Feed, water & groom resident cats",
      "Clean & refresh kennels and bedding",
      "Socialize kittens for adoption readiness",
    ],
    impactGoal:
      "Help 40+ rescue cats get daily care this month and move 12 closer to adoption.",
    skills: ["Animal-friendly", "Reliable", "No experience needed"],
    safety:
      "Closed-toe shoes required. Please don't attend if you have a cat allergy. Hand sanitizer & gloves provided on site.",
    coverGrad: "linear-gradient(135deg,#d6f6e6,#8fe3bd)",
    date: "Fri, Jun 27 · 11:00 AM – 1:00 PM",
    time: "11:00 AM – 1:00 PM",
    spotsLeft: 5,
    spotsTotal: 10,
  },
};

export const getMission = (slug: string) =>
  MISSIONS.find((m) => m.slug === slug);
