"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PublicNav from "@/components/public-nav";
import ExploreMobileExperience from "@/components/explore/explore-mobile-experience";
import SaveButton from "@/components/volunteer/save-button";
import "./explore-mobile.css";
import { ALL_CATEGORY, iconKeyToEmoji, type UICategory } from "@/lib/categories";
import type { MissionCard } from "@/lib/data/mission-cards";

export interface ExploreParams {
  category: string;
  q: string;
  when: string;
  beginner: boolean;
  virtual: string; // "", "true", "false"
  difficulty: string;
  sort: string;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Applied · pending",
  approved: "You’re in",
  waitlisted: "Waitlisted",
  declined: "Not selected",
  withdrawn: "Withdrawn",
  cancelled: "Cancelled",
};

export default function ExploreClient({
  cards,
  categories,
  params,
}: {
  cards: MissionCard[];
  categories: UICategory[];
  params: ExploreParams;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const chips = [ALL_CATEGORY, ...categories];
  const [exView, setExView] = useState<"list" | "map">("list");
  const [q, setQ] = useState(params.q);

  function setParam(updates: Record<string, string | null>) {
    const sp = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    router.push(`/explore${sp.toString() ? `?${sp.toString()}` : ""}`);
  }

  const hasFilters =
    !!params.q ||
    (params.category && params.category !== "all") ||
    !!params.when ||
    params.beginner ||
    !!params.virtual ||
    !!params.difficulty ||
    (!!params.sort && params.sort !== "soonest");

  const seg = (a: boolean): React.CSSProperties => ({
    fontSize: 13.5,
    fontWeight: 700,
    padding: "8px 14px",
    borderRadius: 9,
    cursor: "pointer",
    color: a ? "var(--ink)" : "var(--muted-3)",
    background: a ? "#fff" : "transparent",
    boxShadow: a ? "0 6px 14px -8px rgba(24,32,59,.35)" : undefined,
  });

  const chipStyle = (a: boolean, accent: string): React.CSSProperties => ({
    fontSize: 12.5,
    fontWeight: 600,
    padding: "7px 13px",
    borderRadius: 999,
    cursor: "pointer",
    transition: ".18s",
    border: a ? `1px solid ${accent}` : "1px solid rgba(24,32,59,.10)",
    background: a ? accent : "#fff",
    color: a ? "#fff" : "var(--muted-1)",
  });

  const pill = (a: boolean): React.CSSProperties => ({
    fontSize: 12.5,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 999,
    cursor: "pointer",
    background: a ? "#18203b" : "#eef0f5",
    color: a ? "#fff" : "var(--muted-1)",
  });

  const railLabel: React.CSSProperties = {
    fontSize: 12.5,
    fontWeight: 700,
    color: "var(--muted-3)",
    letterSpacing: ".04em",
    margin: "0 0 10px",
  };

  return (
    <div className="exp-page" style={{ background: "#fff", minHeight: "100vh" }}>
      <PublicNav />
      <ExploreMobileExperience cards={cards} />

      <div className="exp-desktop-only">
        <div
          style={{ display: "grid", gridTemplateColumns: "250px 1fr", minHeight: 600, maxWidth: 1280, margin: "0 auto" }}
          className="two-pane"
        >
          {/* filter rail */}
          <div style={{ borderRight: "1px solid rgba(24,32,59,.06)", padding: "24px 20px", background: "#fbfcfe" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Filters</span>
              {hasFilters && (
                <span
                  onClick={() => router.push("/explore")}
                  style={{ fontSize: 12.5, fontWeight: 600, color: "var(--coral-deep)", cursor: "pointer" }}
                >
                  Reset
                </span>
              )}
            </div>

            <div style={railLabel}>WHEN</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
              {[
                { v: "today", l: "Today" },
                { v: "weekend", l: "This weekend" },
                { v: "week", l: "This week" },
                { v: "month", l: "This month" },
              ].map((w) => (
                <span
                  key={w.v}
                  onClick={() => setParam({ when: params.when === w.v ? null : w.v })}
                  style={pill(params.when === w.v)}
                >
                  {w.l}
                </span>
              ))}
            </div>

            <div style={railLabel}>FORMAT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
              <span onClick={() => setParam({ virtual: params.virtual === "false" ? null : "false" })} style={pill(params.virtual === "false")}>
                In person
              </span>
              <span onClick={() => setParam({ virtual: params.virtual === "true" ? null : "true" })} style={pill(params.virtual === "true")}>
                Virtual
              </span>
              <span onClick={() => setParam({ beginner: params.beginner ? null : "true" })} style={pill(params.beginner)}>
                Beginner-friendly
              </span>
            </div>

            <div style={railLabel}>DIFFICULTY</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
              {["Easy", "Medium", "Hard"].map((d) => (
                <span key={d} onClick={() => setParam({ difficulty: params.difficulty === d ? null : d })} style={pill(params.difficulty === d)}>
                  {d}
                </span>
              ))}
            </div>

            <div style={railLabel}>SORT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {[
                { v: "soonest", l: "Soonest" },
                { v: "newest", l: "Newest" },
                { v: "spots", l: "Most spots" },
              ].map((s) => (
                <span
                  key={s.v}
                  onClick={() => setParam({ sort: s.v === "soonest" ? null : s.v })}
                  style={pill((params.sort || "soonest") === s.v)}
                >
                  {s.l}
                </span>
              ))}
            </div>
          </div>

          {/* results */}
          <div style={{ padding: "22px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setParam({ q: q.trim() || null });
                }}
                style={{ flex: 1 }}
              >
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by keyword, org or neighborhood…"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#f1f3f8",
                    borderRadius: 12,
                    padding: "12px 15px",
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                  }}
                />
              </form>
              <div style={{ display: "inline-flex", background: "#f1f3f8", borderRadius: 13, padding: 5, gap: 4 }}>
                <span onClick={() => setExView("list")} style={seg(exView === "list")}>☰ List</span>
                <span onClick={() => setExView("map")} style={seg(exView === "map")}>◉ Map</span>
              </div>
            </div>

            {/* cause chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {chips.map((c) => {
                const activeKey = params.category || "all";
                const on = activeKey === c.key;
                return (
                  <span
                    key={c.key}
                    onClick={() => setParam({ category: c.key === "all" ? null : c.key })}
                    style={chipStyle(on, c.accent)}
                  >
                    {c.emoji} {c.label}
                  </span>
                );
              })}
            </div>

            {exView === "map" ? (
              <div
                style={{
                  borderRadius: 18,
                  border: "1px dashed rgba(24,32,59,.16)",
                  background: "linear-gradient(135deg,#e2effd,#eef7ee)",
                  height: 360,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: "var(--muted-2)",
                }}
              >
                <div style={{ fontSize: 30 }}>🗺️</div>
                <div style={{ fontWeight: 700, color: "var(--ink)" }}>Map view is coming soon</div>
                <div style={{ fontSize: 13.5 }}>For now, browse the list — {cards.length} missions.</div>
              </div>
            ) : cards.length === 0 ? (
              <div
                style={{
                  border: "1px dashed rgba(24,32,59,.16)",
                  borderRadius: 18,
                  padding: "52px 24px",
                  textAlign: "center",
                  background: "#fbfcfe",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                  No missions match those filters yet
                </div>
                <div style={{ fontSize: 14, color: "var(--muted-2)", maxWidth: 360, margin: "0 auto 16px" }}>
                  Try another cause, date, or location.
                </div>
                {hasFilters && (
                  <span
                    onClick={() => router.push("/explore")}
                    className="btn-coral"
                    style={{ display: "inline-block", color: "#fff", fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 12, cursor: "pointer" }}
                  >
                    Explore all missions
                  </span>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, color: "var(--muted-2)", marginBottom: 14 }}>
                  <b style={{ color: "var(--ink)" }}>{cards.length} mission{cards.length === 1 ? "" : "s"}</b>{" "}
                  {hasFilters ? "match your filters" : "near you"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }} className="card-grid-3">
                  {cards.map((card) => {
                    const m = card.mission;
                    const accent = card.categoryAccentColor || "#ff8a5c";
                    const spots =
                      card.spotsLeft == null
                        ? "Open spots"
                        : card.isFull
                        ? "Full"
                        : `${card.spotsLeft} spots left`;
                    return (
                      <div
                        key={m.id}
                        style={{
                          position: "relative",
                          background: "#fff",
                          border: "1px solid rgba(24,32,59,.07)",
                          borderRadius: 18,
                          overflow: "hidden",
                          boxShadow: "0 12px 28px -22px rgba(24,32,59,.4)",
                        }}
                        className="lift"
                      >
                        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
                          <SaveButton missionId={m.id} initialSaved={card.isSaved} />
                        </div>
                        <Link href={`/missions/${m.slug}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                          <div
                            style={{
                              height: 92,
                              display: "flex",
                              alignItems: "center",
                              padding: "0 16px",
                              gap: 10,
                              fontSize: 30,
                              background: `linear-gradient(135deg, ${accent}33, ${accent})`,
                            }}
                          >
                            {iconKeyToEmoji(card.categoryIconKey)}
                            {card.applicationStatus && (
                              <span
                                style={{
                                  marginLeft: "auto",
                                  alignSelf: "flex-start",
                                  marginTop: 12,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: "rgba(255,255,255,.92)",
                                  color: "var(--ink)",
                                  padding: "4px 9px",
                                  borderRadius: 99,
                                }}
                              >
                                {STATUS_LABEL[card.applicationStatus] ?? card.applicationStatus}
                              </span>
                            )}
                          </div>
                          <div style={{ padding: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                              {card.categoryName && (
                                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-1)", background: "#f1f3f8", padding: "3px 9px", borderRadius: 99 }}>
                                  {card.categoryName}
                                </span>
                              )}
                              {m.isBeginnerFriendly && (
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#1fae82", background: "#dff6ea", padding: "3px 9px", borderRadius: 99 }}>
                                  Beginner-friendly
                                </span>
                              )}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.25, marginBottom: 2 }}>{m.title}</div>
                            <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>{card.organizationName ?? "Organization"}</div>
                            <div style={{ fontSize: 12.5, color: "var(--muted-1)", fontWeight: 600, margin: "9px 0 0" }}>
                              📅 {fmtDate(m.startsAt)}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                              <span style={{ fontSize: 12, color: "var(--muted-1)" }}>
                                📍 {m.isVirtual ? "Virtual" : m.locationLabel || m.city || "Nearby"}
                                {m.estimatedHours ? ` · ${m.estimatedHours}h` : ""}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "4px 9px",
                                  borderRadius: 99,
                                  background: card.isFull ? "#f1f3f8" : "#dff6ea",
                                  color: card.isFull ? "var(--muted-2)" : "#1fae82",
                                }}
                              >
                                {spots}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
