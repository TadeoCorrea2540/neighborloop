"use client";

/**
 * Organizer application review (used by /manage/applicants and a single mission's
 * applications page). Approve respects capacity (server returns code 'full');
 * decline/waitlist may include a private organizer note. Volunteers whose profile
 * is private show as initials + "Volunteer" — we never invent their details.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import DefaultAvatar from "@/components/default-avatar";
import Icon from "@/components/icons";
import MessageButton from "@/components/messaging/message-button";
import {
  approveApplicationAction,
  declineApplicationAction,
  waitlistApplicationAction,
} from "@/app/manage/applications/actions";
import type { OrganizerApplication } from "@/types/domain";
import type { ApplicationStatus } from "@/types/database";

const TABS = ["All", "Pending", "Waitlisted", "Approved", "Declined"] as const;
type Tab = (typeof TABS)[number];

const STATUS_PILL: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "Pending", bg: "#fff0dd", color: "#b9651b" },
  approved: { label: "Approved", bg: "#dff6ea", color: "#147a57" },
  waitlisted: { label: "Waitlisted", bg: "#e2effd", color: "#2b6cb0" },
  declined: { label: "Declined", bg: "#ffeae6", color: "#c0392b" },
  withdrawn: { label: "Withdrawn", bg: "#f1f3f8", color: "#5a6685" },
  cancelled: { label: "Cancelled", bg: "#f1f3f8", color: "#5a6685" },
};

function initials(name: string | null): string {
  if (!name) return "V";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "V";
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  // Fixed locale + timeZone so server and client render identically (no hydration mismatch).
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function chip(bg: string, color: string, disabled: boolean): React.CSSProperties {
  return {
    flex: 1, minWidth: 84, textAlign: "center", fontSize: 13, fontWeight: 700, color,
    background: bg, padding: "9px 10px", borderRadius: 11, border: "none",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
  };
}

export default function ApplicationsReview({
  applications,
  showMission = true,
}: {
  applications: OrganizerApplication[];
  showMission?: boolean;
}) {
  const router = useRouter();
  const [list, setList] = useState(applications);
  const [tab, setTab] = useState<Tab>("Pending");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: list.length, Pending: 0, Waitlisted: 0, Approved: 0, Declined: 0 };
    for (const a of list) {
      if (a.status === "pending") c.Pending++;
      else if (a.status === "waitlisted") c.Waitlisted++;
      else if (a.status === "approved") c.Approved++;
      else if (a.status === "declined") c.Declined++;
    }
    return c;
  }, [list]);

  const filtered = useMemo(() => {
    if (tab === "All") return list;
    return list.filter((a) => a.status === tab.toLowerCase());
  }, [list, tab]);

  function act(
    a: OrganizerApplication,
    fn: (id: string, note?: string) => Promise<{ ok: boolean; error?: string; code?: string }>,
    next: ApplicationStatus,
    successMsg: string,
    withNote?: boolean
  ) {
    let note: string | undefined;
    if (withNote) {
      const entered = window.prompt("Add a private note for your records (optional):", a.organizerNote ?? "");
      if (entered === null) return; // cancelled
      note = entered;
    }
    setPendingId(a.id);
    start(async () => {
      const res = await fn(a.id, note);
      setPendingId(null);
      if (!res.ok) {
        if (res.code === "auth") return router.push("/auth?next=/manage/applicants");
        return show(res.error ?? "Couldn’t update this application.", "error");
      }
      setList((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: next, organizerNote: note ?? x.organizerNote } : x)));
      show(successMsg, "success");
      router.refresh();
    });
  }

  return (
    <div>
      {/* tabs */}
      <div style={{ display: "flex", gap: 9, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                fontSize: 13.5, fontWeight: 600, padding: "9px 16px", borderRadius: 11, cursor: "pointer",
                background: active ? "#18203b" : "#fff", color: active ? "#fff" : "var(--muted-1)",
                border: active ? "none" : "1px solid rgba(24,32,59,.1)",
              }}
            >
              {t} <span style={{ opacity: 0.7 }}>{counts[t] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: "40px 24px", textAlign: "center", color: "var(--muted-3)" }}>
          <div style={{ display: "flex", justifyContent: "center", color: "var(--muted-3)", marginBottom: 8 }}><Icon name="inbox" size={30} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)" }}>No {tab === "All" ? "" : tab.toLowerCase() + " "}applications yet</div>
          <p style={{ fontSize: 13.5, marginTop: 4 }}>When volunteers apply, they’ll show up here for review.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }} className="card-grid-3">
          {filtered.map((a) => {
            const busy = pendingId === a.id;
            const pill = STATUS_PILL[a.status];
            const name = a.volunteer?.displayName ?? "Volunteer";
            const isPrivate = !a.volunteer;
            return (
              <div key={a.id} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: 18 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <DefaultAvatar size={50} radius={14} kind="user" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, ...pill, flexShrink: 0 }}>{pill.label}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginTop: 2 }}>
                      {a.volunteer?.city ? `${a.volunteer.city} · ` : isPrivate ? "Private profile · " : ""}Applied {fmtDate(a.appliedAt)}
                    </div>
                    {showMission && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--muted-1)", marginTop: 3, fontWeight: 600 }}><Icon name="target" size={13} style={{ flexShrink: 0 }} /> {a.missionTitle}</div>
                    )}
                  </div>
                </div>

                {a.message && (
                  <p style={{ fontSize: 13.5, color: "var(--muted-1)", background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 11, padding: "10px 12px", margin: "12px 0 0", lineHeight: 1.5 }}>
                    “{a.message}”
                  </p>
                )}
                {a.organizerNote && (
                  <p style={{ display: "flex", alignItems: "flex-start", gap: 5, fontSize: 12.5, color: "var(--muted-3)", margin: "8px 0 0" }}><Icon name="clipboard" size={13} style={{ flexShrink: 0, marginTop: 1 }} /> <span>Note: {a.organizerNote}</span></p>
                )}

                {(a.status === "pending" || a.status === "waitlisted" || a.status === "approved") && (
                  <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
                    {(a.status === "pending" || a.status === "waitlisted") && (
                      <button type="button" disabled={busy} onClick={() => act(a, approveApplicationAction, "approved", "Volunteer approved 🎉")} style={chip("var(--mint)", "#fff", busy)}>
                        {busy ? "…" : "Approve"}
                      </button>
                    )}
                    {a.status !== "waitlisted" && (
                      <button type="button" disabled={busy} onClick={() => act(a, waitlistApplicationAction, "waitlisted", "Moved to waitlist.", true)} style={chip("#e2effd", "#2b6cb0", busy)}>
                        Waitlist
                      </button>
                    )}
                    <button type="button" disabled={busy} onClick={() => act(a, declineApplicationAction, "declined", "Application declined.", true)} style={chip("#ffeae6", "#c0392b", busy)}>
                      Decline
                    </button>
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <MessageButton applicationId={a.id} basePath="/manage/messages" label="Message volunteer" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
