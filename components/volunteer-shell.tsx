"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VOL_NAV, VOL_STATS } from "@/lib/data";
import Logo from "./logo";
import LogoutButton from "./auth/logout-button";

export default function VolunteerShell({
  children,
  search = "Search missions, orgs, causes…",
  userName = "Neighbor",
  roleLabel = "Volunteer",
}: {
  children: React.ReactNode;
  search?: string;
  userName?: string;
  roleLabel?: string;
}) {
  const pathname = usePathname();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "248px 1fr",
        background: "var(--bg-app)",
      }}
      className="app-shell"
    >
      {/* sidebar */}
      <aside
        style={{
          background: "#fff",
          borderRight: "1px solid var(--line)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
        className="app-sidebar"
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}
        >
          <Logo size={32} />
          <span style={{ fontWeight: 800, fontSize: 17 }}>NeighborLoop</span>
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {VOL_NAV.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.label}
                href={it.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 12px",
                  borderRadius: 14,
                  fontWeight: 600,
                  fontSize: 14.5,
                  transition: ".18s",
                  background: active ? "#fff0ec" : "transparent",
                  color: active ? "var(--coral-deep)" : "var(--muted-1)",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    fontSize: 15,
                    flexShrink: 0,
                    background: active ? "#ffd9cf" : "var(--bg-chip)",
                  }}
                >
                  {it.icon}
                </span>
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            background: "linear-gradient(135deg,#fff0ec,#ffe3d6)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700 }}>Monthly goal</div>
          <div style={{ fontSize: 12, color: "var(--muted-1)", margin: "2px 0 9px" }}>
            {VOL_STATS.goalPct}% of 30 hrs
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 99,
              background: "rgba(255,255,255,.7)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${VOL_STATS.goalPct}%`,
                borderRadius: 99,
                background: "linear-gradient(90deg,#ff8a5c,#ff5e7a)",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: 8 }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "linear-gradient(135deg,#bca6ff,#7a6bf5)",
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{userName}</div>
            <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{roleLabel}</div>
          </div>
        </div>
        <LogoutButton
          style={{
            width: "100%",
            marginTop: 8,
            padding: "9px 12px",
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "#fff",
            color: "var(--muted-1)",
            fontWeight: 600,
            fontSize: 13,
          }}
        />
      </aside>

      {/* main column */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 28px",
            background: "#fff",
            borderBottom: "1px solid var(--line)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--bg-chip)",
              borderRadius: 12,
              padding: "10px 14px",
              maxWidth: 340,
              flex: 1,
              color: "var(--muted-3)",
              fontSize: 14,
            }}
          >
            🔎 {search}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 16 }}>
            <span style={{ position: "relative", fontSize: 19 }}>
              🔔
              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -4,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--coral)",
                  border: "2px solid #fff",
                }}
              />
            </span>
            <Link href="/messages" style={{ fontSize: 19 }}>
              ✉️
            </Link>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg,#bca6ff,#7a6bf5)",
              }}
            />
          </div>
        </div>
        <main style={{ padding: "26px 28px", flex: 1 }} className="fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
