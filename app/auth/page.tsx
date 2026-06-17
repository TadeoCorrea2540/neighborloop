"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";

export default function Auth() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [role, setRole] = useState<"volunteer" | "org">("volunteer");
  const isSignup = mode === "signup";

  const tabOn: React.CSSProperties = { padding: "9px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", background: "#fff", color: "var(--ink)", boxShadow: "0 4px 10px -4px rgba(24,32,59,.3)" };
  const tabOff: React.CSSProperties = { padding: "9px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", background: "transparent", color: "var(--muted-3)" };
  const roleBase: React.CSSProperties = { borderRadius: 15, padding: "15px 14px", cursor: "pointer", transition: ".18s", border: "1.5px solid rgba(24,32,59,.1)", background: "var(--bg-tint)", textAlign: "center" };
  const roleSel: React.CSSProperties = { ...roleBase, border: "1.5px solid #ff6f5e", background: "#fff0ec", boxShadow: "0 10px 22px -12px rgba(255,111,94,.7)" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "radial-gradient(circle at 20% 0%,#eef2fb,#e6e9f2)" }}>
      <div style={{ width: "100%", maxWidth: 1060, background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow-card)", border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 560 }} className="auth-grid">
        {/* illustrated side */}
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#ece2ff,#dbeeff,#ffe3d6)", backgroundSize: "200% 200%", animation: "gshift 10s ease infinite", padding: "46px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="auth-aside">
          <span style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.7),transparent 70%)", top: -70, right: -60, animation: "blob 15s ease-in-out infinite" }} />
          <Link href="/" style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={34} />
            <span style={{ fontWeight: 800, fontSize: 19 }}>NeighborLoop</span>
          </Link>
          <div style={{ position: "relative" }}>
            <div style={{ background: "rgba(255,255,255,.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.7)", borderRadius: 18, padding: 18, width: 240, boxShadow: "0 20px 40px -22px rgba(24,32,59,.4)", animation: "floaty 7s ease-in-out infinite" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#8fe3bd,#1fae82)" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>You earned a badge!</div>
                  <div style={{ fontSize: 12, color: "var(--muted-1)" }}>Eco Hero 🌍</div>
                </div>
              </div>
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, margin: "26px 0 10px", letterSpacing: "-.02em" }}>Join 12,480 neighbors making real change.</h2>
            <p style={{ fontSize: 15, color: "#4a5475", lineHeight: 1.55, margin: 0 }}>Free forever for volunteers. Verified organizations. Your data stays yours.</p>
          </div>
          <div style={{ position: "relative", display: "flex", gap: 18, fontSize: 13, fontWeight: 600, color: "#4a5475" }}>
            <span>🔒 Bank-grade security</span>
            <span>✓ Verified orgs</span>
          </div>
        </div>

        {/* form side */}
        <div style={{ padding: "46px 46px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "inline-flex", background: "var(--bg-chip)", borderRadius: 13, padding: 5, marginBottom: 26, alignSelf: "flex-start" }}>
            <span onClick={() => setMode("signup")} style={isSignup ? tabOn : tabOff}>Sign up</span>
            <span onClick={() => setMode("login")} style={isSignup ? tabOff : tabOn}>Log in</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-.02em" }}>{isSignup ? "Create your account" : "Welcome back"}</h2>
          <p style={{ fontSize: 14.5, color: "var(--muted-3)", margin: "0 0 22px" }}>{isSignup ? "Free forever. Start volunteering in 30 seconds." : "Log in to pick up where you left off."}</p>

          {isSignup && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted-1)", marginBottom: 9 }}>I&apos;m joining as a…</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 20 }}>
                <div onClick={() => setRole("volunteer")} style={role === "volunteer" ? roleSel : roleBase}>
                  <div style={{ fontSize: 24 }}>🙋</div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 5 }}>Volunteer</div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)" }}>Find &amp; join missions</div>
                </div>
                <div onClick={() => setRole("org")} style={role === "org" ? roleSel : roleBase}>
                  <div style={{ fontSize: 24 }}>🏛️</div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 5 }}>Organization</div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)" }}>Post &amp; manage events</div>
                </div>
              </div>
            </div>
          )}

          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>Email</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--line-3)", borderRadius: 12, padding: "13px 14px", margin: "7px 0 16px" }}>
            <span style={{ color: "var(--muted-3)" }}>✉️</span>
            <span style={{ color: "var(--muted-4)", fontSize: 14.5 }}>you@neighborhood.com</span>
          </div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>Password</label>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--line-3)", borderRadius: 12, padding: "13px 14px", margin: "7px 0 22px" }}>
            <span style={{ color: "var(--muted-4)", fontSize: 14.5, letterSpacing: 3 }}>••••••••</span>
            <span style={{ color: "var(--muted-3)" }}>👁</span>
          </div>
          <Link href="/dashboard" className="btn-coral" style={{ color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 15.5, padding: 14, borderRadius: 13, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)" }}>
            {isSignup ? "Create account" : "Log in"}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", color: "var(--muted-4)", fontSize: 13 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(24,32,59,.1)" }} />
            or
            <span style={{ flex: 1, height: 1, background: "rgba(24,32,59,.1)" }} />
          </div>
          <div className="btn-ghost" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "1px solid var(--line-3)", borderRadius: 13, padding: 13, fontWeight: 600, fontSize: 14.5, cursor: "pointer" }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "conic-gradient(#ea4335,#fbbc05,#34a853,#4285f4)" }} />
            Continue with Google
          </div>
          <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--muted-3)", margin: "18px 0 0" }}>By continuing you agree to our Terms &amp; Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
