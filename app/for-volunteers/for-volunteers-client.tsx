"use client";

import { useState, useEffect } from "react";
import PublicNav from "@/components/public-nav";
import SiteFooter from "@/components/site-footer";
import VolunteersMobileExperience from "@/components/volunteers/volunteers-mobile-experience";
import "./volunteers-mobile.css";

// ---- ported from NeighborLoop.dc.html · 06 · FOR VOLUNTEERS ----

const WHY = [
  { e: "💚", bg: "#fff0ec", t: "Make real impact", d: "Help people, animals, schools and neighborhoods that genuinely need support." },
  { e: "🫂", bg: "#e6f1ff", t: "Meet new people", d: "Join missions alongside other volunteers, students and local communities." },
  { e: "🌟", bg: "#def3e8", t: "Build experience", d: "Gain teamwork, leadership, communication and event experience that lasts." },
  { e: "🎯", bg: "#f0ecff", t: "Support your goals", d: "Use your history for school, scholarships, resumes, internships or growth." },
  { e: "🧭", bg: "#fff3da", t: "Discover causes you care about", d: "Try different missions and learn what kind of impact matters most to you." },
  { e: "✨", bg: "#ffe9ef", t: "Feel connected", d: "Turn free time into something social, useful and emotionally rewarding." },
];

const coralTile: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 13,
  background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
  flexShrink: 0,
};

const whyWhite = { stroke: "#fff", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const WHY_ICONS: Record<string, React.ReactNode> = {
  "Make real impact": (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19.5 4.9 12.6a4.3 4.3 0 0 1 6.1-6l1 1 1-1a4.3 4.3 0 0 1 6.1 6z" {...whyWhite} />
    </svg>
  ),
  "Meet new people": (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <circle cx="9" cy="8.8" r="2.7" />
        <path d="M3.8 18.5c0-3 2.4-5.2 5.2-5.2s5.2 2.2 5.2 5.2" />
        <circle cx="16.6" cy="9.6" r="2.1" />
        <path d="M15.4 13.5c2.5-.3 4.8 1.9 4.8 5" />
      </g>
    </svg>
  ),
  "Build experience": (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.6l2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.6l-5.1 2.7.98-5.68L3.75 9.6l5.7-.83z" {...whyWhite} />
    </svg>
  ),
  "Support your goals": (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.4" />
      </g>
      <circle cx="12" cy="12" r="1.5" fill="#fff" />
    </svg>
  ),
  "Discover causes you care about": (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <circle cx="12" cy="12" r="8.2" />
        <path d="M15.4 8.6l-2 4.8-4.8 2 2-4.8z" />
      </g>
    </svg>
  ),
  "Feel connected": (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 3.5l1.5 4.2 4.2 1.5-4.2 1.5L11 14.9l-1.5-4.2L5.3 9.2l4.2-1.5z" {...whyWhite} />
      <path d="M17.5 14l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z" fill="#fff" />
    </svg>
  ),
};

const PERKS = [
  { e: "🕓", bg: "#e6f1ff", t: "Service hours", back: "Logged automatically for every mission you join." },
  { e: "🏅", bg: "#fff3da", t: "Certificates", back: "Download proof of the hours you contributed." },
  { e: "🥪", bg: "#fff0ec", t: "Meals or snacks", back: "Often provided on-site during longer shifts." },
  { e: "🚌", bg: "#def3e8", t: "Transport support", back: "Some organizers cover or arrange your travel." },
  { e: "🎟️", bg: "#f0ecff", t: "Event access", back: "Free entry to partner and community events." },
  { e: "📘", bg: "#ffe9ef", t: "Learning experience", back: "Pick up real, hands-on skills as you help." },
  { e: "💵", bg: "#e6f1ff", t: "Small stipend", note: "if provided", back: "Only when the organizer offers it — shown upfront." },
  { e: "📝", bg: "#fff3da", t: "Reference", note: "if provided", back: "Ask organizers to vouch for your work." },
];

const PERK_ICONS: Record<string, React.ReactNode> = {
  "Service hours": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.6V12l3 1.8" />
      </g>
    </svg>
  ),
  "Certificates": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <rect x="4.5" y="4.5" width="15" height="10.5" rx="1.6" />
        <path d="M7.5 8h9M7.5 11h5" />
        <circle cx="15.5" cy="16.5" r="2.4" />
        <path d="M13.8 18 13.3 21.5l2.2-1.3 2.2 1.3-.5-3.5" />
      </g>
    </svg>
  ),
  "Meals or snacks": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <path d="M8.5 3.5v17" />
        <path d="M6.3 3.5v3.6a2.2 2.2 0 0 0 4.4 0V3.5" />
        <path d="M15.2 20.5v-7c-1.7-.4-2.7-1.6-2.7-3.8 0-3.2 1.4-6 3-6.2z" />
      </g>
    </svg>
  ),
  "Transport support": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <rect x="3.5" y="5.5" width="17" height="10" rx="2" />
        <path d="M3.5 10.5h17" />
        <circle cx="8" cy="18" r="1.6" />
        <circle cx="16" cy="18" r="1.6" />
      </g>
    </svg>
  ),
  "Event access": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 8.5v1.3a1.9 1.9 0 0 0 0 4.4v1.3a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 15.5v-1.3a1.9 1.9 0 0 0 0-4.4z" />
        <path d="M14 7.5v9" strokeDasharray="1.6 2" />
      </g>
    </svg>
  ),
  "Learning experience": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <path d="M12 6.6C10.5 5.5 8.3 5.1 6.2 5.5v12c2.1-.4 4.3-.1 5.8.9 1.5-1 3.7-1.3 5.8-.9v-12c-2.1-.4-4.3 0-5.8 1.1z" />
        <path d="M12 6.6v12" />
      </g>
    </svg>
  ),
  "Small stipend": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M6.3 6.5v11M17.7 6.5v11" />
      </g>
    </svg>
  ),
  "Reference": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...whyWhite}>
        <rect x="5.5" y="4" width="13" height="16" rx="1.8" />
        <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
      </g>
    </svg>
  ),
};

