"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { iconKeyToEmoji } from "@/lib/categories";
import { withdrawApplicationAction } from "@/app/(volunteer)/actions";
import SaveButton from "@/components/volunteer/save-button";
import AuthToast from "@/components/auth/auth-toast";
import type { MissionCard } from "@/lib/data/mission-cards";
import type { ApplicationStatus } from "@/types/database";

export interface MyRow {
  applicationId: string;
  status: ApplicationStatus;
  withdrawable: boolean;
  card: MissionCard | null;
  /** fallback title/slug when the mission is no longer public */
  title: string | null;
  slug: string | null;
}

const TABS = ["All", "Upcoming", "Applications", "Saved", "Past", "Cancelled"] as const;
type Tab = (typeof TABS)[number];

const STATUS_PILL: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "Pending", bg: "#fff0dd", color: "#b9651b" },
  approved: { label: "Approved", bg: "#dff6ea", color: "#147a57" },
  waitlisted: { label: "Waitlisted", bg: "#e2effd", color: "#2b6cb0" },
  declined: { label: "Not selected", bg: "#f1f3f8", color: "#5a6685" },
  withdrawn: { label: "Withdrawn", bg: "#f1f3f8", color: "#5a6685" },
  cancelled: { label: "Cancelled", bg: "#f1f3f8", color: "#5a6685" },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function MyMissionsClient({
  upcoming,
  applications,
  saved,
  past,
  cancelled,
}: {
  upcoming: MyRow[];
  applications: MyRow[];
  saved: MissionCard[];
  past: MyRow[];
  cancelled: MyRow[];
}) {
  const [tab, setTab] = useState<Tab>("Upcoming");
  const router = useRouter();
  const [pendingId, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  // "All" = every application (any status) + saved missions you haven't applied to.
  const allAppRows = [...upcoming, ...applications, ...past, ...cancelled];
  const appMissionIds = new Set(
    allAppRows.map((r) => r.card?.mission.id).filter((id): id is string => Boolean(id))
  );
  const savedOnly = saved.filter((c) => !appMissionIds.has(c.mission.id));

  const counts: Record<Tab, number> = {
    All: allAppRows.length + savedOnly.length,
    Upcoming: upcoming.length,
    Applications: applications.length,
    Saved: saved.length,
    Past: past.length,
    Cancelled: cancelled.length,
  };

  function withdraw(applicationId: string) {
    setBusyId(applicationId);
    startTransition(async () => {
      const res = await withdrawApplicationAction(applicationId);
      setBusyId(null);
      if (!res.ok) {
        show(res.error, "error");
        return;
      }
      show("Application withdrawn.", "success");
      router.refresh();
    });
  }

  function AppCardRow({ row }: { row: MyRow }) {
    const c = row.card;
    const pill = STATUS_PILL[row.status];
    const accent = c?.categoryAccentColor || "#ff8a5c";
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(24,32,59,.06)",
          borderRadius: 16,
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}33, ${accent})`,
          }}
        >
          {iconKeyToEmoji(c?.categoryIconKey)}
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{c?.mission.title ?? row.title ?? "Mission unavailable"}</div>
          <div style={{ fontSize: 13, color: "#9aa3bd", marginTop: 2 }}>
            {c ? (
              <>
                {c.categoryName ? `${c.categoryName} · ` : ""}
                {c.organizationName ?? "Organization"} · 📅 {fmtDate(c.mission.startsAt)}
              </>
            ) : (
              "This mission is no longer listed."
            )}
          </div>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 700, padding: "6px 12px", borderRadius: 999, background: pill.bg, color: pill.color }}>
          {pill.label}
        </span>
        <div style={{ display: "flex", gap: 9 }}>
          {row.slug && (
            <Link
              href={`/missions/${row.slug}`}
              style={{ fontSize: 13, fontWeight: 600, color: "#18203b", border: "1px solid rgba(24,32,59,.12)", padding: "9px 13px", borderRadius: 11, textDecoration: "none" }}
            >
              View
            </Link>
          )}
          {row.withdrawable && (
            <button
              type="button"
              onClick={() => withdraw(row.applicationId)}
              disabled={pendingId && busyId === row.applicationId ? true : false}
              style={{ fontSize: 13, fontWeight: 600, color: "#c0392b", border: "1px solid rgba(241,84,63,.4)", padding: "9px 13px", borderRadius: 11, background: "#fff", cursor: "pointer" }}
            >
              {busyId === row.applicationId ? "Withdrawing…" : "Withdraw"}
            </button>
          )}
        </div>
      </div>
    );
  }

  function SavedCardRow({ c }: { c: MissionCard }) {
    const accent = c.categoryAccentColor || "#ff8a5c";
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, background: `linear-gradient(135deg, ${accent}33, ${accent})` }}>
          {iconKeyToEmoji(c.categoryIconKey)}
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{c.mission.title}</div>
          <div style={{ fontSize: 13, color: "#9aa3bd", marginTop: 2 }}>
            {c.categoryName ? `${c.categoryName} · ` : ""}
            {c.organizationName ?? "Organization"} · 📅 {fmtDate(c.mission.startsAt)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <Link href={`/missions/${c.mission.slug}`} style={{ fontSize: 13, fontWeight: 600, color: "#18203b", border: "1px solid rgba(24,32,59,.12)", padding: "9px 13px", borderRadius: 11, textDecoration: "none" }}>
            View
          </Link>
          <SaveButton missionId={c.mission.id} initialSaved={c.isSaved} />
        </div>
      </div>
    );
  }

  const rows = tab === "Upcoming" ? upcoming : tab === "Applications" ? applications : tab === "Past" ? past : tab === "Cancelled" ? cancelled : [];
  const isEmpty =
    tab === "All"
      ? counts.All === 0
      : tab === "Saved"
      ? saved.length === 0
      : rows.length === 0;

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-.02em" }}>My Missions</h2>

      <div style={{ display: "flex", gap: 9, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <span
              key={t}
              onClick={() => setTab(t)}
              style={{
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 700,
                padding: "9px 16px",
                borderRadius: 999,
                background: active ? "#ff6f5e" : "#fff",
                color: active ? "#fff" : "#5a6685",
                border: active ? "1px solid #ff6f5e" : "1px solid rgba(24,32,59,.12)",
              }}
            >
              {t} {counts[t] > 0 ? `· ${counts[t]}` : ""}
            </span>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {tab === "All" ? (
          <>
            {allAppRows.map((r) => <AppCardRow key={r.applicationId} row={r} />)}
            {savedOnly.map((c) => <SavedCardRow key={c.mission.id} c={c} />)}
          </>
        ) : tab === "Saved" ? (
          saved.map((c) => <SavedCardRow key={c.mission.id} c={c} />)
        ) : (
          rows.map((r) => <AppCardRow key={r.applicationId} row={r} />)
        )}

        {isEmpty && (
          <div style={{ textAlign: "center", padding: "54px 20px", background: "#fff", borderRadius: 18, border: "1px dashed rgba(24,32,59,.14)" }}>
            <div style={{ fontSize: 46 }}>🗂️</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 10 }}>Nothing here yet</div>
            <div style={{ fontSize: 14, color: "#9aa3bd", marginTop: 4 }}>
              {tab === "Saved" ? "Missions you save will show up here." : "Missions in this tab will show up here."}
            </div>
            <Link href="/explore" className="btn-coral" style={{ display: "inline-block", marginTop: 16, color: "#fff", fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 12, textDecoration: "none" }}>
              Explore missions
            </Link>
          </div>
        )}
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
