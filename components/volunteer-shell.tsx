"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VOL_NAV } from "@/lib/data";
import Logo from "./logo";
import DefaultAvatar from "./default-avatar";
import Icon, { type IconName } from "./icons";
import LogoutButton from "./auth/logout-button";
import NotificationsMenu from "./header/notifications-menu";
import MessagesMenu from "./header/messages-menu";
import HeaderUserMenu from "./header/user-menu";

export default function VolunteerShell({
  children,
  search = "Search missions, orgs, causes…",
  userName = "Neighbor",
  roleLabel = "Volunteer",
  userId,
  notificationCount = 0,
  messageCount = 0,
  monthlyGoalHours = 0,
  monthlyGoalPct = 0,
}: {
  children: React.ReactNode;
  search?: string;
  userName?: string;
  roleLabel?: string;
  userId?: string;
  notificationCount?: number;
  messageCount?: number;
  monthlyGoalHours?: number;
  monthlyGoalPct?: number;
}) {
  const pathname = usePathname();
  const NAV_ICON: Record<string, IconName> = {
    "/dashboard": "home",
    "/my-missions": "target",
    "/impact": "sparkles",
    "/badges": "award",
    "/messages": "message",
    "/settings": "settings",
  };
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
        className="app-sidebar vol-sidebar"
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}
        >
          <Logo size={32} />
          <span style={{ fontWeight: 800, fontSize: 17 }}>NeighborLoop</span>
        </Link>

        <nav className="vol-sidebar-nav">
          {VOL_NAV.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.label}
                href={it.href}
                className={`vol-sidebar-nav-link${active ? " vol-sidebar-nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="vol-sidebar-nav-icon">
                  <Icon name={NAV_ICON[it.href] ?? "home"} size={17} />
                </span>
                <span className="vol-sidebar-nav-label">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="vol-sidebar-goal"
          style={{
            marginTop: "auto",
            background: "linear-gradient(135deg,#fff0ec,#ffe3d6)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700 }}>Monthly goal</div>
          <div style={{ fontSize: 12, color: "var(--muted-1)", margin: "2px 0 9px" }}>
            {monthlyGoalHours}h · {monthlyGoalPct}% of 30 hrs
          </div>
          <div
            className="vol-sidebar-goal-bar"
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
                width: `${monthlyGoalPct}%`,
                borderRadius: 99,
                background: "linear-gradient(90deg,#ff8a5c,#ff5e7a)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
            padding: "10px 10px",
            borderRadius: 14,
            border: "1px solid rgba(24,32,59,.06)",
            background: "#fff",
          }}
        >
          <DefaultAvatar size={38} radius={12} kind="user" />
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
          className="vol-main-header"
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
            className="vol-search"
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
            <Icon name="search" size={17} style={{ color: "var(--muted-3)" }} /> {search}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 16 }}>
            {userId ? (
              <>
                <NotificationsMenu initialCount={notificationCount} userId={userId} />
                <MessagesMenu initialCount={messageCount} viewer="volunteer" basePath="/messages" />
              </>
            ) : (
              <>
                <Link href="/notifications" className="hdr-trigger">🔔</Link>
                <Link href="/messages" className="hdr-trigger">✉️</Link>
              </>
            )}
            <HeaderUserMenu
              name={userName}
              roleLabel={roleLabel}
              kind="user"
              links={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "My Missions", href: "/my-missions" },
                { label: "Settings", href: "/settings" },
              ]}
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