const JOIN = [
  { e: "🐾", g: "linear-gradient(135deg,#d6f6e6,#8fe3bd)", t: "Animal rescue", q: "“Help walk rescued dogs or prepare adoption kits.”" },
  { e: "📚", g: "linear-gradient(135deg,#e6dcff,#bca6ff)", t: "Tutoring", q: "“Support younger students with reading or homework.”" },
  { e: "🌊", g: "linear-gradient(135deg,#cfe6ff,#8bc0ff)", t: "Cleanup", q: "“Join a weekend team restoring a local park.”" },
  { e: "🍲", g: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", t: "Food support", q: "“Sort donations and prepare food boxes for families.”" },
];

const JOIN_ICONS: Record<string, React.ReactNode> = {
  "Animal rescue": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <ellipse cx="8" cy="9.7" rx="1.6" ry="2" />
      <ellipse cx="12" cy="8.4" rx="1.7" ry="2.1" />
      <ellipse cx="16" cy="9.7" rx="1.6" ry="2" />
      <path d="M12 11.2c2.4 0 4.3 1.7 4.3 3.8 0 1.5-1.2 2.4-2.6 2.4-.8 0-1.1-.4-1.7-.4s-.9.4-1.7.4c-1.4 0-2.6-.9-2.6-2.4 0-2.1 1.9-3.8 4.3-3.8z" />
    </svg>
  ),
  "Tutoring": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7.5C10.4 6.2 8 5.7 5 6.1v11.4c3-.4 5.4.1 7 1.4 1.6-1.3 4-1.8 7-1.4V6.1c-3-.4-5.4.1-7 1.4z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7.5v11.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  "Cleanup": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 13.6c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 17.7c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  "Food support": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
      <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="#fff" />
      <path d="M2.4 10.6h19.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  ),
};

const JOIN_CHIPS = [
  "Community gardens", "Elderly support", "Donation drives", "School events",
  "Youth mentorship", "Environmental action", "Emergency support", "Cultural events",
  "Health awareness", "Local fundraisers",
];

const REQUIRED = [
  "A free NeighborLoop account", "Your availability", "A basic profile",
  "Respect for mission rules", "Your cause interests", "A willingness to show up & help",
];

const BEFORE_YOU_JOIN = [
  "Read the mission details", "Check the location and time", "Review age or skill requirements",
  "Confirm whether supplies are provided", "Message the organizer with questions", "Cancel early if you can't attend",
];

const HOW = [
  { n: "1", e: "👤", bg: "#fff0ec", nc: "#ffd0c4", t: "Create your profile", d: "Add your interests, availability and the causes you care about." },
  { n: "2", e: "🔎", bg: "#e6f1ff", nc: "#c4ddff", t: "Explore missions", d: "Search by cause, date, location, difficulty or time commitment." },
  { n: "3", e: "🙌", bg: "#def3e8", nc: "#bde6d2", t: "Join or apply", d: "Save missions, apply, or join directly depending on the organizer." },
  { n: "4", e: "🏅", bg: "#f0ecff", nc: "#d8cdff", t: "Show up & track impact", d: "Check in, complete the mission, earn hours, badges and certificates." },
];

const stepWhite = { stroke: "#fff", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const HOW_ICONS: Record<string, React.ReactNode> = {
  "Create your profile": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...stepWhite}>
        <circle cx="12" cy="8.5" r="3.6" />
        <path d="M5.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      </g>
    </svg>
  ),
  "Explore missions": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...stepWhite}>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.6-3.6" />
      </g>
    </svg>
  ),
  "Join or apply": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...stepWhite}>
        <circle cx="10" cy="8.5" r="3.2" />
        <path d="M3.8 19c0-3.4 2.8-5.8 6.2-5.8 1 0 1.9.2 2.7.5" />
        <path d="M18 13.5v5M15.5 16h5" />
      </g>
    </svg>
  ),
  "Show up & track impact": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...stepWhite}>
        <path d="M8.5 2.5 11 8M15.5 2.5 13 8" />
        <circle cx="12" cy="14.5" r="5.6" />
      </g>
      <path d="M12 11.7l.9 1.85 2.05.3-1.48 1.43.35 2.04L12 16.4l-1.82.95.35-2.04-1.48-1.43 2.05-.3z" fill="#fff" />
    </svg>
  ),
};

const FILTERS = [
  { e: "🍲", label: "Food support" },
  { e: "🐾", label: "Animals" },
  { e: "📚", label: "Education" },
  { e: "🌊", label: "Environment" },
  { e: "📅", label: "Weekends" },
  { e: "📍", label: "Nearby" },
  { e: "🌱", label: "Beginner-friendly" },
  { e: "⏱️", label: "Short missions" },
];
const DEFAULT_FILTERS = ["Food support", "Weekends", "Nearby", "Beginner-friendly"];

