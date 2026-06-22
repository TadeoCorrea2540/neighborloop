"use client";

import { useState, useEffect, useRef } from "react";
import PublicNav from "@/components/public-nav";
import SiteFooter from "@/components/site-footer";
import OrganizersMobileExperience from "@/components/organizers/organizers-mobile-experience";
import "./organizers-mobile.css";

// ---- ported from NeighborLoop.dc.html · 04 · FOR ORGANIZERS ----

const WHO_CAN_POST = [
  { e: "🏛️", bg: "#fff0ec", t: "Nonprofits", d: "Food banks, animal shelters, community centers and environmental groups." },
  { e: "🎓", bg: "#fff0ec", t: "Schools & universities", d: "Service hours, tutoring programs, clubs and school events." },
  { e: "🤝", bg: "#fff0ec", t: "Community groups", d: "Neighborhood associations, local clubs, faith groups and mutual aid." },
  { e: "🎒", bg: "#fff0ec", t: "Student clubs", d: "Campus events, donation drives, tutoring and awareness campaigns." },
  { e: "🏪", bg: "#fff0ec", t: "Local businesses", d: "Community service days, cleanup events and donation partnerships." },
  { e: "💛", bg: "#fff0ec", t: "Families & individuals", d: "Support a neighbor, a medical fundraiser, a meal train or a donation drive." },
];

const whoStroke = { stroke: "#fff", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const WHO_ICONS: Record<string, React.ReactNode> = {
  "Nonprofits": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...whoStroke}>
        <path d="M3.2 9.3 12 4l8.8 5.3" />
        <path d="M6 11.2v6.3M10 11.2v6.3M14 11.2v6.3M18 11.2v6.3" />
        <path d="M3.6 20h16.8" />
      </g>
    </svg>
  ),
  "Schools & universities": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...whoStroke}>
        <path d="M12 4.5 2.5 9 12 13.5 21.5 9z" />
        <path d="M6.5 11v4.4c0 1 2.5 2.3 5.5 2.3s5.5-1.3 5.5-2.3V11" />
        <path d="M21.5 9v4.2" />
      </g>
    </svg>
  ),
  "Community groups": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...whoStroke}>
        <circle cx="9" cy="8.8" r="2.7" />
        <path d="M3.8 18.5c0-3 2.4-5.2 5.2-5.2s5.2 2.2 5.2 5.2" />
        <circle cx="16.6" cy="9.6" r="2.1" />
        <path d="M15.4 13.5c2.5-.3 4.8 1.9 4.8 5" />
      </g>
    </svg>
  ),
  "Student clubs": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...whoStroke}>
        <path d="M6.6 9.6a5.4 5.4 0 0 1 10.8 0v7.8a1.6 1.6 0 0 1-1.6 1.6H8.2a1.6 1.6 0 0 1-1.6-1.6z" />
        <path d="M9.5 9.6a2.5 2.5 0 0 1 5 0" />
        <path d="M9 13.6h6" />
      </g>
    </svg>
  ),
  "Local businesses": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...whoStroke}>
        <path d="M5 9.6V19h14V9.6" />
        <path d="M3.5 9.6 5 5h14l1.5 4.6z" />
        <path d="M10 19v-4.6h4V19" />
      </g>
    </svg>
  ),
  "Families & individuals": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g {...whoStroke}>
        <path d="M12 19.5 4.9 12.6a4.3 4.3 0 0 1 6.1-6l1 1 1-1a4.3 4.3 0 0 1 6.1 6z" />
      </g>
    </svg>
  ),
};

