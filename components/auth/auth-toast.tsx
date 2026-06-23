"use client";

/**
 * A small, self-animating toast for action feedback (save / apply / withdraw /
 * auth). Anchored bottom-center so it never collides with the sticky nav,
 * slides up, and auto-dismisses. Inline-styled to match NeighborLoop tokens.
 *
 * Re-mount it with a changing `key` to re-trigger for repeat messages.
 */
import { useEffect, useState } from "react";

const TONES = {
  error: { accent: "#f1543f", tint: "#fff0ec" },
  success: { accent: "#1fae82", tint: "#dff6ea" },
} as const;

function ToneIcon({ tone }: { tone: "error" | "success" }) {
  return tone === "success" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function AuthToast({
  message,
  tone = "error",
  duration = 4000,
  onClose,
}: {
  message: string;
  tone?: "error" | "success";
  duration?: number;
  onClose: () => void;
}) {
  const t = TONES[tone];
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setShown(true));
    const dismiss = setTimeout(() => close(), duration);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(dismiss);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setShown(false);
    setTimeout(onClose, 220);
  }

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        zIndex: 1000,
        width: "max-content",
        maxWidth: "calc(100vw - 32px)",
        transform: `translateX(-50%) translateY(${shown ? "0" : "14px"})`,
        opacity: shown ? 1 : 0,
        transition: "transform .26s cubic-bezier(.2,.85,.25,1), opacity .26s ease",
        pointerEvents: shown ? "auto" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          background: "#18203b",
          color: "#fff",
          borderRadius: 999,
          padding: "11px 16px 11px 12px",
          boxShadow: "0 18px 40px -16px rgba(24,32,59,.55)",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: t.tint,
            color: t.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ToneIcon tone={tone} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{message}</span>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={close}
          style={{
            flexShrink: 0,
            marginLeft: 4,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "rgba(255,255,255,.6)",
            fontSize: 15,
            lineHeight: 1,
            padding: 2,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