const WHY_MATCHES = [
  "Matches your weekend availability",
  "Close to your area",
  "No experience required",
  "Supports your cause: Food Support",
];

const ccLn = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const FILTER_ICONS: Record<string, React.ReactNode> = {
  "Food support": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="currentColor" />
      <path d="M2.4 10.6h19.2M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  "Animals": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="8" cy="9.7" rx="1.5" ry="1.9" />
      <ellipse cx="12" cy="8.4" rx="1.6" ry="2" />
      <ellipse cx="16" cy="9.7" rx="1.5" ry="1.9" />
      <path d="M12 11.4c2.3 0 4.1 1.6 4.1 3.6 0 1.4-1.1 2.3-2.5 2.3-.8 0-1-.4-1.6-.4s-.8.4-1.6.4c-1.4 0-2.5-.9-2.5-2.3 0-2 1.8-3.6 4.1-3.6z" />
    </svg>
  ),
  "Education": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7.5C10.4 6.2 8 5.7 5 6.1v11.4c3-.4 5.4.1 7 1.4 1.6-1.3 4-1.8 7-1.4V6.1c-3-.4-5.4.1-7 1.4zM12 7.5v11.4" {...ccLn} />
    </svg>
  ),
  "Environment": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...ccLn}>
        <path d="M3 8c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" />
        <path d="M3 13c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" />
        <path d="M3 18c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" />
      </g>
    </svg>
  ),
  "Weekends": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...ccLn}>
        <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
        <path d="M4 9.5h16M8 3.5v4M16 3.5v4" />
      </g>
    </svg>
  ),
  "Nearby": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" {...ccLn} />
      <circle cx="12" cy="10" r="2.4" fill="currentColor" />
    </svg>
  ),
  "Beginner-friendly": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...ccLn}>
        <path d="M12 20v-7" />
        <path d="M12 13C9.3 13 7 11 6.5 7.8c3.2-.5 5.5 1.4 5.5 5.2z" />
        <path d="M12.3 15c2.7 0 5-2 5.5-5.2-3.2-.5-5.5 1.4-5.5 5.2z" />
      </g>
    </svg>
  ),
  "Short missions": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...ccLn}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.6V12l3 1.8" />
      </g>
    </svg>
  ),
};
const FILTER_CHECK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SOCIAL = [
  { e: "👯", bg: "#fff0ec", t: "Join with friends", d: "Save missions and invite friends to the same event." },
  { e: "📍", bg: "#e6f1ff", t: "Meet people nearby", d: "Connect with people who care about similar causes." },
  { e: "📊", bg: "#def3e8", t: "Build your impact profile", d: "Keep a visible record of missions, hours and badges." },
  { e: "🔁", bg: "#f0ecff", t: "Turn one event into a habit", d: "Follow organizations and discover recurring missions." },
];

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  "Join with friends": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...stepWhite}>
        <circle cx="9" cy="8.8" r="2.7" />
        <path d="M3.8 18.5c0-3 2.4-5.2 5.2-5.2s5.2 2.2 5.2 5.2" />
        <circle cx="16.6" cy="9.6" r="2.1" />
        <path d="M15.4 13.5c2.5-.3 4.8 1.9 4.8 5" />
      </g>
    </svg>
  ),
  "Meet people nearby": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" {...stepWhite} />
      <circle cx="12" cy="10" r="2.6" fill="#fff" />
    </svg>
  ),
  "Build your impact profile": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...stepWhite}>
        <path d="M4 20h16" />
        <path d="M7 20v-5M12 20v-9M17 20v-7" />
      </g>
    </svg>
  ),
  "Turn one event into a habit": (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <g {...stepWhite}>
        <path d="M4.5 10a7.5 7.5 0 0 1 12.7-3.4L20 9" />
        <path d="M20 4.5V9h-4.5" />
        <path d="M19.5 14a7.5 7.5 0 0 1-12.7 3.4L4 15" />
        <path d="M4 19.5V15h4.5" />
      </g>
    </svg>
  ),
};

const GROWTH_TAGS = ["Leadership", "Teamwork", "Communication", "Event support", "Mentoring", "Service hours", "Shareable certificates"];
const GROWTH_STATS = [
  { v: "42", c: "#1fae82", l: "volunteer hours" },
  { v: "8", c: "#3a8bf0", l: "missions completed" },
  { v: "4", c: "#f1543f", l: "causes supported" },
  { v: "3", c: "#7a6bf5", l: "badges · 2 certificates" },
];

const SAFETY = [
  { t: "Clear details upfront", d: "Every mission shows what you'll do before you join." },
  { t: "Verified organizers", d: "Many organizations are reviewed and badged." },
  { t: "Safety notes shown", d: "Each mission lists what to bring and expect." },
  { t: "Requirements listed", d: "Age and skill needs are clear from the start." },
  { t: "Message organizers", d: "Ask anything before committing to a mission." },
  { t: "Report anything", d: "Flag suspicious or unsafe missions in a tap." },
];

