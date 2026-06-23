"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./auth/logout-button";
import NotificationsMenu from "./header/notifications-menu";

/* admin nav (ported from the design's dark sidebar — rendered light here) */
const ADMIN_NAV: {
  label: string;
  icon: string;
  href: string;
  badgeKey?: "verification" | "reports";
}[] = [
  { label: "Overview", icon: "📊", href: "/admin" },
  { label: "Verification", icon: "🏛️", href: "/admin/verification", badgeKey: "verification" },
  { label: "Reports", icon: "🚩", href: "/admin/reports", badgeKey: "reports" },
  { label: "Missions", icon: "🎯", href: "/admin/missions" },
  { label: "Organizations", icon: "🏢", href: "/admin/organizations" },
  { label: "Users", icon: "👥", href: "/admin/users" },
  { label: "Audit log", icon: "🧾", href: "/admin/audit" },
];

export default function AdminShell({
  children,
  search = "Search users, orgs, missions…",
  pendingVerifications = 0,
  openReports = 0,
  userId,
  notificationCount = 0,
}: {
  children: React.ReactNode;
  search?: string;
  pendingVerifications?: number;
  openReports?: number;
  userId?: string;
  notificationCount?: number;
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
      {/* admin sidebar */}
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
              background: "linear-gradient(135deg,#ff8a5c,#ff5e7a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            N
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Admin</div>
            <div style={{ fontSize: 11, color: "var(--coral-deep)", fontWeight: 600 }}>Platform console</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14, fontWeight: 600 }}>
          {ADMIN_NAV.map((it) => {
            const active =
              it.href === "/admin"
                ? pathname === "/admin" && it.label === "Overview"
                : pathname === it.href || pathname.startsWith(it.href + "/");
            const badgeCount =
              it.badgeKey === "verification" ? pendingVerifications : it.badgeKey === "reports" ? openReports : 0;
            const badge = badgeCount > 0 ? String(badgeCount) : undefined;
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
                {badge && (
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
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            background: "var(--bg-chip)",
            borderRadius: 14,
            padding: "13px 14px",
            fontSize: 12.5,
            color: "var(--muted-1)",
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>🛡️ Trust &amp; Safety</div>
          All actions are logged.
        </div>
        <LogoutButton
          style={{
            width: "100%",
            marginTop: 10,
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
            {userId ? (
              <NotificationsMenu initialCount={notificationCount} userId={userId} />
            ) : (
              <Link href="/notifications" className="hdr-trigger">🔔</Link>
            )}
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg,#ff8a5c,#ff5e7a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              A
            </span>
          </div>
        </div>
        <main style={{ padding: "24px 28px", flex: 1 }} className="fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
