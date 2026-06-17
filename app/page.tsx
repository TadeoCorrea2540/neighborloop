"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/public-nav";
import HowItWorks from "@/components/how-it-works";
import SiteFooter from "@/components/site-footer";
import {
  MISSIONS,
  CAUSE_EMOJI,
  CauseKey,
  causeArt,
  spotStyle,
  LIVE,
} from "@/lib/data";

const fmt = (n: number) => n.toLocaleString();

export default function Landing() {
  const [cause, setCause] = useState<CauseKey>("All");
  const featured = cause === "All" ? MISSIONS : MISSIONS.filter((m) => m.cause === cause);

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
  const chipActive: React.CSSProperties = {
    ...chipBase,
    border: "1px solid #ff6f5e",
    background: "var(--coral)",
    color: "#fff",
    fontWeight: 700,
    boxShadow: "0 8px 18px -8px rgba(255,111,94,.8)",
  };

  return (
    <div style={{ background: "#fff" }}>
      <PublicNav />

      {/* hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 24,
          padding: "60px 36px 64px",
          maxWidth: 1280,
          margin: "0 auto",
          borderRadius: 28,
          backgroundImage:
            "linear-gradient(105deg, rgba(20,26,46,.62) 0%, rgba(20,26,46,.30) 48%, rgba(20,26,46,.10) 100%), url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="hero-grid"
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

        {/* hero visual */}
        <div style={{ position: "relative", zIndex: 2, minHeight: 420 }} className="hero-visual">
          {/* floating people card */}
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
          {/* impact chip */}
          <div style={{ position: "absolute", left: 24, bottom: 24, background: "#fff", borderRadius: 18, padding: "15px 18px", boxShadow: "0 24px 44px -20px rgba(24,32,59,.4)", animation: "floaty2 8s ease-in-out infinite" }}>
            <div style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600 }}>Your impact</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--coral-deep)", lineHeight: 1.1 }}>126 hrs</div>
            <div style={{ fontSize: 12, color: "var(--muted-1)" }}>540 people helped</div>
          </div>
          {/* badge */}
          <div style={{ position: "absolute", right: 40, bottom: 60, width: 62, height: 62, borderRadius: "50%", background: "linear-gradient(140deg,#ff8a6b,#ff5e7a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 34px -14px rgba(255,94,122,.75), inset 0 1px 0 rgba(255,255,255,.4)", animation: "floaty 5.5s ease-in-out infinite" }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="rosetteStar" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ff8a6b" />
                  <stop offset="1" stopColor="#ff5e7a" />
                </linearGradient>
              </defs>
              {/* ribbon tails */}
              <path d="M18.5 27h5.5v18l-2.75-3.4L18.5 45z" fill="#fff" opacity="0.92" />
              <path d="M24 27h5.5v18l-2.75-3.4L24 45z" fill="#fff" opacity="0.78" />
              {/* medal disc */}
              <circle cx="24" cy="19.5" r="13" fill="#fff" />
              <circle cx="24" cy="19.5" r="9.6" fill="none" stroke="url(#rosetteStar)" strokeWidth="1.4" opacity="0.4" />
              {/* star */}
              <path d="M24 12.4l2.25 4.56 5.03.73-3.64 3.55.86 5.01L24 23.9l-4.5 2.36.86-5.01-3.64-3.55 5.03-.73z" fill="url(#rosetteStar)" />
            </svg>
          </div>
        </div>
      </section>

      {/* live counter */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "var(--ink)", color: "#fff" }} className="counter-grid">
        {[
          { v: LIVE.hours, l: "volunteer hours logged" },
          { v: LIVE.volunteers, l: "active volunteers" },
          { v: LIVE.missions, l: "missions completed" },
          { v: LIVE.meals, l: "meals served" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "30px 20px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,.08)" : undefined }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: i % 2 === 0 ? "#ff8a73" : "#fff" }}>{fmt(s.v)}</div>
            <div style={{ fontSize: 13.5, color: "#aeb6cf", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </section>

      {/* how it works */}
      <HowItWorks />

      {/* featured missions */}
      <section style={{ padding: "48px 36px 12px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-deep)", letterSpacing: ".08em" }}>FEATURED MISSIONS</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 0", letterSpacing: "-.02em" }}>Find your cause</h2>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted-1)" }}>{featured.length} near you →</span>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 24 }}>
          {(Object.keys(CAUSE_EMOJI) as CauseKey[]).map((c) => (
            <span key={c} onClick={() => setCause(c)} style={cause === c ? chipActive : chipBase}>
              {c}
            </span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="card-grid-3">
          {featured.map((m) => {
            const ss = spotStyle(m.spots);
            return (
              <Link key={m.slug} href={`/missions/${m.slug}`} className="lift" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 20, overflow: "hidden", boxShadow: "0 14px 30px -22px rgba(24,32,59,.4)", display: "block" }}>
                <div style={{ height: 128, position: "relative", background: causeArt(m) }}>
                  <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,.92)", borderRadius: 999, fontSize: 12, fontWeight: 700, padding: "5px 11px" }}>{m.cause}</span>
                  <span style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>♡</span>
                </div>
                <div style={{ padding: "16px 17px 18px" }}>
                  <div style={{ fontWeight: 700, fontSize: 16.5, lineHeight: 1.25 }}>{m.title}</div>
                  <div style={{ fontSize: 13, color: "var(--muted-3)", margin: "3px 0 12px" }}>{m.org}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "var(--muted-1)", marginBottom: 14 }}>
                    <span>📅 {m.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted-1)" }}>📍 {m.dist} · {m.diff}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 999, ...ss }}>{m.spots} spots</span>
                  </div>
                  <div className="btn-coral" style={{ marginTop: 14, color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 14, padding: 11, borderRadius: 12 }}>Join mission</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* testimonials */}
      <section style={{ padding: "54px 36px", maxWidth: 1280, margin: "0 auto" }}>
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

      {/* final CTA */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 8px" }}>
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

      {/* footer */}
      <SiteFooter />
    </div>
  );
}
