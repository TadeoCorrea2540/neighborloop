"use client";

/**
 * A small, self-animating toast for auth feedback. Fixed near the top so it's
 * visible no matter which signup step you're on. Inline-styled to match the
 * NeighborLoop design tokens (coral / mint / ink); no UI framework.
 *
 * Re-mount it with a changing `key` to re-trigger the entrance + auto-dismiss.
 */
import { useEffect, useState } from "react";

const TONES = {
  error: { accent: "#f1543f", tint: "#fff0ec", icon: "!", title: "Heads up" },
  success: { accent: "#1fae82", tint: "#dff6ea", icon: "✓", title: "Done" },
} as const;

export default function AuthToast({
  message,
  tone = "error",
  duration = 6000,
  onClose,
}: {
  message: string;
  tone?: "error" | "success";
  duration?: number;
  onClose: () => void;
}) {
  const t = TONES[tone];
  const [shown, setShown] = useState(false);
  const [bar, setBar] = useState(100);

  useEffect(() => {
    const enter = requestAnimationFrame(() => {
      setShown(true);
      // kick the progress bar after paint so the transition runs
      requestAnimationFrame(() => setBar(0));
    });
    const dismiss = setTimeout(() => close(), duration);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(dismiss);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setShown(false);
    setTimeout(onClose, 240); // let the exit transition finish
  }

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      style={{
        position: "fixed",
        top: 18,
        left: "50%",
        zIndex: 1000,
        width: "calc(100% - 32px)",
        maxWidth: 440,
        transform: `translateX(-50%) translateY(${shown ? "0" : "-18px"}) scale(${shown ? 1 : 0.98})`,
        opacity: shown ? 1 : 0,
        transition: "transform .3s cubic-bezier(.2,.85,.25,1), opacity .3s ease",
        pointerEvents: shown ? "auto" : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          background: "#fff",
          border: "1px solid rgba(24,32,59,.08)",
          borderRadius: 16,
          padding: "14px 14px 15px 16px",
          boxShadow: "0 26px 54px -22px rgba(24,32,59,.5), 0 2px 8px -4px rgba(24,32,59,.2)",
          overflow: "hidden",
        }}
      >
        {/* colored left rail */}
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: t.accent,
          }}
        />
        {/* icon badge */}
        <span
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: 11,
            background: t.tint,
            color: t.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 17,
            lineHeight: 1,
          }}
        >
          {t.icon}
        </span>
        {/* text */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink, #18203b)", marginBottom: 2 }}>
            {t.title}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--muted-2, #5a6685)", lineHeight: 1.5 }}>
            {message}
          </div>
        </div>
        {/* close */}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={close}
          style={{
            flexShrink: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--muted-3, #98a2b8)",
            fontSize: 16,
            lineHeight: 1,
            padding: 4,
            marginTop: -2,
          }}
        >
          ✕
        </button>
        {/* auto-dismiss progress bar */}
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: 3,
            width: `${bar}%`,
            background: t.accent,
            opacity: 0.5,
            transition: `width ${duration}ms linear`,
          }}
        />
      </div>
    </div>
  );
}