const FAQ: [string, string][] = [
  ["Do I need experience to volunteer?", "No. Many missions are beginner-friendly and only require your time, attention and willingness to help. Each listing shows the skill level needed."],
  ["Does it cost anything to join?", "No. Creating a NeighborLoop profile and joining missions is completely free for volunteers."],
  ["Do volunteers get paid?", "Most missions are unpaid. Some organizers offer perks like service hours, certificates, meals or a small stipend — and any compensation is always shown clearly before you join."],
  ["How do I find missions near me?", "Explore missions by cause, date, location, difficulty or time commitment, and we'll surface the ones that best match your interests and availability."],
  ["Can I volunteer with friends?", "Yes. Save missions and invite friends to join the same event so you can help out together."],
  ["Is there a minimum age to volunteer?", "It depends on the mission. Age and skill requirements are listed on each mission, and some are open to younger volunteers with guardian consent."],
  ["What if I can't make it after joining?", "Plans change — just cancel early from your dashboard so the organizer can offer your spot to someone else."],
  ["Will my hours and impact be tracked?", "Yes. Check in on the day and your hours, badges and certificates are recorded on your impact profile to share for school, scholarships or work."],
];

const kicker: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#f1543f", letterSpacing: ".08em" };
const h2: React.CSSProperties = { fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" };
const checkPath = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="#1fae82" />
    <path d="M4.6 8.2l2.1 2.1 4.7-4.7" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type CardItem = { e: string; t: string; desc?: string; note?: string };

function DiscoverGrid({ items, icons }: { items: CardItem[]; icons: Record<string, React.ReactNode> }) {
  const [found, setFound] = useState<string[]>([]);
  const discover = (t: string) => setFound((f) => (f.includes(t) ? f : [...f, t]));
  const all = found.length >= items.length;
  const pct = Math.round((found.length / items.length) * 100);

  return (
    <div>
      {/* progress bar */}
      <div style={{ maxWidth: 420, margin: "0 auto 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: all ? "#1fae82" : "#5a6685" }}>
            {all ? "All discovered! 🎉" : `Hover to discover · ${found.length}/${items.length}`}
          </span>
          <span style={{ color: "#f1543f" }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: "#f1f3f8", overflow: "hidden" }}>
          <span
            style={{
              display: "block", height: "100%", width: `${pct}%`, borderRadius: 99,
              background: all ? "linear-gradient(90deg,#34d99c,#1fae82)" : "linear-gradient(90deg,#ff8a5c,#ff5e7a)",
              transition: "width .5s cubic-bezier(.2,.8,.2,1), background .4s",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, textAlign: "left" }} className="card-grid-4">
        {items.map((c) => {
          const on = found.includes(c.t);
          return (
            <div
              key={c.t}
              onMouseEnter={() => discover(c.t)}
              onClick={() => discover(c.t)}
              className="hiw-card"
              style={{
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                background: on ? "linear-gradient(180deg,#ffffff,#fff5f1)" : "#fbfcfe",
                border: `1px solid ${on ? "rgba(255,111,94,.4)" : "rgba(24,32,59,.06)"}`,
                borderRadius: 20,
                padding: 24,
                transform: on ? "translateY(-4px)" : "none",
                boxShadow: on ? "0 24px 44px -26px rgba(255,111,94,.6)" : "0 1px 0 rgba(0,0,0,0)",
                transition: "transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s, border-color .4s, background .4s",
              }}
            >
              {on && (
                <span
                  style={{
                    position: "absolute", top: 14, right: 14, width: 26, height: 26, borderRadius: "50%",
                    background: "linear-gradient(135deg,#34d99c,#1fae82)", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 16px -6px rgba(31,174,130,.8)", animation: "stampPop .5s cubic-bezier(.2,1.4,.4,1) both",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 8.3l2.4 2.4L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <span style={{ position: "relative", display: "inline-flex" }}>
                {on && (
                  <span
                    key={`r-${found.length}`}
                    style={{
                      position: "absolute", inset: 0, borderRadius: 13, border: "2px solid #ff7a5c",
                      animation: "discoverRipple .8s ease-out", pointerEvents: "none",
                    }}
                  />
                )}
                <span
                  className="hiw-tile"
                  style={{
                    ...coralTile,
                    transform: on ? "scale(1.12) rotate(-4deg)" : "none",
                    boxShadow: on ? "0 12px 22px -8px rgba(255,111,94,.85)" : "none",
                    transition: "transform .45s cubic-bezier(.2,1.3,.4,1), box-shadow .4s",
                  }}
                >
                  {icons[c.t] ?? c.e}
                </span>
              </span>
              <div style={{ fontWeight: 700, fontSize: 17, margin: "15px 0 5px" }}>
                {c.t}
                {c.note && <span style={{ display: "inline", fontSize: 12, color: "#9aa3bd", fontWeight: 500 }}> · {c.note}</span>}
              </div>
              <div style={{ fontSize: 14, color: "#5a6685", lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Coverflow({ items, icons }: { items: CardItem[]; icons: Record<string, React.ReactNode> }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 2600);
    return () => clearInterval(id);
  }, [paused, n]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div style={{ position: "relative", height: 232, perspective: 1400, maxWidth: 1200, margin: "0 auto" }}>
        {items.map((p, i) => {
          let off = i - active;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          const show = abs <= 2;
          const center = off === 0;
          const scale = center ? 1 : abs === 1 ? 0.84 : 0.7;
          const op = center ? 1 : abs === 1 ? 0.6 : 0.25;
          return (
            <div
              key={p.t}
              onClick={() => setActive(i)}
              style={{
                position: "absolute", top: "50%", left: "50%", width: 232,
                transform: `translate(-50%,-50%) translateX(${off * 86}%) rotateY(${off * -34}deg) scale(${scale})`,
                opacity: show ? op : 0,
                pointerEvents: show ? "auto" : "none",
                transition: "transform .6s cubic-bezier(.2,.8,.2,1), opacity .6s",
                zIndex: 10 - abs,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${center ? "rgba(255,111,94,.4)" : "rgba(24,32,59,.08)"}`,
                  borderRadius: 18, padding: "22px 20px", textAlign: "center", minHeight: 184,
                  boxShadow: center ? "0 32px 60px -26px rgba(255,111,94,.6)" : "0 18px 34px -24px rgba(24,32,59,.45)",
                }}
              >
                <span
                  className="hiw-tile"
                  style={{
                    ...coralTile, margin: "0 auto",
                    width: center ? 58 : 48, height: center ? 58 : 48,
                    transition: "width .5s, height .5s",
                  }}
                >
                  {icons[p.t] ?? p.e}
                </span>
                <div style={{ fontWeight: 800, fontSize: 16, marginTop: 13 }}>
                  {p.t}
                  {p.note && <span style={{ display: "block", fontSize: 11, color: "#9aa3bd", fontWeight: 500 }}>{p.note}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: "#5a6685", lineHeight: 1.5, marginTop: 8, opacity: center ? 1 : 0, transition: "opacity .4s" }}>
                  {p.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
        {items.map((p, i) => (
          <button
            key={p.t}
            onClick={() => setActive(i)}
            aria-label={p.t}
            style={{
              height: 8, width: i === active ? 24 : 8, borderRadius: 99, border: "none", padding: 0, cursor: "pointer",
              background: i === active ? "linear-gradient(90deg,#ff8a5c,#ff5e7a)" : "rgba(24,32,59,.15)",
              transition: "width .35s, background .35s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

import type { MissionCard } from "@/lib/data/mission-cards";

export default function ForVolunteersClient({
  missionCards,
}: {
  missionCards: MissionCard[];
}) {
  const [selected, setSelected] = useState<string[]>(DEFAULT_FILTERS);
  const [faqOpen, setFaqOpen] = useState(0);

  const toggle = (label: string) =>
    setSelected((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));

  return (
    <div className="vol-page" style={{ background: "#fff", minHeight: "100vh" }}>
      <PublicNav />
      <VolunteersMobileExperience missionCards={missionCards} />

      <div className="vol-desktop-only">
      {/* HERO */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1.04fr 1fr",
          gap: 26,
          padding: "58px 36px 64px",
          maxWidth: 1280,
          margin: "0 auto",
          borderRadius: 28,
          backgroundImage:
            "linear-gradient(105deg, rgba(20,26,46,.66) 0%, rgba(20,26,46,.34) 50%, rgba(20,26,46,.12) 100%), url('/volunteers.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="org-hero"
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            alignSelf: "center",
            background: "rgba(255,255,255,.14)",
            backdropFilter: "blur(18px) saturate(140%)",
            WebkitBackdropFilter: "blur(18px) saturate(140%)",
            border: "1px solid rgba(255,255,255,.28)",
            borderRadius: 26,
            padding: "34px 34px 36px",
            boxShadow: "0 30px 60px -28px rgba(10,14,30,.7), inset 0 1px 0 rgba(255,255,255,.25)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.92)", border: "1px solid rgba(255,255,255,.6)", padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, color: "#f1543f", boxShadow: "0 8px 20px -14px rgba(24,32,59,.4)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1fae82" }} />3,194 missions near you
          </span>
          <h1 style={{ fontSize: 50, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-.03em", margin: "20px 0 0", color: "#fff", textShadow: "0 2px 18px rgba(8,12,28,.45)" }}>
            Find your people. Do something that matters.
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,.92)", lineHeight: 1.55, margin: "20px 0 30px", maxWidth: 500, textShadow: "0 1px 10px rgba(8,12,28,.4)" }}>
            Discover local volunteer missions, join causes you care about, meet new people, build experience, and turn free time into real-world impact.
          </p>
          <div style={{ display: "flex", gap: 13, marginBottom: 24 }}>
            <span className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 16, padding: "15px 26px", borderRadius: 14, boxShadow: "0 16px 30px -12px rgba(255,111,94,.85)", cursor: "pointer" }}>
              Explore Missions →
            </span>
            <span style={{ background: "#fff", border: "1px solid rgba(24,32,59,.12)", color: "#18203b", fontWeight: 700, fontSize: 16, padding: "15px 26px", borderRadius: 14, cursor: "pointer" }}>
              How It Works
            </span>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {["No experience needed", "Flexible opportunities", "Track your impact", "Meet people near you"].map((c) => (
              <span key={c} style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid rgba(24,32,59,.08)", fontSize: 13, fontWeight: 600, color: "#5a6685", padding: "8px 13px", borderRadius: 11 }}>
                {checkPath} {c}
              </span>
            ))}
          </div>
        </div>

        {/* hero visual: volunteer profile + missions */}
        <div style={{ position: "relative", zIndex: 2, minHeight: 450 }} className="org-hero-art">
          {/* profile card */}
          <div style={{ position: "absolute", left: 28, top: 36, width: 236, background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 30px 56px -26px rgba(24,32,59,.5)", animation: "floaty 7s ease-in-out infinite" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#bca6ff,#7a6bf5)" }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Maya Rivera</div>
                <div style={{ fontSize: 12, color: "#9aa3bd" }}>Volunteer · Lvl 4</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 14 }}>
              <div style={{ position: "relative", width: 58, height: 58, flexShrink: 0 }}>
                <svg width="58" height="58" viewBox="0 0 58 58">
                  <circle cx="29" cy="29" r="24" fill="none" stroke="#f1f3f8" strokeWidth="7" />
                  <circle cx="29" cy="29" r="24" fill="none" stroke="#ff6f5e" strokeWidth="7" strokeLinecap="round" strokeDasharray="151" strokeDashoffset="42" transform="rotate(-90 29 29)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#f1543f" }}>72%</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9aa3bd" }}>This month</div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>21 / 30 hrs</div>
              </div>
            </div>
          </div>
          {/* floating badges */}
          <div style={{ position: "absolute", right: 14, top: 30, background: "#fff", borderRadius: 14, padding: "9px 13px", boxShadow: "0 20px 40px -22px rgba(24,32,59,.45)", animation: "floaty2 8s ease-in-out infinite", fontSize: 12.5, fontWeight: 700, color: "#1fae82", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <g stroke="#1fae82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13.5" r="7.2" />
                <path d="M12 13.5V9.8M9.6 3.5h4.8M12 3.5v2.3" />
              </g>
            </svg>
            3 hours completed
          </div>
          <div style={{ position: "absolute", right: 40, top: 118, background: "#fff", borderRadius: 14, padding: "9px 13px", boxShadow: "0 20px 40px -22px rgba(24,32,59,.45)", animation: "floaty 6.5s ease-in-out infinite", fontSize: 12.5, fontWeight: 700, color: "#7a6bf5", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#7a6bf5" aria-hidden="true">
              <ellipse cx="8" cy="9.7" rx="1.5" ry="1.9" />
              <ellipse cx="12" cy="8.4" rx="1.6" ry="2" />
              <ellipse cx="16" cy="9.7" rx="1.5" ry="1.9" />
              <path d="M12 11.4c2.3 0 4.1 1.6 4.1 3.6 0 1.4-1.1 2.3-2.5 2.3-.8 0-1-.4-1.6-.4s-.8.4-1.6.4c-1.4 0-2.5-.9-2.5-2.3 0-2 1.8-3.6 4.1-3.6z" />
            </svg>
            Animal rescue
          </div>
          <div style={{ position: "absolute", right: 18, top: 196, background: "#fff", borderRadius: 14, padding: "9px 13px", boxShadow: "0 20px 40px -22px rgba(24,32,59,.45)", animation: "floaty2 7.5s ease-in-out infinite", fontSize: 12.5, fontWeight: 700, color: "#ff8a3c", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8.5 2.5 11 8M15.5 2.5 13 8" stroke="#ff8a3c" strokeWidth="1.9" strokeLinecap="round" />
              <circle cx="12" cy="14.5" r="5.6" stroke="#ff8a3c" strokeWidth="1.9" />
              <path d="M12 11.7l.9 1.85 2.05.3-1.48 1.43.35 2.04L12 16.4l-1.82.95.35-2.04-1.48-1.43 2.05-.3z" fill="#ff8a3c" />
            </svg>
            Certificate earned
          </div>
          {/* recommended mission card */}
          <div style={{ position: "absolute", left: 40, bottom: 28, width: 250, background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 48px -22px rgba(24,32,59,.5)", animation: "floaty 6s ease-in-out infinite" }}>
            <div style={{ height: 70, background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }}>
              <span style={{ position: "absolute", top: 8, left: 9, background: "rgba(255,255,255,.92)", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" stroke="#f1543f" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.4" fill="#f1543f" />
                </svg>
                1.2 mi · Weekend
              </span>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
                <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="#fff" />
                <path d="M2.4 10.6h19.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Saturday Food Bank Sort</div>
              <div style={{ fontSize: 11.5, color: "#9aa3bd", margin: "2px 0 0" }}>Sat 9 AM · 6 spots left</div>
            </div>
          </div>
          {/* new friend chip */}
          <div style={{ position: "absolute", right: 34, bottom: 60, background: "#18203b", color: "#fff", borderRadius: 14, padding: "9px 13px", boxShadow: "0 20px 40px -22px rgba(24,32,59,.6)", animation: "floaty2 6.8s ease-in-out infinite", fontSize: 12.5, fontWeight: 700 }}>🎉 New friend made</div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* SECTION 1 · WHY VOLUNTEER */}
        <div style={{ padding: "60px 36px 20px", textAlign: "center" }}>
          <div style={kicker}>WHY VOLUNTEER</div>
          <h2 style={{ ...h2, margin: "8px auto 8px", maxWidth: 620, textWrap: "balance" } as React.CSSProperties}>
            Volunteering should feel meaningful, not complicated.
          </h2>
          <p style={{ fontSize: 16, color: "#5a6685", margin: "0 auto 36px", maxWidth: 540 }}>
            Find something useful to do, meet people who care about the same things, and help locally — on your schedule.
          </p>
          <Coverflow items={WHY.map((w) => ({ e: w.e, t: w.t, desc: w.d }))} icons={WHY_ICONS} />
        </div>

        {/* SECTION 2 · PERKS */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={kicker}>PERKS &amp; COMPENSATION</div>
            <h2 style={{ ...h2, margin: "8px 0 8px" }}>Volunteer first. Perks when available.</h2>
            <p style={{ fontSize: 15.5, color: "#5a6685", margin: "0 auto", maxWidth: 620, lineHeight: 1.55 }}>
              Most missions are unpaid. Some organizers offer extras — and when a mission includes perks or compensation, it&apos;s always shown clearly before you join.
            </p>
          </div>
          <DiscoverGrid items={PERKS.map((p) => ({ e: p.e, t: p.t, desc: p.back, note: p.note }))} icons={PERK_ICONS} />
          <div style={{ marginTop: 16, background: "#fff0ec", borderRadius: 14, padding: "14px 18px", fontSize: 13.5, color: "#b4452f", textAlign: "center" }}>
            Payment is optional and depends entirely on each organizer — NeighborLoop never promises compensation.
          </div>
        </div>

        {/* SECTION 3 · WHAT YOU CAN JOIN */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={kicker}>WHAT YOU CAN JOIN</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>Choose missions that match your vibe.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }} className="detail-split">
            {JOIN.map((c) => (
              <div key={c.t} className="hiw-card" style={{ background: "#fff", border: "1px solid rgba(24,32,59,.07)", borderRadius: 18, padding: 18, display: "flex", gap: 14 }}>
                <span className="hiw-tile" style={coralTile}>{JOIN_ICONS[c.t] ?? c.e}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15.5 }}>{c.t}</div>
                  <div style={{ fontSize: 13, color: "#5a6685", lineHeight: 1.45, marginTop: 3 }}>{c.q}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="chip-marquee-wrap" style={{ marginTop: 18 }}>
            <div className="chip-marquee">
              {[...JOIN_CHIPS, ...JOIN_CHIPS].map((c, i) => (
                <span key={i} style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, background: "#f1f3f8", color: "#5a6685", padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4 · REQUIRED */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={kicker}>WHAT&apos;S REQUIRED</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>What you need to start</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }} className="org-required">
            <div style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 20, padding: 26 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px 22px" }}>
                {REQUIRED.map((r) => (
                  <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: "#3a425e" }}>{checkPath} {r}</div>
                ))}
              </div>
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(24,32,59,.07)", fontSize: 14, color: "#5a6685", lineHeight: 1.6 }}>
                You don&apos;t need to be an expert. Many missions are beginner-friendly and only require your time, attention and willingness to help.
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg,#e6f1ff,#dbeafe)", borderRadius: 20, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="#3a8bf0" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3.1" stroke="#3a8bf0" strokeWidth="1.8" />
                  </svg>
                </span>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Before you join</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13.5, color: "#3a4d6b" }}>
                {BEFORE_YOU_JOIN.map((s) => (
                  <div key={s} style={{ display: "flex", gap: 9 }}><span style={{ color: "#3a8bf0" }}>•</span> {s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 · HOW IT WORKS */}
        <div style={{ padding: "54px 36px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={kicker}>HOW IT WORKS</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>Start helping in minutes.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="card-grid-4">
            {HOW.map((c) => (
              <div key={c.n} className="hiw-card" style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 20, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="hiw-tile" style={coralTile}>{HOW_ICONS[c.t] ?? c.e}</span>
                  <span
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {c.n}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, margin: "14px 0 5px" }}>{c.t}</div>
                <div style={{ fontSize: 13.5, color: "#5a6685", lineHeight: 1.5 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6 · VOLUNTEER MATCH PREVIEW */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={kicker}>VOLUNTEER MATCH</div>
            <h2 style={{ ...h2, margin: "8px 0 6px" }}>Find missions that fit your life.</h2>
            <p style={{ fontSize: 15.5, color: "#5a6685", margin: 0 }}>Pick what matters — we&apos;ll surface your best matches.</p>
          </div>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }} className="detail-split">
            {/* filters */}
            <div style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.07)", borderRadius: 20, padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Your filters</div>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {FILTERS.map((f) => {
                  const on = selected.includes(f.label);
                  return (
                    <span
                      key={f.label}
                      onClick={() => toggle(f.label)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 999, cursor: "pointer", transition: ".15s",
                        background: on ? "#fff0ec" : "#f1f3f8",
                        color: on ? "#f1543f" : "#5a6685",
                        border: `1px solid ${on ? "rgba(255,111,94,.4)" : "transparent"}`,
                      }}
                    >
                      {on ? FILTER_CHECK : FILTER_ICONS[f.label]} {f.label}
                    </span>
                  );
                })}
              </div>
            </div>
            {/* best match card */}
            <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.07)", borderRadius: 20, padding: 6, boxShadow: "0 26px 50px -34px rgba(24,32,59,.5)" }}>
              <div style={{ background: "linear-gradient(135deg,#fff0ec,#ffe3da)", borderRadius: 16, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#f1543f", letterSpacing: ".05em" }}>★ BEST MATCH</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", background: "#1fae82", padding: "5px 13px", borderRadius: 99 }}>94% match</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <span style={{ width: 54, height: 54, borderRadius: 15, background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
                      <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="#fff" />
                      <path d="M2.4 10.6h19.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>Saturday Food Bank Sort</div>
                    <div style={{ fontSize: 12.5, color: "#5a6685" }}>2.1 mi · Beginner-friendly · 3 hrs · Certificate</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "16px 14px 12px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#9aa3bd", marginBottom: 10 }}>WHY IT MATCHES</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, color: "#3a425e" }}>
                  {WHY_MATCHES.map((w) => (
                    <div key={w} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <circle cx="8" cy="8" r="8" fill="#1fae82" />
                        <path d="M4.6 8.2l2.1 2.1 4.7-4.7" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {w}
                    </div>
                  ))}
                </div>
                <div className="btn-coral" style={{ marginTop: 14, color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 14, padding: 11, borderRadius: 12, cursor: "pointer" }}>Join this mission</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7 · SOCIAL */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={kicker}>SOCIAL</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>Don&apos;t volunteer alone — unless you want to.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="card-grid-4">
            {SOCIAL.map((c) => (
              <div key={c.t} className="hiw-card" style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: 22 }}>
                <span className="hiw-tile" style={coralTile}>{SOCIAL_ICONS[c.t] ?? c.e}</span>
                <div style={{ fontWeight: 700, fontSize: 15.5, margin: "13px 0 4px" }}>{c.t}</div>
                <div style={{ fontSize: 13, color: "#5a6685", lineHeight: 1.5 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 8 · PERSONAL GROWTH / IMPACT PROFILE */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 26, alignItems: "center" }} className="detail-split">
            <div>
              <div style={kicker}>PERSONAL GROWTH</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", margin: "8px 0 14px" }}>Build a story you can be proud of.</h2>
              <p style={{ fontSize: 15, color: "#5a6685", lineHeight: 1.6, margin: "0 0 18px" }}>
                Your NeighborLoop profile helps you remember what you did, where you helped and the impact you created.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {GROWTH_TAGS.map((t) => (
                  <span key={t} style={{ fontSize: 12.5, fontWeight: 600, background: "#f1f3f8", color: "#5a6685", padding: "7px 13px", borderRadius: 999 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.07)", borderRadius: 20, padding: 24, boxShadow: "0 26px 50px -34px rgba(24,32,59,.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
                <span style={{ width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg,#bca6ff,#7a6bf5)" }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>Maya&apos;s impact profile</div>
                  <div style={{ fontSize: 12.5, color: "#9aa3bd" }}>Volunteering since 2024</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {GROWTH_STATS.map((s) => (
                  <div key={s.l} style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: 15 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 12.5, color: "#9aa3bd" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 9 · SAFETY */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={kicker}>SAFETY &amp; TRUST</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>Feel confident before you show up.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="card-grid-3">
            {SAFETY.map((c) => (
              <div key={c.t} className="hiw-card" style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: 20, display: "flex", alignItems: "center", gap: 13 }}>
                {checkPath}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.t}</div>
                  <div style={{ fontSize: 13, color: "#5a6685", lineHeight: 1.5, marginTop: 3 }}>{c.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 10 · FAQ */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={kicker}>COMMON QUESTIONS</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>Everything you&apos;re wondering.</h2>
          </div>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 11 }}>
            {FAQ.map(([q, a], i) => {
              const open = faqOpen === i;
              return (
                <div
                  key={q}
                  onClick={() => setFaqOpen(open ? -1 : i)}
                  style={{ background: "#fff", border: `1px solid ${open ? "rgba(255,111,94,.4)" : "rgba(24,32,59,.08)"}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", transition: ".2s" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                    <span style={{ fontWeight: 700, fontSize: 15.5, color: "#18203b" }}>{q}</span>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: "#fff0ec", color: "#f1543f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, flexShrink: 0 }}>{open ? "−" : "+"}</span>
                  </div>
                  {open && <div style={{ fontSize: 14, color: "#5a6685", lineHeight: 1.6, marginTop: 12 }}>{a}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 11 · FINAL CTA */}
        <div style={{ margin: "40px 28px 48px", borderRadius: 24, background: "linear-gradient(120deg,#ff8a5c,#ff5e7a)", padding: "56px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,.16)", top: -90, left: -40, animation: "blob 14s ease-in-out infinite" }} />
          <span style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.12)", bottom: -100, right: 50, animation: "blob 18s ease-in-out infinite" }} />
          <h2 style={{ position: "relative", color: "#fff", fontSize: 38, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-.02em" }}>Your first mission could start this week.</h2>
          <p style={{ position: "relative", color: "rgba(255,255,255,.92)", fontSize: 16.5, margin: "0 auto 26px", maxWidth: 560, lineHeight: 1.55 }}>
            Find a cause nearby, bring a friend, earn hours, meet people, or simply do something good with the time you already have.
          </p>
          <div style={{ position: "relative", display: "flex", gap: 13, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ background: "#fff", color: "#f1543f", fontWeight: 700, fontSize: 16, padding: "15px 28px", borderRadius: 14, cursor: "pointer" }}>Explore Missions</span>
            <span style={{ background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.5)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "15px 28px", borderRadius: 14, cursor: "pointer" }}>Create Free Profile</span>
          </div>
          <div style={{ position: "relative", color: "rgba(255,255,255,.9)", fontSize: 14, fontWeight: 600, marginTop: 20 }}>Start small. Show up once. See what changes.</div>
        </div>
      </div>
      </div>

      <SiteFooter />
    </div>
  );
}
