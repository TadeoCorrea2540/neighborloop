"use client";

/**
 * Admin mission moderation controls — compact, used inline on the admin missions
 * list. Pause / cancel / archive require a reason (prompted); "Mark reviewed" is
 * an audit-only stamp. The server re-validates every transition.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { moderateMissionAction, markMissionReviewedAction, type ModerationAction } from "@/app/admin/missions/actions";
import type { MissionStatus } from "@/types/database";

const ALLOWED: Record<ModerationAction, MissionStatus[]> = {
  pause: ["published"],
  cancel: ["draft", "pending_review", "published", "paused"],
  archive: ["draft", "pending_review", "closed", "cancelled"],
};

function chip(bg: string, color: string, disabled?: boolean): React.CSSProperties {
  return { fontSize: 12.5, fontWeight: 700, padding: "7px 11px", borderRadius: 9, border: "none", background: bg, color, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1 };
}

export default function MissionModeration({
  missionId,
  status,
}: {
  missionId: string;
  status: MissionStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  function moderate(action: ModerationAction) {
    const reason = window.prompt(`Reason for "${action}" (recorded in the audit log):`, "");
    if (reason === null) return;
    if (!reason.trim()) return show("A reason is required.", "error");
    start(async () => {
      const res = await moderateMissionAction(missionId, action, reason);
      if (!res.ok) {
        if (res.code === "auth" || res.code === "role") return router.push("/auth?redirect=/admin/missions");
        return show(res.error ?? "Couldn’t moderate this mission.", "error");
      }
      show(`Mission ${action}d.`, "success");
      router.refresh();
    });
  }

  function review() {
    start(async () => {
      const res = await markMissionReviewedAction(missionId);
      if (!res.ok) return show(res.error ?? "Couldn’t mark reviewed.", "error");
      show("Marked reviewed.", "success");
      router.refresh();
    });
  }

  const can = (a: ModerationAction) => ALLOWED[a].includes(status);

  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
      {can("pause") && <button type="button" disabled={pending} style={chip("#fff0dd", "#b9651b", pending)} onClick={() => moderate("pause")}>Pause</button>}
      {can("cancel") && <button type="button" disabled={pending} style={chip("#ffeae6", "#c0392b", pending)} onClick={() => moderate("cancel")}>Cancel</button>}
      {can("archive") && <button type="button" disabled={pending} style={chip("#f1f3f8", "var(--muted-1)", pending)} onClick={() => moderate("archive")}>Archive</button>}
      <button type="button" disabled={pending} style={chip("#e2effd", "#2b6cb0", pending)} onClick={review}>Mark reviewed</button>
      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
