"use client";

/**
 * Organizer mission list — real data, client-side filter/search. Row actions are
 * plain links (Edit / Applicants); lifecycle transitions live on the edit page.
 * Card layout works from 320px up (no squeezed table).
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { OrganizerMission } from "@/types/domain";
import type { MissionStatus } from "@/types/database";

const FILTERS = ["All", "Draft", "Published", "Paused", "Closed", "Cancelled", "Archived"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_PILL: Record<MissionStatus, { label: string; bg: string; color: string }> = {
  draft: { label: "Draft", bg: "#f1f3f8", color: "#5a6685" },
  pending_review: { label: "Pending review", bg: "#fff0dd", color: "#b9651b" },
  published: { label: "Published", bg: "#dff6ea", color: "#147a57" },
  paused: { label: "Paused", bg: "#fff0dd", color: "#b9651b" },
  closed: { label: "Closed", bg: "#e2effd", color: "#2b6cb0" },
  cancelled: { label: "Cancelled", bg: "#ffeae6", color: "#c0392b" },
  archived: { label: "Archived", bg: "#f1f3f8", color: "#5a6685" },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  // Fixed locale + timeZone so server and client render identically (no hydration mismatch).
  return Number.isNaN(d.getTime()) ? "Date TBD" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default function MissionsList({ missions }: { missions: OrganizerMission[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: missions.length };
    for (const m of missions) {
      const key = m.status === "pending_review" ? "Draft" : m.status[0].toUpperCase() + m.status.slice(1);
      c[key] = (c[key] ?? 0) + 1;
    }
    return c;
  }, [missions]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return missions.filter((m) => {
      if (filter !== "All") {
        if (filter === "Draft" && !(m.status === "draft" || m.status === "pending_review")) return false;
        if (filter !== "Draft" && m.status !== filter.toLowerCase()) return false;
      }
      if (needle && !m.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [missions, filter, q]);

  return (
    <div>
      {/* filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Search your missions…"
          style={{ flex: 1, minWidth: 180, border: "1px solid rgba(24,32,59,.1)", borderRadius: 12, padding: "11px 14px", fontSize: 14, outline: "none", background: "#fff" }}
        />
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 11, cursor: "pointer",
                background: active ? "#18203b" : "#fff", color: active ? "#fff" : "var(--muted-1)",
                border: active ? "none" : "1px solid rgba(24,32,59,.1)",
              }}
            >
              {f}{counts[f] ? ` ${counts[f]}` : ""}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🎯</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{missions.length === 0 ? "No missions yet" : "Nothing matches that filter"}</div>
          <p style={{ fontSize: 14, color: "var(--muted-3)", margin: "6px 0 18px" }}>
            {missions.length === 0 ? "Create your first mission to start recruiting volunteers." : "Try a different status or search."}
          </p>
          {missions.length === 0 && (
            <Link href="/manage/missions/new" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12 }}>+ Create mission</Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((m) => {
            const pill = STATUS_PILL[m.status];
            const cap = m.volunteerCapacity;
            return (
              <div key={m.id} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <Link href={`/manage/missions/${m.id}/edit`} style={{ fontWeight: 700, fontSize: 15.5, color: "var(--ink)" }}>{m.title}</Link>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, ...pill }}>{pill.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted-3)", marginTop: 4 }}>
                    📅 {fmtDate(m.startsAt)} · {m.isVirtual ? "🌐 Virtual" : `📍 ${m.city ?? m.locationLabel ?? "Location TBD"}`}
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: 86 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{m.approvedCount}{cap != null ? ` / ${cap}` : ""}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted-3)" }}>approved</div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Link
                    href={`/manage/missions/${m.id}/applications`}
                    style={{ position: "relative", fontSize: 13, fontWeight: 700, color: "var(--muted-1)", background: "#f1f3f8", padding: "9px 14px", borderRadius: 10 }}
                  >
                    Applicants
                    {m.pendingCount > 0 && (
                      <span style={{ marginLeft: 7, background: "var(--coral)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99 }}>{m.pendingCount}</span>
                    )}
                  </Link>
                  <Link href={`/manage/missions/${m.id}/edit`} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#18203b", padding: "9px 14px", borderRadius: 10 }}>Edit</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
