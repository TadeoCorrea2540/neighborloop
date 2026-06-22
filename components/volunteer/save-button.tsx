"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { saveMissionAction, unsaveMissionAction } from "@/app/(volunteer)/actions";
import AuthToast from "@/components/auth/auth-toast";

/**
 * Save/unsave a mission. Optimistic, with a toast and auth redirect. Used both
 * as a small heart on cards (variant="icon") and a full button (variant="full").
 */
export default function SaveButton({
  missionId,
  initialSaved,
  variant = "icon",
}: {
  missionId: string;
  initialSaved: boolean;
  variant?: "icon" | "full";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    const next = !saved;
    setSaved(next); // optimistic
    start(async () => {
      const res = next ? await saveMissionAction(missionId) : await unsaveMissionAction(missionId);
      if (!res.ok) {
        setSaved(!next); // revert
        if (res.code === "auth") {
          router.push(`/auth?next=${encodeURIComponent(pathname)}`);
          return;
        }
        show(res.error, "error");
        return;
      }
      show(next ? "Saved for later" : "Removed from saved", "success");
      router.refresh();
    });
  }

  const iconBtn: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,.92)",
    border: "none",
    cursor: pending ? "wait" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: saved ? "#ff5e7a" : "var(--muted-1, #3a425e)",
    boxShadow: "0 4px 10px -6px rgba(24,32,59,.4)",
  };

  const fullBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: 12,
    borderRadius: 12,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: pending ? "wait" : "pointer",
    border: saved ? "1px solid #ff5e7a" : "1px solid rgba(24,32,59,.12)",
    background: saved ? "#fff0f3" : "#fff",
    color: saved ? "#ff5e7a" : "var(--ink, #18203b)",
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save mission"}
        style={variant === "full" ? fullBtn : iconBtn}
      >
        {variant === "full" ? (
          <>
            {saved ? "♥ Saved" : "♡ Save"}
          </>
        ) : saved ? (
          "♥"
        ) : (
          "♡"
        )}
      </button>
      {toast && (
        <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </>
  );
}
