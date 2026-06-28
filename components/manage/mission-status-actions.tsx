"use client";

/**
 * Lifecycle action bar for an existing mission (edit page). Shows only the
 * transitions valid from the current status (mirrors the server transition map);
 * the server re-validates every transition. Destructive actions confirm first.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/icons";
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
import "./edit-mission.css";

type Tone = "primary" | "neutral" | "danger";
interface Act {
  label: string;
  tone: Tone;
  run: (id: string) => Promise<{ ok: boolean; error?: string }>;
  confirm?: string;
}

const PUBLISH: Act = { label: "Publish", tone: "primary", run: publishMissionAction };
const PAUSE: Act = { label: "Pause", tone: "neutral", run: pauseMissionAction };
const RESUME: Act = { label: "Resume", tone: "primary", run: resumeMissionAction };
const CLOSE: Act = {
  label: "Close",
  tone: "neutral",
  run: closeMissionAction,
  confirm: "Close this mission? Volunteers can no longer apply.",
};
const CANCEL: Act = {
  label: "Cancel mission",
  tone: "danger",
  run: cancelMissionAction,
  confirm: "Cancel this mission? This is for missions that won’t happen.",
};
const ARCHIVE: Act = {
  label: "Archive",
  tone: "neutral",
  run: archiveMissionAction,
  confirm: "Archive this mission? It’s hidden from your active list.",
};

const TRANSITIONS: Record<MissionStatus, Act[]> = {
  draft: [PUBLISH, CANCEL],
  pending_review: [PUBLISH, CANCEL],
  published: [PAUSE, CLOSE, CANCEL],
  paused: [RESUME, CLOSE, CANCEL],
  closed: [ARCHIVE],
  cancelled: [ARCHIVE],
  archived: [],
};

const STATUS_HINT: Record<MissionStatus, string> = {
  draft: "Save your changes, then publish when you’re ready for volunteers to find this mission.",
  pending_review: "This mission is awaiting review before it can go live.",
  published: "Your mission is live on Explore. Volunteers can apply or join based on your settings.",
  paused: "Hidden from Explore — existing volunteers keep their status.",
  closed: "No new applications. Use this when the mission date has passed.",
  cancelled: "This mission won’t happen. You can archive it when you’re done.",
  archived: "This mission is archived and hidden from your active list.",
};

const PILL_CLASS: Record<MissionStatus, string> = {
  draft: "me-status-pill me-status-pill--draft",
  pending_review: "me-status-pill me-status-pill--pending",
  published: "me-status-pill me-status-pill--published",
  paused: "me-status-pill me-status-pill--paused",
  closed: "me-status-pill me-status-pill--closed",
  cancelled: "me-status-pill me-status-pill--cancelled",
  archived: "me-status-pill me-status-pill--archived",
};

const PILL_LABEL: Record<MissionStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  paused: "Paused",
  closed: "Closed",
  cancelled: "Cancelled",
  archived: "Archived",
};

function btnClass(tone: Tone): string {
  if (tone === "primary") return "me-status-btn me-status-btn--primary";
  if (tone === "danger") return "me-status-btn me-status-btn--danger";
  return "me-status-btn me-status-btn--neutral";
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

  function runAct(a: Act) {
    if (a.confirm && !window.confirm(a.confirm)) return;
    start(async () => {
      const res = await a.run(missionId);
      if (!res.ok) return show(res.error ?? "Couldn’t update this mission.", "error");
      show("Mission status updated.", "success");
      router.refresh();
    });
  }

  return (
    <div className="me-status">
      <div className="me-status-head">
        <span className="me-status-label">Mission status</span>
        <span className={PILL_CLASS[status]}>{PILL_LABEL[status]}</span>
      </div>

      <p className="me-status-hint">{STATUS_HINT[status]}</p>

      {acts.length === 0 ? (
        <p className="me-status-empty">No further status changes available.</p>
      ) : (
        <div className="me-status-actions">
          {acts.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={pending}
              onClick={() => runAct(a)}
              className={btnClass(a.tone)}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {status === "published" && (
        <a
          href={`/missions/${publicSlug}`}
          target="_blank"
          rel="noreferrer"
          className="me-status-public"
        >
          <Icon name="globe" size={15} />
          View public page
        </a>
      )}

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
