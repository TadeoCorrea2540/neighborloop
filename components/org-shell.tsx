"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ORG_NAV } from "@/lib/data";
import DefaultAvatar from "./default-avatar";
import Icon, { type IconName } from "./icons";
import LogoutButton from "./auth/logout-button";
import NotificationsMenu from "./header/notifications-menu";
import MessagesMenu from "./header/messages-menu";
import HeaderUserMenu from "./header/user-menu";

export default function OrgShell({
  children,
  search = "Search missions, volunteers…",
  orgName,
  verified = false,
  pendingCount = 0,
  userId,
  notificationCount = 0,
  messageCount = 0,
}: {
  children: React.ReactNode;
  search?: string;
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
          <DefaultAvatar size={34} radius={11} kind="org" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>{orgName || "Your organization"}</div>
            {verified ? (
              <div style={{ fontSize: 11, color: "var(--mint)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}><Icon name="check" size={12} strokeWidth={2.6} /> Verified</div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--muted-3)", fontWeight: 600 }}>Organizer</div>
            )}
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14, fontWeight: 600 }}>
          {ORG_NAV.map((it) => {
            const active =
              pathname === it.href ||
              (it.href === "/manage/missions" && pathname.startsWith("/manage/missions"));
            // Applicants badge reflects the real pending count; other static badges are dropped.
            const badge =
              it.href === "/manage/applicants" ? (pendingCount > 0 ? String(pendingCount) : undefined) : undefined;
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
                  }}
                >
                  <Icon name={NAV_ICON[it.href] ?? "target"} size={16} />
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
            <Icon name="search" size={16} style={{ color: "var(--muted-3)" }} /> {search}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 16 }}>
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
              links={[{ label: "Dashboard", href: "/manage/dashboard" }]}
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
