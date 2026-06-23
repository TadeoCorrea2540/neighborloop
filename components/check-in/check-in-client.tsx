"use client";

/**
 * Volunteer QR check-in landing. Calls qrCheckInAction once on mount and shows a
 * clear result. Not-logged-in → /auth with return URL. The token never leaves
 * the URL bar except to the server action (which hashes it).
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { qrCheckInAction, type CheckInResult } from "@/app/check-in/actions";

type State = { kind: "loading" } | { kind: "done"; result: CheckInResult };

const SCREENS: Record<string, { emoji: string; title: string; body: string; tone: "good" | "warn" | "bad" }> = {
  ok: { emoji: "🎉", title: "You’re checked in!", body: "Thanks for showing up for this mission.", tone: "good" },
  already: { emoji: "✅", title: "Already checked in", body: "We’ve got you on the list — no need to scan again.", tone: "good" },
  not_approved: { emoji: "🔒", title: "Not approved for this mission", body: "This check-in link is only for approved volunteers. If you applied, wait for the organizer to approve you.", tone: "warn" },
  expired: { emoji: "⌛", title: "This QR code has expired", body: "Ask the organizer for the current check-in code.", tone: "warn" },
  role: { emoji: "🙋", title: "Volunteer accounts only", body: "Check-in is for volunteer accounts. Switch to your volunteer account to check in.", tone: "warn" },
  invalid: { emoji: "⚠️", title: "Invalid check-in link", body: "This link doesn’t look right. Double-check the QR code with your organizer.", tone: "bad" },
};

const TONE: Record<string, string> = { good: "#1fae82", warn: "#b9651b", bad: "#c0392b" };

export default function CheckInClient({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      const result = await qrCheckInAction(token);
      if (!result.ok && result.code === "auth") {
        router.push(`/auth?redirect=${encodeURIComponent(`/check-in/${token}`)}`);
        return;
      }
      setState({ kind: "done", result });
    })();
  }, [token, router]);

  const wrap: React.CSSProperties = {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24, background: "var(--bg-app, #f7f8fc)",
  };
  const cardStyle: React.CSSProperties = {
    background: "#fff", borderRadius: 22, border: "1px solid rgba(24,32,59,.06)",
    padding: "40px 28px", maxWidth: 420, width: "100%", textAlign: "center",
    boxShadow: "0 24px 60px -32px rgba(24,32,59,.4)",
  };

  if (state.kind === "loading") {
    return (
      <div style={wrap}>
        <div style={cardStyle}>
          <div style={{ fontSize: 30 }}>⏳</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)", marginTop: 10 }}>Checking you in…</p>
        </div>
      </div>
    );
  }

  const code = state.result.code;
  const s = SCREENS[code] ?? SCREENS.invalid;
  return (
    <div style={wrap}>
      <div style={cardStyle}>
        <div style={{ fontSize: 44 }}>{s.emoji}</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "12px 0 6px", color: TONE[s.tone] }}>{s.title}</h1>
        <p style={{ fontSize: 14.5, color: "var(--muted-2)", lineHeight: 1.5, margin: 0 }}>{s.body}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
          <Link href="/my-missions" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 15, padding: 13, borderRadius: 13, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)" }}>Go to My Missions</Link>
          <Link href="/dashboard" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted-1)" }}>Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
