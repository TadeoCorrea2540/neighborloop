"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DefaultAvatar from "../default-avatar";
import { signOutAction } from "@/app/auth/actions";

type MenuLink = { label: string; href: string };

// Header account dropdown — same design as the public-nav user menu
// (avatar + name + chevron, opening a menu), reused inside the dashboard shells.
export default function HeaderUserMenu({
  name = "Neighbor",
  roleLabel = "Volunteer",
  kind = "user",
  links,
}: {
  name?: string;
  roleLabel?: string;
  kind?: "user" | "org";
  links?: MenuLink[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function logout() {
    setOpen(false);
    startSignOut(() => void signOutAction());
  }

  return (
    <div ref={ref} style={{ position: "relative", marginLeft: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: open ? "#f1f3f8" : "transparent",
          border: "1px solid rgba(24,32,59,.1)",
          borderRadius: 999,
          padding: "5px 12px 5px 5px",
          cursor: "pointer",
        }}
      >
        <DefaultAvatar size={30} radius={15} kind={kind} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: "var(--muted-2)" }} aria-hidden="true">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            minWidth: 200,
            background: "#fff",
            border: "1px solid rgba(24,32,59,.1)",
            borderRadius: 14,
            boxShadow: "0 24px 50px -22px rgba(24,32,59,.45)",
            padding: 6,
            zIndex: 60,
          }}
        >
          <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid rgba(24,32,59,.07)", marginBottom: 4 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{roleLabel}</div>
          </div>
          {(links ?? []).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "9px 12px", borderRadius: 9, fontSize: 14, fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}
              className="nav-acct-item"
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={logout}
            disabled={signingOut}
            role="menuitem"
            style={{ width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 9, fontSize: 14, fontWeight: 600, color: "#c0392b", background: "transparent", border: "none", cursor: signingOut ? "wait" : "pointer" }}
          >
            {signingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
