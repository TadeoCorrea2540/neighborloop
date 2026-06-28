"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PublicNav from "@/components/public-nav";
import ExploreMobileExperience from "@/components/explore/explore-mobile-experience";
import ExploreMissionCard from "@/components/explore/explore-mission-card";
import ExploreResultsEmpty from "@/components/explore/explore-results-empty";
import { useSession } from "@/components/session-provider";
import "./explore-mobile.css";
import "./explore-mission-cards.css";
import { ALL_CATEGORY, type UICategory } from "@/lib/categories";
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
  const account = useSession();
  const chips = [ALL_CATEGORY, ...categories];
  const [exView, setExView] = useState<"list" | "map">("list");
  const [q, setQ] = useState(params.q);
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<ExploreParams | null>(null);
  const view = optimistic ?? params;

  function setParam(updates: Record<string, string | null>) {
    const sp = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    setOptimistic({
      category: sp.get("category") || "all",
      q: sp.get("q") || "",
      when: sp.get("when") || "",
      beginner: sp.get("beginner") === "true",
      virtual: sp.get("virtual") || "",
      difficulty: sp.get("difficulty") || "",
      sort: sp.get("sort") || "soonest",
    });
    startTransition(() => {
      router.push(`/explore${sp.toString() ? `?${sp.toString()}` : ""}`);
    });
  }

  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    setOptimistic(null);
  }, [paramsKey]);

  const hasFilters =
    !!view.q ||
    (view.category && view.category !== "all") ||
    !!view.when ||
    view.beginner ||
    !!view.virtual ||
    !!view.difficulty ||
    (!!view.sort && view.sort !== "soonest");

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
                  onClick={() => setParam({ when: view.when === w.v ? null : w.v })}
                  style={pill(view.when === w.v)}
                >
                  {w.l}
                </span>
              ))}
            </div>

            <div style={railLabel}>FORMAT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
              <span onClick={() => setParam({ virtual: view.virtual === "false" ? null : "false" })} style={pill(view.virtual === "false")}>
                In person
              </span>
              <span onClick={() => setParam({ virtual: view.virtual === "true" ? null : "true" })} style={pill(view.virtual === "true")}>
                Virtual
              </span>
              <span onClick={() => setParam({ beginner: view.beginner ? null : "true" })} style={pill(view.beginner)}>
                Beginner-friendly
              </span>
            </div>

            <div style={railLabel}>DIFFICULTY</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
              {["Easy", "Medium", "Hard"].map((d) => (
                <span key={d} onClick={() => setParam({ difficulty: view.difficulty === d ? null : d })} style={pill(view.difficulty === d)}>
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
                  style={pill((view.sort || "soonest") === s.v)}
                >
                  {s.l}
                </span>
              ))}
            </div>
          </div>

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

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {chips.map((c) => {
                const activeKey = view.category || "all";
                const on = activeKey === c.key;
                return (
                  <span
                    key={c.key}
                    onClick={() => setParam({ category: c.key === "all" ? null : c.key })}
                    style={chipStyle(on, c.accent)}
                  >
                    {c.label}
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
              <ExploreResultsEmpty
                filtered={hasFilters}
                isOrganizer={account?.role === "organizer"}
                onReset={hasFilters ? () => router.push("/explore") : undefined}
              />
            ) : (
              <div>
                <div style={{ fontSize: 14, color: "var(--muted-2)", marginBottom: 14 }}>
                  <b style={{ color: "var(--ink)" }}>{cards.length} mission{cards.length === 1 ? "" : "s"}</b>{" "}
                  {hasFilters ? "match your filters" : "near you"}
                  {isPending && <span style={{ marginLeft: 8, color: "var(--coral-deep)", fontWeight: 600 }}>· Updating…</span>}
                </div>
                <div className={["exp-card-grid", isPending ? "exp-card-grid--pending" : ""].filter(Boolean).join(" ")}>
                  {cards.map((card, i) => (
                    <ExploreMissionCard key={card.mission.id} card={card} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