const WHAT_YOU_CAN_POST = [
  { e: "🍲", g: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", t: "Food drive", q: "“Help sort groceries for 80 local families.”" },
  { e: "📚", g: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", t: "Tutoring", q: "“Support children with reading after school.”" },
  { e: "🐾", g: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", t: "Animal rescue", q: "“Walk rescued dogs and prep adoption kits.”" },
  { e: "🌊", g: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", t: "Beach & park cleanups", q: "“Clear two miles of shoreline before summer.”" },
  { e: "🌱", g: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", t: "Community gardens", q: "“Plant 200 seedlings for the neighborhood plot.”" },
  { e: "👵", g: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", t: "Elderly support", q: "“Visit and share a meal with local seniors.”" },
];

const WHAT_ICONS: Record<string, React.ReactNode> = {
  "Food drive": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
      <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="#fff" />
      <path d="M2.4 10.6h19.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  ),
  "Tutoring": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7.5C10.4 6.2 8 5.7 5 6.1v11.4c3-.4 5.4.1 7 1.4 1.6-1.3 4-1.8 7-1.4V6.1c-3-.4-5.4.1-7 1.4z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7.5v11.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  "Animal rescue": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="9.7" rx="1.6" ry="2" fill="#fff" />
      <ellipse cx="12" cy="8.4" rx="1.7" ry="2.1" fill="#fff" />
      <ellipse cx="16" cy="9.7" rx="1.6" ry="2" fill="#fff" />
      <path d="M12 11.2c2.4 0 4.3 1.7 4.3 3.8 0 1.5-1.2 2.4-2.6 2.4-.8 0-1.1-.4-1.7-.4s-.9.4-1.7.4c-1.4 0-2.6-.9-2.6-2.4 0-2.1 1.9-3.8 4.3-3.8z" fill="#fff" />
    </svg>
  ),
  "Beach & park cleanups": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 13.6c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 17.7c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  "Community gardens": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20.5v-7.5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 13C9.2 13 6.8 11 6.3 7.6c3.4-.5 5.7 1.4 5.7 5.4z" fill="#fff" />
      <path d="M12.4 15c2.8 0 5.2-2 5.7-5.4-3.4-.5-5.7 1.4-5.7 5.4z" fill="#fff" />
      <path d="M8 20.5h8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  "Elderly support": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8 10.8 6.9a1.85 1.85 0 0 0-2.6 2.6L12 13.3l3.8-3.8a1.85 1.85 0 0 0-2.6-2.6z" fill="#fff" />
      <path d="M4.8 14.6c1.8 2.1 4.5 3.6 7.2 3.6s5.4-1.5 7.2-3.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
};

const MORE_CHIPS = [
  "School events", "Donation sorting", "Emergency support", "Local fundraisers",
  "Mentorship", "Health awareness", "Clothing drives", "Cultural events",
];

const REQUIRED = [
  { t: "A clear mission title", ok: true },
  { t: "Number of volunteers needed", ok: true },
  { t: "A short description of the help", ok: true },
  { t: "Basic safety notes", ok: true },
  { t: "Date and time", ok: true },
  { t: "A contact person", ok: true },
  { t: "Location or online option", ok: true },
  { t: "Cover image", ok: false, opt: true },
];

const HOW_IT_WORKS = [
  { e: "📝", bg: "#fff0ec", n: "1", nc: "#ffd0c4", t: "Create your mission", d: "Add the cause, date, location, goal and what volunteers will do." },
  { e: "🔎", bg: "#e6f1ff", n: "2", nc: "#c4ddff", t: "Get discovered", d: "Volunteers find you through search, filters, categories and recommendations." },
  { e: "🙌", bg: "#def3e8", n: "3", nc: "#bde6d2", t: "Manage signups", d: "Review applicants, send updates and keep everyone organized." },
  { e: "📊", bg: "#f0ecff", n: "4", nc: "#d8cdff", t: "Track your impact", d: "Check attendance, count volunteer hours and share your results." },
];

const ln = (c: string) => ({ stroke: c, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" });
const HOW_ICONS: Record<string, React.ReactNode> = {
  "Create your mission": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <path d="M4 20h16" />
        <path d="M15.4 5.2a1.9 1.9 0 0 1 2.7 2.7L9 17l-3.6 1 1-3.6z" />
      </g>
    </svg>
  ),
  "Get discovered": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.6-3.6" />
      </g>
    </svg>
  ),
  "Manage signups": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <circle cx="9" cy="9" r="2.6" />
        <path d="M4 18c0-2.8 2.2-5 5-5s5 2.2 5 5" />
        <circle cx="16.6" cy="9.6" r="2" />
        <path d="M15.4 13.3c2.3-.2 4.4 1.9 4.4 4.7" />
      </g>
    </svg>
  ),
  "Track your impact": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <path d="M4 20h16" />
        <path d="M7 20v-5M12 20v-9M17 20v-7" />
      </g>
    </svg>
  ),
};

const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  "Find the right volunteers": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.4" />
      </g>
      <circle cx="12" cy="12" r="1.4" fill="#fff" />
    </svg>
  ),
  "Stay organized": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <path d="M3.5 7.5a1.5 1.5 0 0 1 1.5-1.5h3.6l2 2h8a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.6A1.5 1.5 0 0 1 3.5 17z" />
      </g>
    </svg>
  ),
  "Build trust": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <path d="M12 3 5 5.6v5.2c0 4.4 3 7.5 7 9.2 4-1.7 7-4.8 7-9.2V5.6z" />
        <path d="M9 11.8l2.1 2.1 4-4.2" />
      </g>
    </svg>
  ),
  "Save time": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <circle cx="12" cy="13.5" r="7.2" />
        <path d="M12 13.5V9.5M12 13.5l3 1.8" />
        <path d="M9.5 3.5h5M12 3.5v2.3" />
      </g>
    </svg>
  ),
  "Show real impact": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12h16" />
        <path d="M12 4c2.6 2.3 2.6 13.7 0 16M12 4c-2.6 2.3-2.6 13.7 0 16" />
      </g>
    </svg>
  ),
  "Grow your community": (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <g {...ln("#fff")}>
        <path d="M12 20v-7" />
        <path d="M12 13C9.3 13 7 11 6.5 7.8c3.2-.5 5.5 1.4 5.5 5.2z" />
        <path d="M12.3 15c2.7 0 5-2 5.5-5.2-3.2-.5-5.5 1.4-5.5 5.2z" />
        <path d="M8.5 20h7" />
      </g>
    </svg>
  ),
};

