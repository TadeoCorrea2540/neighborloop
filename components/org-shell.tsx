"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ORG_NAV } from "@/lib/data";

export default function OrgShell({
  children,
  search = "Search missions, volunteers…",
}: {
  children: React.ReactNode;
  search?: string;
}) {
  const pathname = usePathname();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "230px 1fr",
        background: "var(--bg-app)",
      }}
      className="app-shell"
    >
      {/* org sidebar */}
      <aside
        style={{
          background: "#fff",
          borderRight: "1px solid var(--line)",
          padding: "22px 14px",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
        className="app-sidebar"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px" }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: "linear-gradient(135deg,#8fe3bd,#1fae82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🌱
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>GreenRoots</div>
            <div style={{ fontSize: 11, color: "var(--mint)", fontWeight: 600 }}>✓ Verified</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14, fontWeight: 600 }}>
          {ORG_NAV.map((it) => {
            const active =
              pathname === it.href ||
              (it.href === "/manage/missions" && pathname.startsWith("/manage/missions"));
            return (
              <Link
                key={it.label}
                href={it.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "11px 12px",
                  borderRadius: 13,
                  background: active ? "#fff0ec" : "transparent",
                  color: active ? "var(--coral-deep)" : "var(--muted-1)",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: active ? "#ffd9cf" : "var(--bg-chip)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  {it.icon}
                </span>
                {it.label}
                {it.badge && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "var(--coral)",
                      color: "#fff",
                      fontSize: 11,
                      padding: "1px 8px",
                      borderRadius: 99,
                    }}
                  >
                    {it.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/manage/missions/new"
          className="btn-coral"
          style={{
            marginTop: "auto",
            color: "#fff",
            textAlign: "center",
            fontWeight: 700,
            fontSize: 14,
            padding: 13,
            borderRadius: 14,
            boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)",
          }}
        >
          + Create mission
        </Link>
      </aside>

      {/* main */}
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
              maxWidth: 320,
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
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg,#8fe3bd,#1fae82)",
              }}
            />
          </div>
        </div>
        <main style={{ padding: "24px 28px", flex: 1 }} className="fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
