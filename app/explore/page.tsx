"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/public-nav";
import {
  MISSIONS,
  CAUSE_EMOJI,
  CauseKey,
  causeArt,
  spotStyle,
} from "@/lib/data";

export default function Explore() {
  const [cause, setCause] = useState<CauseKey>("All");
  const [exView, setExView] = useState<"list" | "map">("list");

  const filtered =
    cause === "All" ? MISSIONS : MISSIONS.filter((m) => m.cause === cause);

  const seg = (active: boolean): React.CSSProperties => ({
    fontSize: 13.5,
    fontWeight: 700,
    padding: "8px 14px",
    borderRadius: 9,
    cursor: "pointer",
    transition: ".18s",
    color: active ? "var(--ink)" : "var(--muted-3)",
    background: active ? "#fff" : "transparent",
    boxShadow: active ? "0 6px 14px -8px rgba(24,32,59,.35)" : undefined,
  });

  const chip = (active: boolean): React.CSSProperties => ({
    fontSize: 12.5,
    fontWeight: 600,
    padding: "7px 13px",
    borderRadius: 999,
    cursor: "pointer",
    transition: ".18s",
    border: active ? "1px solid #ff6f5e" : "1px solid rgba(24,32,59,.10)",
    background: active ? "var(--coral)" : "#fff",
    color: active ? "#fff" : "var(--muted-1)",
  });

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <PublicNav />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 1fr",
          minHeight: 600,
          maxWidth: 1280,
          margin: "0 auto",
        }}
        className="two-pane"
      >
        {/* filter rail */}
        <div
          style={{
            borderRight: "1px solid rgba(24,32,59,.06)",
            padding: "24px 20px",
            background: "#fbfcfe",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 16 }}>Filters</span>
            <span
              style={{ fontSize: 12.5, fontWeight: 600, color: "var(--coral-deep)", cursor: "pointer" }}
            >
              Reset
            </span>
          </div>

          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--muted-3)",
              letterSpacing: ".04em",
              marginBottom: 10,
            }}
          >
            CAUSE
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 9,
              marginBottom: 22,
            }}
          >
            {[
              { e: "🍲", label: "Food security", on: true },
              { e: "🌊", label: "Environment", on: false },
              { e: "📚", label: "Education", on: true },
              { e: "🐾", label: "Animals", on: false },
              { e: "🤝", label: "Seniors", on: false },
            ].map((f) => (
              <label
                key={f.label}
                style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#3a425e" }}
              >
                <span
                  style={
                    f.on
                      ? {
                          width: 18,
                          height: 18,
                          borderRadius: 6,
                          background: "#ff6f5e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 11,
                        }
                      : {
                          width: 18,
                          height: 18,
                          borderRadius: 6,
                          border: "1.5px solid rgba(24,32,59,.18)",
                        }
                  }
                >
                  {f.on ? "✓" : ""}
                </span>
                {f.e} {f.label}
              </label>
            ))}
          </div>

          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--muted-3)",
              letterSpacing: ".04em",
              marginBottom: 10,
            }}
          >
            DISTANCE
          </div>
          <div
            style={{
              marginBottom: 6,
              height: 6,
              borderRadius: 99,
              background: "#eef0f5",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: "55%",
                borderRadius: 99,
                background: "#ff6f5e",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "53%",
                top: "50%",
                transform: "translateY(-50%)",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                border: "2px solid #ff6f5e",
                boxShadow: "0 2px 6px rgba(0,0,0,.15)",
              }}
            />
          </div>
          <div style={{ fontSize: 13, color: "var(--muted-1)", marginBottom: 22 }}>
            Within 5 miles
          </div>

          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--muted-3)",
              letterSpacing: ".04em",
              marginBottom: 10,
            }}
          >
            WHEN
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
            {[
              { label: "This week", active: true },
              { label: "Today", active: false },
              { label: "Month", active: false },
            ].map((w) => (
              <span
                key={w.label}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: w.active ? "#18203b" : "#eef0f5",
                  color: w.active ? "#fff" : "var(--muted-1)",
                }}
              >
                {w.label}
              </span>
            ))}
          </div>

          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--muted-3)",
              letterSpacing: ".04em",
              marginBottom: 10,
            }}
          >
            DIFFICULTY
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {[
              { label: "Easy", bg: "#dff6ea", color: "#1fae82" },
              { label: "Medium", bg: "#eef0f5", color: "#5a6685" },
              { label: "Hard", bg: "#eef0f5", color: "#5a6685" },
            ].map((d) => (
              <span
                key={d.label}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: d.bg,
                  color: d.color,
                }}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* results */}
        <div style={{ padding: "22px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#f1f3f8",
                borderRadius: 12,
                padding: "12px 15px",
                color: "var(--muted-3)",
                fontSize: 14,
              }}
            >
              🔎 Search by keyword, org or neighborhood…
            </div>
            <div
              style={{
                display: "inline-flex",
                background: "#f1f3f8",
                borderRadius: 13,
                padding: 5,
                gap: 4,
              }}
            >
              <span onClick={() => setExView("list")} style={seg(exView === "list")}>
                ☰ List
              </span>
              <span onClick={() => setExView("map")} style={seg(exView === "map")}>
                ◉ Map
              </span>
            </div>
          </div>

          {/* cause chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {(Object.keys(CAUSE_EMOJI) as CauseKey[]).map((c) => (
              <span key={c} onClick={() => setCause(c)} style={chip(cause === c)}>
                {CAUSE_EMOJI[c]} {c}
              </span>
            ))}
          </div>

          {exView === "list" ? (
            <div>
              <div style={{ fontSize: 14, color: "var(--muted-2)", marginBottom: 14 }}>
                <b style={{ color: "var(--ink)" }}>{filtered.length} missions</b> match your
                filters
              </div>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}
                className="card-grid-3"
              >
                {filtered.map((m) => {
                  const ss = spotStyle(m.spots);
                  return (
                    <Link
                      key={m.slug}
                      href={`/missions/${m.slug}`}
                      className="lift"
                      style={{
                        display: "flex",
                        gap: 14,
                        background: "#fff",
                        border: "1px solid rgba(24,32,59,.07)",
                        borderRadius: 18,
                        padding: 14,
                        boxShadow: "0 12px 28px -22px rgba(24,32,59,.4)",
                      }}
                    >
                      <div
                        style={{
                          width: 92,
                          height: 92,
                          borderRadius: 14,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 34,
                          background: causeArt(m),
                        }}
                      >
                        {m.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--muted-1)",
                              background: "#f1f3f8",
                              padding: "3px 9px",
                              borderRadius: 99,
                            }}
                          >
                            {m.cause}
                          </span>
                          <span style={{ fontSize: 16 }}>♡</span>
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            margin: "7px 0 2px",
                            lineHeight: 1.2,
                          }}
                        >
                          {m.title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{m.org}</div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 9,
                          }}
                        >
                          <span
                            style={{ fontSize: 12, color: "var(--muted-1)", fontWeight: 600 }}
                          >
                            📍 {m.dist} · {m.date}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "4px 9px",
                              borderRadius: 99,
                              ...ss,
                            }}
                          >
                            {m.spots} left
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                height: 520,
                background: "linear-gradient(135deg,#e2effd,#eef7ee)",
                border: "1px solid rgba(24,32,59,.06)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "linear-gradient(rgba(24,32,59,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(24,32,59,.05) 1px,transparent 1px)",
                  backgroundSize: "46px 46px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background: "radial-gradient(circle,rgba(31,174,130,.12),transparent 70%)",
                  top: 80,
                  left: 120,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "radial-gradient(circle,rgba(58,139,240,.12),transparent 70%)",
                  bottom: 60,
                  right: 160,
                }}
              />

              {/* pins */}
              {[
                { left: 140, top: 110, label: "🍲 Food Bank", c: "#ff6f5e", anim: "ping 2.4s infinite" },
                { right: 200, top: 170, label: "🌊 Beach Cleanup", c: "#3a8bf0", anim: "ping 2.8s .6s infinite" },
                { left: 300, bottom: 150, label: "📚 Reading Buddy", c: "#7a6bf5", anim: "ping 3.2s 1.1s infinite" },
              ].map((p, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: p.left,
                    right: p.right,
                    top: p.top,
                    bottom: p.bottom,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#fff",
                        borderRadius: 999,
                        padding: "6px 11px",
                        boxShadow: "0 10px 22px -10px rgba(24,32,59,.5)",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {p.label}
                    </div>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        bottom: -12,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: p.c,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: 11,
                        bottom: -15,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: `2px solid ${p.c}`,
                        animation: p.anim,
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* floating result card */}
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  bottom: 24,
                  background: "#fff",
                  borderRadius: 18,
                  padding: 14,
                  width: 280,
                  boxShadow: "0 24px 48px -22px rgba(24,32,59,.5)",
                  display: "flex",
                  gap: 13,
                }}
              >
                <span
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)",
                  }}
                >
                  🍲
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted-1)",
                      background: "#f1f3f8",
                      padding: "3px 9px",
                      borderRadius: 99,
                      display: "inline-block",
                    }}
                  >
                    Food
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, margin: "5px 0 1px" }}>
                    Saturday Food Bank Sort
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)" }}>
                    📍 1.2 mi · 6 spots left
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  background: "#18203b",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "9px 15px",
                  borderRadius: 999,
                }}
              >
                📍 {filtered.length} missions in this area
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