const BENEFITS = [
  { e: "🎯", bg: "#fff0ec", t: "Find the right volunteers", d: "Reach people who already care about your cause." },
  { e: "🗂️", bg: "#e6f1ff", t: "Stay organized", d: "Replace scattered messages, spreadsheets and last-minute confusion." },
  { e: "🤝", bg: "#def3e8", t: "Build trust", d: "Show your mission clearly with details, updates and organizer info." },
  { e: "⏱️", bg: "#fff3da", t: "Save time", d: "Manage signups, attendance and communication from one place." },
  { e: "🌍", bg: "#f0ecff", t: "Show real impact", d: "Track hours, volunteers and outcomes after every mission." },
  { e: "🌱", bg: "#ffe9ef", t: "Grow your community", d: "Turn one-time helpers into long-term supporters." },
];

const ORG_TABS: OrgTab[] = ["Details", "Volunteers", "Impact", "Publish"];

const FAQ: [string, string][] = [
  ["Do I need to be a registered nonprofit?", "No. Nonprofits, schools, clubs, community groups, families and individuals can all post missions — as long as the campaign is safe, honest and community-focused."],
  ["Can a family or individual ask for help?", "Yes. Families and individuals can post community-support campaigns when they need help organizing volunteers, donations or local support."],
  ["What kind of missions are not allowed?", "Anything unsafe, misleading, discriminatory, exploitative, spammy, or unrelated to community help. We review missions to keep volunteering respectful and safe."],
  ["Do volunteers get paid?", "NeighborLoop is built for volunteer-based support. If a mission includes any compensation, that must be stated clearly up front."],
  ["Can I manage applications?", "Yes. Organizers review interested volunteers, approve participants, message everyone, and send updates from one place."],
  ["Can I track volunteer hours?", "Yes. Check people in on the day, count hours automatically, and share impact results after every mission."],
  ["Does NeighborLoop verify organizers?", "Some organizers or higher-risk missions may need verification before publishing — it protects everyone and builds trust with volunteers."],
];

const PREVIEW_VOLUNTEERS = [
  { name: "Maya Rivera", meta: "126 hrs · 4.9★", g: "linear-gradient(135deg,#bca6ff,#7a6bf5)" },
  { name: "Leo Tanaka", meta: "48 hrs · 4.7★", g: "linear-gradient(135deg,#8bc0ff,#3a8bf0)" },
  { name: "Priya Shah", meta: "New volunteer", g: "linear-gradient(135deg,#ffb09a,#ff7a5c)" },
];

type OrgTab = "Details" | "Volunteers" | "Impact" | "Publish";

