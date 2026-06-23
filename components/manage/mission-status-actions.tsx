"use client";

/**
 * Lifecycle action bar for an existing mission (edit page). Shows only the
 * transitions valid from the current status (mirrors the server transition map);
 * the server re-validates every transition. Destructive actions confirm first.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import {
  publishMissionAction,
  pauseMissionAction,
  resumeMissionAction,
  closeMissionAction,
  cancelMissionAction,
  archiveMissionAction,
} from "@/app/manage/missions/actions";
import type { MissionStatus } from "@/types/database";

type Tone = "primary" | "neutral" | "danger";
interface Act {
  label: string;
  tone: Tone;
  run: (id: string) => Promise<{ ok: boolean; error?: string }>;
  confirm?: string;
}

const PUBLISH: Act = { label: "🚀 Publish", tone: "primary", run: publishMissionAction };
const PAUSE: Act = { label: "Pause", tone: "neutral", run: pauseMissionAction };
const RESUME: Act = { label: "Resume", tone: "primary", run: resumeMissionAction };
const CLOSE: Act = { label: "Close", tone: "neutral", run: closeMissionAction, confirm: "Close this mission? Volunteers can no longer apply." };
const CANCEL: Act = { label: "Cancel", tone: "danger", run: cancelMissionAction, confirm: "Cancel this mission? This is for missions that won’t happen." };
const ARCHIVE: Act = { label: "Archive", tone: "neutral", run: archiveMissionAction, confirm: "Archive this mission? It’s hidden from your active list." };

const TRANSITIONS: Record<MissionStatus, Act[]> = {
  draft: [PUBLISH, CANCEL],
  pending_review: [PUBLISH, CANCEL],
  published: [PAUSE, CLOSE, CANCEL],
  paused: [RESUME, CLOSE, CANCEL],
  closed: [ARCHIVE],
  cancelled: [ARCHIVE],
  archived: [],
};

const STATUS_PILL: Record<MissionStatus, { label: string; bg: string; color: string }> = {
  draft: { label: "Draft", bg: "#f1f3f8", color: "#5a6685" },
  pending_review: { label: "Pending review", bg: "#fff0dd", color: "#b9651b" },
  published: { label: "Published", bg: "#dff6ea", color: "#147a57" },
  paused: { label: "Paused", bg: "#fff0dd", color: "#b9651b" },
  closed: { label: "Closed", bg: "#e2effd", color: "#2b6cb0" },
  cancelled: { label: "Cancelled", bg: "#ffeae6", color: "#c0392b" },
  archived: { label: "Archived", bg: "#f1f3f8", color: "#5a6685" },
};

function btnStyle(tone: Tone, disabled: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 13.5, fontWeight: 700, padding: "10px 16px", borderRadius: 11,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, border: "1px solid transparent",
  };
  if (tone === "primary") return { ...base, background: "#1fae82", color: "#fff" };
  if (tone === "danger") return { ...base, background: "#ffeae6", color: "#c0392b" };
  return { ...base, background: "#fff", color: "var(--muted-1)", borderColor: "rgba(24,32,59,.14)" };
}

export default function MissionStatusActions({
  missionId,
  status,
  publicSlug,
}: {
  missionId: string;
  status: MissionStatus;
  publicSlug: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  const acts = TRANSITIONS[status];
  const pill = STATUS_PILL[status];

  function runAct(a: Act) {
    if (a.confirm && !window.confirm(a.confirm)) return;
    start(async () => {
      const res = await a.run(missionId);
      if (!res.ok) return show(res.error ?? "Couldn’t update this mission.", "error");
      show(`Mission ${a.label.replace(/^[^\w]+/, "").toLowerCase()}d.`, "success");
      router.refresh();
    });
  }

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.06)", padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#3a425e" }}>Status</span>
        <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 11px", borderRadius: 99, background: pill.bg, color: pill.color }}>{pill.label}</span>
      </div>

      {acts.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted-3)", margin: 0 }}>This mission is archived — no further changes.</p>
      ) : (
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {acts.map((a) => (
            <button key={a.label} type="button" disabled={pending} onClick={() => runAct(a)} style={btnStyle(a.tone, pending)}>
              {a.label}
            </button>
          ))}
        </div>
      )}

      {status === "published" && (
        <a href={`/missions/${publicSlug}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>
          View public page ↗
        </a>
      )}

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
