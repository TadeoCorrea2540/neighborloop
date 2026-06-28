"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ORG_NAV } from "@/lib/data";
import Logo from "./logo";
import DefaultAvatar from "./default-avatar";
import Icon, { type IconName } from "./icons";
import LogoutButton from "./auth/logout-button";
import NotificationsMenu from "./header/notifications-menu";
import MessagesMenu from "./header/messages-menu";
import HeaderUserMenu from "./header/user-menu";

export default function OrgShell({
  children,
  orgName,
  verified = false,
  pendingCount = 0,
  userId,
  notificationCount = 0,
  messageCount = 0,
}: {
  children: React.ReactNode;
  orgName?: string | null;
  verified?: boolean;
  pendingCount?: number;
  userId?: string;
  notificationCount?: number;
  messageCount?: number;
}) {
  const pathname = usePathname();
  const NAV_ICON: Record<string, IconName> = {
    "/manage/dashboard": "bar-chart",
    "/manage/missions": "target",
    "/manage/applicants": "clipboard",
    "/manage/attendance": "check-square",
    "/manage/messages": "message",
    "/manage/reports": "trending-up",
    "/manage/settings": "settings",
  };
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
        className="app-sidebar org-sidebar"
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 18px" }}
        >
          <Logo size={32} />
          <span style={{ fontWeight: 800, fontSize: 17 }}>NeighborLoop</span>
        </Link>

        <div className="org-sidebar-identity" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <DefaultAvatar size={34} radius={11} kind="org" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {orgName || "Your organization"}
            </div>
            {verified ? (
              <div style={{ fontSize: 11, color: "var(--mint)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                <Icon name="check" size={12} strokeWidth={2.6} /> Verified
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--muted-3)", fontWeight: 600, marginTop: 2 }}>Organizer</div>
            )}
          </div>
        </div>

        <nav className="org-sidebar-nav">
          {ORG_NAV.map((it) => {
            const active =
              pathname === it.href ||
              (it.href === "/manage/missions" && pathname.startsWith("/manage/missions"));
            const badge =
              it.href === "/manage/applicants" ? (pendingCount > 0 ? String(pendingCount) : undefined) : undefined;
            return (
              <Link
                key={it.label}
                href={it.href}
                className={`org-sidebar-nav-link${active ? " org-sidebar-nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="org-sidebar-nav-icon">
                  <Icon name={NAV_ICON[it.href] ?? "target"} size={16} />
                </span>
                <span>{it.label}</span>
                {badge && <span className="org-sidebar-badge">{badge}</span>}
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
            textDecoration: "none",
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          + Create mission
        </Link>
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

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          className="org-main-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "18px 28px",
            background: "#fff",
            borderBottom: "1px solid var(--line)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Link href="/" className="org-mobile-brand" aria-label="NeighborLoop home">
            <Logo size={22} />
            <span className="org-mobile-brand-text">neighborloop</span>
          </Link>
          <div className="org-main-header-actions" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {userId ? (
              <>
                <NotificationsMenu initialCount={notificationCount} userId={userId} />
                <MessagesMenu initialCount={messageCount} viewer="organizer" basePath="/manage/messages" />
              </>
            ) : (
              <>
                <Link href="/notifications" className="hdr-trigger">🔔</Link>
                <Link href="/manage/messages" className="hdr-trigger">✉️</Link>
              </>
            )}
            <HeaderUserMenu
              name={orgName || "Your organization"}
              roleLabel={verified ? "Verified organizer" : "Organizer"}
              kind="org"
              links={[
                { label: "Dashboard", href: "/manage/dashboard" },
                { label: "Settings", href: "/manage/settings" },
              ]}
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