const kicker: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#f1543f", letterSpacing: ".08em" };
const h2: React.CSSProperties = { fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" };

function WhoCanPostGrid() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % WHO_CAN_POST.length), 2200);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div onMouseLeave={() => setPaused(false)}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, textAlign: "left" }} className="card-grid-3">
        {WHO_CAN_POST.map((c, i) => {
          const on = i === active;
          return (
            <div
              key={c.t}
              onMouseEnter={() => { setActive(i); setPaused(true); }}
              className="hiw-card"
              style={{
                position: "relative",
                overflow: "hidden",
                background: on ? "linear-gradient(180deg,#ffffff,#fff5f1)" : "#fbfcfe",
                border: `1px solid ${on ? "rgba(255,111,94,.45)" : "rgba(24,32,59,.06)"}`,
                borderRadius: 20,
                padding: 24,
                transform: on ? "translateY(-6px) scale(1.03)" : "none",
                boxShadow: on ? "0 26px 46px -24px rgba(255,111,94,.7)" : "0 1px 0 rgba(0,0,0,0)",
                transition: "transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s, border-color .45s, background .45s",
                zIndex: on ? 2 : 1,
              }}
            >
              <span
                className="hiw-tile"
                style={{
                  width: 48, height: 48, borderRadius: 13,
                  background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transform: on ? "scale(1.12) rotate(-4deg)" : "none",
                  boxShadow: on ? "0 12px 22px -8px rgba(255,111,94,.85)" : "none",
                  transition: "transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s",
                }}
              >
                {WHO_ICONS[c.t] ?? c.e}
              </span>
              <div style={{ fontWeight: 700, fontSize: 17, margin: "15px 0 5px" }}>{c.t}</div>
              <div style={{ fontSize: 14, color: "#5a6685", lineHeight: 1.5 }}>{c.d}</div>
              <span
                style={{
                  position: "absolute", left: 0, bottom: 0, height: 3, width: "100%",
                  transformOrigin: "left",
                  transform: on && !paused ? "scaleX(1)" : "scaleX(0)",
                  transition: on && !paused ? "transform 2.2s linear" : "transform .2s",
                  background: "linear-gradient(90deg,#ff8a5c,#ff5e7a)",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22 }}>
        {WHO_CAN_POST.map((c, i) => (
          <button
            key={c.t}
            onClick={() => { setActive(i); setPaused(true); }}
            aria-label={c.t}
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

function TiltCard({ c }: { c: { e: string; bg: string; t: string; d: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tf, setTf] = useState("rotateX(0deg) rotateY(0deg)");
  const [glow, setGlow] = useState({ o: 0, x: "50%", y: "50%" });
  const [active, setActive] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTf(`rotateX(${(0.5 - py) * 14}deg) rotateY(${(px - 0.5) * 14}deg) translateY(-6px) scale(1.03)`);
    setGlow({ o: 1, x: `${px * 100}%`, y: `${py * 100}%` });
    setActive(true);
  };
  const onLeave = () => {
    setTf("rotateX(0deg) rotateY(0deg)");
    setGlow((g) => ({ ...g, o: 0 }));
    setActive(false);
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ perspective: 850 }}>
      <div
        className="hiw-card"
        style={{
          position: "relative",
          background: "#fff",
          border: `1px solid ${active ? "rgba(255,111,94,.4)" : "rgba(24,32,59,.07)"}`,
          borderRadius: 18,
          padding: 22,
          transform: tf,
          transformStyle: "preserve-3d",
          transition: "transform .2s cubic-bezier(.2,.8,.2,1), box-shadow .25s, border-color .25s",
          boxShadow: active ? "0 32px 54px -26px rgba(255,111,94,.6)" : "0 1px 0 rgba(0,0,0,0)",
          willChange: "transform",
        }}
      >
        <span
          style={{
            position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
            background: `radial-gradient(240px circle at ${glow.x} ${glow.y}, rgba(255,138,92,.20), transparent 62%)`,
            opacity: glow.o, transition: "opacity .25s",
          }}
        />
        <span
          className="hiw-tile"
          style={{
            width: 48, height: 48, borderRadius: 13, background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transform: active ? "translateZ(38px)" : "translateZ(0)",
            boxShadow: active ? "0 14px 22px -8px rgba(255,111,94,.7)" : "none",
            transition: "transform .2s cubic-bezier(.2,.8,.2,1), box-shadow .25s",
          }}
        >
          {BENEFIT_ICONS[c.t] ?? c.e}
        </span>
        <div style={{ fontWeight: 700, fontSize: 16, margin: "13px 0 4px", transform: active ? "translateZ(24px)" : "translateZ(0)", transition: "transform .2s" }}>{c.t}</div>
        <div style={{ fontSize: 13.5, color: "#5a6685", lineHeight: 1.5, transform: active ? "translateZ(14px)" : "translateZ(0)", transition: "transform .2s" }}>{c.d}</div>
      </div>
    </div>
  );
}

export default function ForOrganizers() {
  const [orgTab, setOrgTab] = useState<OrgTab>("Details");
  const [faqOpen, setFaqOpen] = useState(0);

  return (
    <div className="org-page" style={{ background: "#fff", minHeight: "100vh" }}>
      <PublicNav />
      <OrganizersMobileExperience />

      <div className="org-desktop-only">
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
            "linear-gradient(105deg, rgba(20,26,46,.66) 0%, rgba(20,26,46,.34) 50%, rgba(20,26,46,.12) 100%), url('/community.png')",
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
            Free to start · no setup needed
          </span>
          <h1 style={{ fontSize: 50, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-.03em", margin: "20px 0 0", color: "#fff", textShadow: "0 2px 18px rgba(8,12,28,.45)" }}>
            Start a mission. Rally your community.
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,.92)", lineHeight: 1.7, margin: "20px 0 30px", maxWidth: 500, textShadow: "0 1px 10px rgba(8,12,28,.4)" }}>
            NeighborLoop helps{" "}
            <span
              style={{
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(135deg,rgba(255,138,92,.55),rgba(255,94,122,.55))",
                boxShadow: "0 0 0 1px rgba(255,255,255,.35)",
                padding: "2px 5px",
                borderRadius: 7,
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
                textShadow: "none",
                lineHeight: 2,
              }}
            >
              local businesses, organizations, nonprofits, schools, local groups, families, and everyday people
            </span>{" "}
            find volunteers for meaningful causes—without complicated tools, spreadsheets, or group chats.
          </p>
          <div style={{ display: "flex", gap: 13, marginBottom: 24 }}>
            <span className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 16, padding: "15px 26px", borderRadius: 14, boxShadow: "0 16px 30px -12px rgba(255,111,94,.85)", cursor: "pointer" }}>
              Post a Mission →
            </span>
            <span style={{ background: "#fff", border: "1px solid rgba(24,32,59,.12)", color: "#18203b", fontWeight: 700, fontSize: 16, padding: "15px 26px", borderRadius: 14, cursor: "pointer" }}>
              See How It Works
            </span>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {["Free to start", "Built for local communities", "No technical setup"].map((c) => (
              <span key={c} style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid rgba(24,32,59,.08)", fontSize: 13, fontWeight: 600, color: "#5a6685", padding: "8px 13px", borderRadius: 11 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="8" fill="#1fae82" />
                  <path d="M4.6 8.2l2.1 2.1 4.7-4.7" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* hero visual: mission creation mockup */}
        <div style={{ position: "relative", zIndex: 2, minHeight: 440 }} className="org-hero-art">
          {/* creation card */}
          <div style={{ position: "absolute", left: 30, top: 40, width: 300, background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 30px 56px -26px rgba(24,32,59,.5)", animation: "floaty 7s ease-in-out infinite" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
                  <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="#fff" />
                  <path d="M2.4 10.6h19.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>New mission</div>
                <div style={{ fontSize: 11.5, color: "#9aa3bd" }}>Draft · auto-saved ✓</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#9aa3bd", fontWeight: 600, marginBottom: 5 }}>TITLE</div>
            <div style={{ border: "1px solid rgba(24,32,59,.1)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, fontWeight: 600, marginBottom: 11 }}>Weekend Food Box Packing</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 13 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#9aa3bd", fontWeight: 600, marginBottom: 5 }}>DATE</div>
                <div style={{ border: "1px solid rgba(24,32,59,.1)", borderRadius: 10, padding: "9px 11px", fontSize: 12.5, fontWeight: 600 }}>Sat, 10 AM</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#9aa3bd", fontWeight: 600, marginBottom: 5 }}>SPOTS</div>
                <div style={{ border: "1px solid rgba(24,32,59,.1)", borderRadius: 10, padding: "9px 11px", fontSize: 12.5, fontWeight: 600 }}>20</div>
              </div>
            </div>
            <div style={{ background: "#ff6f5e", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 11 }}>Publish mission</div>
          </div>
          {/* floating tags */}
          <div style={{ position: "absolute", right: 14, top: 34, background: "#fff", borderRadius: 14, padding: "10px 14px", boxShadow: "0 20px 40px -22px rgba(24,32,59,.45)", animation: "floaty2 8s ease-in-out infinite", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1fae82" }} />12 volunteers joined
          </div>
          <div style={{ position: "absolute", right: 36, top: 150, background: "#fff", borderRadius: 14, padding: "9px 13px", boxShadow: "0 20px 40px -22px rgba(24,32,59,.45)", animation: "floaty 6.5s ease-in-out infinite", fontSize: 12.5, fontWeight: 700, color: "#f1543f" }}>Food Drive</div>
          <div style={{ position: "absolute", right: 18, bottom: 120, background: "#fff", borderRadius: 14, padding: "9px 13px", boxShadow: "0 20px 40px -22px rgba(24,32,59,.45)", animation: "floaty2 7.5s ease-in-out infinite", fontSize: 12.5, fontWeight: 700, color: "#1fae82", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="8" fill="#1fae82" />
              <path d="M4.6 8.2l2.1 2.1 4.7-4.7" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verified organizer
          </div>
          {/* impact chip */}
          <div style={{ position: "absolute", left: 48, bottom: 30, background: "#fff", borderRadius: 16, padding: "14px 18px", boxShadow: "0 24px 44px -22px rgba(24,32,59,.45)", animation: "floaty 6s ease-in-out infinite" }}>
            <div style={{ fontSize: 11.5, color: "#9aa3bd", fontWeight: 600 }}>Estimated impact</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#f1543f", lineHeight: 1.1 }}>120 families</div>
            <div style={{ fontSize: 11.5, color: "#5a6685" }}>⏱️ 3 hours saved organizing</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* SECTION 1 · WHO CAN POST */}
        <div style={{ padding: "60px 36px 20px", textAlign: "center" }}>
          <div style={kicker}>WHO CAN POST</div>
          <h2 style={{ ...h2, margin: "8px auto 8px", maxWidth: 640, textWrap: "balance" } as React.CSSProperties}>
            You don&apos;t need to be a big organization to make an impact.
          </h2>
          <p style={{ fontSize: 16, color: "#5a6685", margin: "0 auto 36px", maxWidth: 560 }}>
            If you&apos;re organizing something that helps people, animals, education or the community — you can start here.
          </p>
          <WhoCanPostGrid />
        </div>

        {/* SECTION 2 · WHAT YOU CAN POST */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={kicker}>WHAT YOU CAN POST</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>Post missions that bring people together.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="card-grid-3">
            {WHAT_YOU_CAN_POST.map((c) => (
              <div key={c.t} className="hiw-card" style={{ background: "#fff", border: "1px solid rgba(24,32,59,.07)", borderRadius: 18, padding: 18, display: "flex", gap: 14 }}>
                <span className="hiw-tile" style={{ width: 48, height: 48, borderRadius: 13, background: c.g, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{WHAT_ICONS[c.t] ?? c.e}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15.5 }}>{c.t}</div>
                  <div style={{ fontSize: 13, color: "#5a6685", lineHeight: 1.45, marginTop: 3 }}>{c.q}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="chip-marquee-wrap" style={{ marginTop: 18 }}>
            <div className="chip-marquee">
              {[...MORE_CHIPS, ...MORE_CHIPS].map((c, i) => (
                <span key={i} style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, background: "#f1f3f8", color: "#5a6685", padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3 · WHAT IS REQUIRED */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={kicker}>WHAT&apos;S REQUIRED</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>What you need to create a mission</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }} className="org-required">
            <div style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 20, padding: 26 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px 22px" }}>
                {REQUIRED.map((r) => (
                  <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: r.ok ? "#3a425e" : "#9aa3bd" }}>
                    {r.ok ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <circle cx="8" cy="8" r="8" fill="#1fae82" />
                        <path d="M4.6 8.2l2.1 2.1 4.7-4.7" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span style={{ color: "#c2c9d8" }}>○</span>
                    )}{" "}
                    {r.t}
                    {r.opt && <span style={{ fontSize: 12, color: "#b3bace" }}>(optional)</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(24,32,59,.07)", fontSize: 14, color: "#5a6685", lineHeight: 1.6 }}>
                You don&apos;t need a professional team, a perfect logo or complicated paperwork to start. You only need a clear purpose and enough information for volunteers to understand how they can help.
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg,#fff0ec,#ffe3da)", borderRadius: 20, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3 5 5.6v5.2c0 4.4 3 7.5 7 9.2 4-1.7 7-4.8 7-9.2V5.6z" stroke="#f1543f" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 11.8l2.1 2.1 4-4.2" stroke="#f1543f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Safety &amp; trust</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13.5, color: "#4a5475" }}>
                {[
                  "Some missions may require verification before publishing",
                  "Organizations can be reviewed for credibility",
                  "We keep opportunities clear, respectful and safe",
                  "Sensitive or high-risk campaigns may need extra details",
                ].map((s) => (
                  <div key={s} style={{ display: "flex", gap: 9 }}><span style={{ color: "#f1543f" }}>•</span> {s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 · HOW IT WORKS */}
        <div style={{ padding: "54px 36px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={kicker}>HOW IT WORKS</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>From idea to volunteers in minutes.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, position: "relative" }} className="card-grid-4">
            {HOW_IT_WORKS.map((c) => (
              <div key={c.n} className="hiw-card" style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 20, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="hiw-tile" style={{ width: 48, height: 48, borderRadius: 13, background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{HOW_ICONS[c.t] ?? c.e}</span>
                  <span
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      ...(c.n === "1"
                        ? { color: c.nc }
                        : {
                            background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                          }),
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

        {/* SECTION 5 · BENEFITS */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={kicker}>WHY ORGANIZERS LOVE IT</div>
            <h2 style={{ ...h2, margin: "8px 0 0" }}>Less organizing. More impact.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="card-grid-3">
            {BENEFITS.map((c) => (
              <TiltCard key={c.t} c={c} />
            ))}
          </div>
        </div>

        {/* SECTION 6 · MISSION LAUNCH PREVIEW */}
        <div style={{ padding: "54px 36px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={kicker}>MISSION LAUNCH PREVIEW</div>
            <h2 style={{ ...h2, margin: "8px 0 6px" }}>See it before you publish.</h2>
            <p style={{ fontSize: 15.5, color: "#5a6685", margin: 0 }}>A live preview of how your mission comes together.</p>
          </div>
          <div style={{ maxWidth: 760, margin: "0 auto", background: "#fbfcfe", border: "1px solid rgba(24,32,59,.07)", borderRadius: 22, padding: 8, boxShadow: "0 30px 60px -40px rgba(24,32,59,.5)" }}>
            <div style={{ display: "flex", gap: 5, background: "#eef0f5", borderRadius: 15, padding: 5, marginBottom: 8 }}>
              {ORG_TABS.map((label) => {
                const a = orgTab === label;
                return (
                  <span
                    key={label}
                    onClick={() => setOrgTab(label)}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      padding: 11, borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13.5, transition: ".18s",
                      background: a ? "#fff" : "transparent",
                      color: a ? "#f1543f" : "#9aa3bd",
                      boxShadow: a ? "0 6px 16px -8px rgba(24,32,59,.35)" : undefined,
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
            <div style={{ background: "#fff", borderRadius: 17, padding: 24, minHeight: 268 }}>
              {orgTab === "Details" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
                    <span style={{ width: 54, height: 54, borderRadius: 15, background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
                        <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="#fff" />
                        <path d="M2.4 10.6h19.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 19 }}>Weekend Food Box Packing</div>
                      <div style={{ fontSize: 13.5, color: "#9aa3bd" }}>Food security · Helping Hands SF</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14.5, color: "#4a5475", lineHeight: 1.6, margin: "0 0 18px" }}>
                    Help prepare 120 food boxes for families in the neighborhood. We&apos;ll sort, pack and label boxes together — no experience needed, just bring good energy. 💚
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    {[
                      { l: "DATE", v: "Sat, Jul 12 · 10 AM" },
                      { l: "LOCATION", v: "Marina Food Bank" },
                      { l: "SPOTS", v: "26 volunteers" },
                    ].map((d) => (
                      <div key={d.l} style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 13, padding: 13 }}>
                        <div style={{ fontSize: 12, color: "#9aa3bd", fontWeight: 600 }}>{d.l}</div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginTop: 3 }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orgTab === "Volunteers" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>Interested volunteers</div>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1fae82", background: "#dff6ea", padding: "5px 12px", borderRadius: 99 }}>18 interested · 8 spots left</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    {PREVIEW_VOLUNTEERS.map((v) => (
                      <div key={v.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 40, height: 40, borderRadius: 12, background: v.g }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                          <div style={{ fontSize: 12, color: "#9aa3bd" }}>{v.meta}</div>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1fae82", background: "#dff6ea", padding: "5px 11px", borderRadius: 99 }}>Approve</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orgTab === "Impact" && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 16 }}>Projected impact</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13, marginBottom: 18 }}>
                    <div style={{ background: "linear-gradient(135deg,#fff0ec,#ffe3da)", borderRadius: 15, padding: 16 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#f1543f" }}>120</div>
                      <div style={{ fontSize: 12.5, color: "#5a6685" }}>families supported</div>
                    </div>
                    <div style={{ background: "linear-gradient(135deg,#dff6ea,#c8f0dd)", borderRadius: 15, padding: 16 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#1a8c66" }}>78</div>
                      <div style={{ fontSize: 12.5, color: "#5a6685" }}>volunteer hours</div>
                    </div>
                    <div style={{ background: "linear-gradient(135deg,#e6f0fd,#d6e8fc)", borderRadius: 15, padding: 16 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#2360b5" }}>26</div>
                      <div style={{ fontSize: 12.5, color: "#5a6685" }}>people mobilized</div>
                    </div>
                  </div>
                  <div style={{ background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: 14, fontSize: 13.5, color: "#5a6685", lineHeight: 1.5 }}>
                    🌍 Equivalent to roughly <b style={{ color: "#18203b" }}>2,400 meals</b> reaching neighbors who need them this weekend.
                  </div>
                </div>
              )}

              {orgTab === "Publish" && (
                <div style={{ textAlign: "center", padding: "6px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 18 }}>
                    <div style={{ position: "relative", width: 92, height: 92 }}>
                      <svg width="92" height="92" viewBox="0 0 92 92">
                        <circle cx="46" cy="46" r="38" fill="none" stroke="#eef0f5" strokeWidth="11" />
                        <circle cx="46" cy="46" r="38" fill="none" stroke="#1fae82" strokeWidth="11" strokeLinecap="round" strokeDasharray="239" strokeDashoffset="19" transform="rotate(-90 46 46)" />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#1fae82" }}>92%</span>
                        <span style={{ fontSize: 10, color: "#9aa3bd" }}>ready</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 800, fontSize: 17 }}>Publish-ready score</div>
                      <div style={{ fontSize: 13, color: "#5a6685", maxWidth: 230, lineHeight: 1.45, marginTop: 3 }}>Strong title, clear details and a cover image. Add safety notes to reach 100%.</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300, margin: "0 auto 18px", textAlign: "left" }}>
                    <div style={{ display: "flex", gap: 9, fontSize: 13.5, color: "#3a425e" }}><span style={{ color: "#1fae82" }}>✓</span> Title, description &amp; goal</div>
                    <div style={{ display: "flex", gap: 9, fontSize: 13.5, color: "#3a425e" }}><span style={{ color: "#1fae82" }}>✓</span> Date, time &amp; location</div>
                    <div style={{ display: "flex", gap: 9, fontSize: 13.5, color: "#9aa3bd" }}><span style={{ color: "#ff8a3c" }}>!</span> Safety notes recommended</div>
                  </div>
                  <div className="btn-coral" style={{ display: "inline-block", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 30px", borderRadius: 13, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)", cursor: "pointer" }}>🚀 Publish mission</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 7 · FAQ */}
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

        {/* SECTION 8 · FINAL CTA */}
        <div style={{ margin: "40px 28px 48px", borderRadius: 24, background: "linear-gradient(120deg,#ff8a5c,#ff5e7a)", padding: "56px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,.16)", top: -90, left: -40, animation: "blob 14s ease-in-out infinite" }} />
          <span style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.12)", bottom: -100, right: 50, animation: "blob 18s ease-in-out infinite" }} />
          <h2 style={{ position: "relative", color: "#fff", fontSize: 38, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-.02em" }}>Your community is closer than you think.</h2>
          <p style={{ position: "relative", color: "rgba(255,255,255,.92)", fontSize: 16.5, margin: "0 auto 26px", maxWidth: 560, lineHeight: 1.55 }}>
            Whether you&apos;re running a nonprofit event, helping a neighbor, supporting students or organizing a local campaign, NeighborLoop gives you a simple place to bring people together.
          </p>
          <div style={{ position: "relative", display: "flex", gap: 13, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ background: "#fff", color: "#f1543f", fontWeight: 700, fontSize: 16, padding: "15px 28px", borderRadius: 14, cursor: "pointer" }}>Post Your First Mission</span>
            <span style={{ background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.5)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "15px 28px", borderRadius: 14, cursor: "pointer" }}>Explore Volunteer Missions</span>
          </div>
          <div style={{ position: "relative", color: "rgba(255,255,255,.9)", fontSize: 14, fontWeight: 600, marginTop: 20 }}>Start small. Invite a few people. Create real impact.</div>
        </div>
      </div>
      </div>

      <SiteFooter />
    </div>
  );
}
