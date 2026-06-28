"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/public-nav";
import HowItWorks from "@/components/how-it-works";
import SiteFooter from "@/components/site-footer";
import MobileHero from "@/components/home/mobile-hero";
import MobileMissions from "@/components/home/mobile-missions";
import MobileHowItWorks from "@/components/home/mobile-how-it-works";
import MobileImpactBlock from "@/components/home/mobile-impact-block";
import VolunteerOrganizerSplit from "@/components/home/volunteer-organizer-split";
import MobileFinalCTA from "@/components/home/mobile-final-cta";
import MobileStickyCTA from "@/components/home/mobile-sticky-cta";
import {
  CauseKey,
  LIVE,
} from "@/lib/data";
import { ALL_CATEGORY, type UICategory } from "@/lib/categories";
import type { MissionCard } from "@/lib/data/mission-cards";
import ExploreMissionCard from "@/components/explore/explore-mission-card";
import "./home.css";
import "./explore/explore-mission-cards.css";

const fmt = (n: number) => n.toLocaleString();

export default function HomeClient({
  categories,
  missionCards,
}: {
  categories: UICategory[];
  missionCards: MissionCard[];
}) {
  // Mobile missions keep their own mock cause filter (CauseKey).
  const [cause, setCause] = useState<CauseKey>("All");

  // Desktop "Find your cause" chips are driven by live Supabase categories
  // ("All" first), with a mock fallback. Selecting a live category with no
  // mock missions yet shows an honest empty state.
  const chips = [ALL_CATEGORY, ...categories];
  const [selectedKey, setSelectedKey] = useState<string>("all");
  const active = chips.find((c) => c.key === selectedKey) ?? ALL_CATEGORY;
  const featured =
    selectedKey === "all"
      ? missionCards.slice(0, 9)
      : missionCards.filter((c) => c.categorySlug === selectedKey).slice(0, 9);

  const chipBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 15px",
    borderRadius: 999,
    border: "1px solid rgba(24,32,59,.10)",
    background: "#fff",
    color: "var(--muted-1)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: ".18s",
  };

  return (
    <div className="home">
      <PublicNav />
      <MobileStickyCTA />

      {/* ── mobile-first sections ── */}
      <MobileHero />
      <MobileMissions cause={cause} onCauseChange={setCause} cards={missionCards} />
      <MobileHowItWorks />
      <MobileImpactBlock />
      <VolunteerOrganizerSplit />
      <MobileFinalCTA />

      {/* ── desktop hero ── */}
      <section className="home-hero-desktop home-desktop-only">
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.92)", border: "1px solid rgba(255,255,255,.6)", padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, color: "var(--coral-deep)", boxShadow: "0 8px 20px -14px rgba(24,32,59,.4)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--coral-deep)" }} />
            3,194 missions live near you
          </span>
          <h1 style={{ fontSize: 56, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-.03em", margin: "20px 0 0", color: "#fff", textShadow: "0 2px 18px rgba(8,12,28,.45)" }}>
            Turn free time into real-world impact.
          </h1>
          <p style={{ fontSize: 18.5, color: "rgba(255,255,255,.92)", lineHeight: 1.55, margin: "20px 0 30px", maxWidth: 480, textShadow: "0 1px 10px rgba(8,12,28,.4)" }}>
            Discover volunteer missions near you, join in a tap, and watch your real-world impact stack up — hours, people helped, and badges earned.
          </p>
          <div style={{ display: "flex", gap: 13 }}>
            <Link href="/explore" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 16, padding: "15px 26px", borderRadius: 14, boxShadow: "0 16px 30px -12px rgba(255,111,94,.85)" }}>
              Find Missions →
            </Link>
            <Link href="/auth" className="btn-ghost" style={{ background: "rgba(255,255,255,.95)", border: "1px solid rgba(255,255,255,.7)", color: "var(--ink)", fontWeight: 700, fontSize: 16, padding: "15px 26px", borderRadius: 14 }}>
              Register Organization
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28 }}>
            <div style={{ display: "flex" }}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: i % 2 === 0 ? "linear-gradient(135deg,#ffb09a,#ff7a5c)" : "#c8cdd8", border: "2.5px solid #fff", marginLeft: i === 0 ? 0 : -12 }} />
              ))}
            </div>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,.88)" }}>
              <b style={{ color: "#fff" }}>12,480 neighbors</b> already volunteering
            </span>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, minHeight: 420 }} className="hero-visual">
          <div style={{ position: "absolute", right: 18, top: 30, background: "#fff", borderRadius: 18, padding: 14, width: 210, boxShadow: "0 24px 44px -20px rgba(24,32,59,.4)", animation: "floaty 7s ease-in-out infinite" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
                  <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="#fff" />
                  <path d="M2.4 10.6h19.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Food Bank Sort</div>
                <div style={{ fontSize: 12, color: "var(--muted-3)" }}>Sat · 6 spots left</div>
              </div>
            </div>
            <div style={{ marginTop: 11, height: 6, borderRadius: 99, background: "var(--bg-chip)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: "70%", borderRadius: 99, background: "linear-gradient(90deg,#ff8a5c,#ff5e7a)" }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 24, bottom: 24, background: "#fff", borderRadius: 18, padding: "15px 18px", boxShadow: "0 24px 44px -20px rgba(24,32,59,.4)", animation: "floaty2 8s ease-in-out infinite" }}>
            <div style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600 }}>Your impact</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--coral-deep)", lineHeight: 1.1 }}>126 hrs</div>
            <div style={{ fontSize: 12, color: "var(--muted-1)" }}>540 people helped</div>
          </div>
          <div style={{ position: "absolute", right: 40, bottom: 60, width: 62, height: 62, borderRadius: "50%", background: "linear-gradient(140deg,#ff8a6b,#ff5e7a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 34px -14px rgba(255,94,122,.75), inset 0 1px 0 rgba(255,255,255,.4)", animation: "floaty 5.5s ease-in-out infinite" }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="rosetteStar" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ff8a6b" />
                  <stop offset="1" stopColor="#ff5e7a" />
                </linearGradient>
              </defs>
              <path d="M18.5 27h5.5v18l-2.75-3.4L18.5 45z" fill="#fff" opacity="0.92" />
              <path d="M24 27h5.5v18l-2.75-3.4L24 45z" fill="#fff" opacity="0.78" />
              <circle cx="24" cy="19.5" r="13" fill="#fff" />
              <circle cx="24" cy="19.5" r="9.6" fill="none" stroke="url(#rosetteStar)" strokeWidth="1.4" opacity="0.4" />
              <path d="M24 12.4l2.25 4.56 5.03.73-3.64 3.55.86 5.01L24 23.9l-4.5 2.36.86-5.01-3.64-3.55 5.03-.73z" fill="url(#rosetteStar)" />
            </svg>
          </div>
        </div>
      </section>

      {/* live counter — desktop only */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="counter-grid home-desktop-only">
        {[
          { v: LIVE.hours, l: "volunteer hours logged" },
          { v: LIVE.volunteers, l: "active volunteers" },
          { v: LIVE.missions, l: "missions completed" },
          { v: LIVE.meals, l: "meals served" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: "30px 20px",
              textAlign: "center",
              background: i % 2 === 0 ? "#fdf2ee" : "var(--bg-tint)",
              border: i % 2 === 1 ? "1px solid var(--line)" : undefined,
              borderRight: i < 3 ? "1px solid var(--line)" : undefined,
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 800, color: i % 2 === 0 ? "var(--coral-deep)" : "var(--ink)" }}>{fmt(s.v)}</div>
            <div style={{ fontSize: 13.5, color: "#000", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </section>

      <div className="home-desktop-only">
        <HowItWorks />
      </div>

      {/* featured missions — desktop only */}
      <section style={{ padding: "48px 36px 12px", maxWidth: 1280, margin: "0 auto" }} className="home-desktop-only">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-deep)", letterSpacing: ".08em" }}>FEATURED MISSIONS</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 0", letterSpacing: "-.02em" }}>Find your cause</h2>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted-1)" }}>{featured.length} near you →</span>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 24 }}>
          {chips.map((c) => {
            const on = selectedKey === c.key;
            return (
              <span
                key={c.key}
                onClick={() => setSelectedKey(c.key)}
                style={
                  on
                    ? {
                        ...chipBase,
                        border: `1px solid ${c.accent}`,
                        background: c.accent,
                        color: "#fff",
                        fontWeight: 700,
                        boxShadow: `0 8px 18px -8px ${c.accent}`,
                      }
                    : chipBase
                }
              >
                {c.label}
              </span>
            );
          })}
        </div>
        {featured.length === 0 ? (
          <div
            style={{
              border: "1px dashed rgba(24,32,59,.16)",
              borderRadius: 20,
              padding: "48px 24px",
              textAlign: "center",
              background: "var(--bg-tint)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
              No open missions in {active.label} yet
            </div>
            <div style={{ fontSize: 14, color: "var(--muted-2)", maxWidth: 380, margin: "0 auto" }}>
              This category is live, but no organizations have posted missions here
              yet. Pick another cause above to see what&rsquo;s nearby.
            </div>
          </div>
        ) : (
        <div className="home-mission-grid card-grid-3">
          {featured.map((card, i) => (
            <ExploreMissionCard key={card.mission.id} card={card} index={i} showCta />
          ))}
        </div>
        )}
      </section>

      {/* testimonials — desktop only */}
      <section style={{ padding: "54px 36px", maxWidth: 1280, margin: "0 auto" }} className="home-desktop-only">
        <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: "center", margin: "0 0 30px", letterSpacing: "-.02em" }}>Loved by neighbors &amp; nonprofits</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="card-grid-3">
          {[
            { bg: "#fdf2ee", q: '"I found a beach cleanup 10 minutes from my dorm. Three months later I\'ve got 40 hours and a wall of badges."', g: "linear-gradient(135deg,#bca6ff,#7a6bf5)", n: "Maya R.", r: "Student volunteer" },
            { bg: "var(--bg-tint)", border: "1px solid var(--line)", q: '"Posting missions and checking volunteers in by QR cut our admin time in half. The impact reports sell themselves to funders."', g: "linear-gradient(135deg,#8fe3bd,#1fae82)", n: "GreenRoots", r: "Community garden" },
            { bg: "#fdf2ee", q: '"My students stay motivated by the streaks and challenges. It feels like a game but they\'re genuinely helping people."', g: "linear-gradient(135deg,#8bc0ff,#3a8bf0)", n: "BrightMinds", r: "Tutoring nonprofit" },
          ].map((t) => (
            <div key={t.n} style={{ background: t.bg, border: t.border, borderRadius: 20, padding: 26 }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>★★★★★</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 18px", color: "#3a425e" }}>{t.q}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: t.g }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.n}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", marginTop: 40, opacity: 0.5, fontWeight: 800, fontSize: 18, color: "var(--muted-1)" }}>
          {["GreenRoots", "Blue Coast", "Whiskers", "BrightMinds", "WarmTogether", "Golden Years"].map((o) => <span key={o}>{o}</span>)}
        </div>
      </section>

      {/* final CTA — desktop only */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 8px" }} className="home-desktop-only">
        <div style={{ margin: "0 20px 48px", borderRadius: 24, background: "linear-gradient(120deg,#ff8a5c,#ff5e7a)", padding: "54px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.16)", top: -80, left: -40, animation: "blob 14s ease-in-out infinite" }} />
          <span style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.12)", bottom: -90, right: 60, animation: "blob 18s ease-in-out infinite" }} />
          <h2 style={{ position: "relative", color: "#fff", fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-.02em" }}>Your community is waiting.</h2>
          <p style={{ position: "relative", color: "rgba(255,255,255,.9)", fontSize: 17, margin: "0 0 26px" }}>Join free in 30 seconds — no commitment, just impact.</p>
          <div style={{ position: "relative", display: "flex", gap: 13, justifyContent: "center" }}>
            <Link href="/auth" style={{ background: "#fff", color: "var(--coral-deep)", fontWeight: 700, fontSize: 16, padding: "15px 28px", borderRadius: 14 }}>Get started free</Link>
            <Link href="/pricing" style={{ background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.5)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "15px 28px", borderRadius: 14 }}>For organizations</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
