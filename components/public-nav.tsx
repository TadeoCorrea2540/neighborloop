"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./logo";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const DESKTOP_LINKS = [
  { label: "Home", href: "/" },
  { label: "For Organizers", href: "/for-organizers" },
  { label: "For Volunteers", href: "/for-volunteers" },
  { label: "Explore", href: "/explore" },
  { label: "Pricing", href: "/pricing" },
];

const MOBILE_LINKS = [
  { label: "For Volunteers", href: "/for-volunteers" },
  { label: "For Organizers", href: "/for-organizers" },
  { label: "Explore", href: "/explore" },
  { label: "Pricing", href: "/pricing" },
];

type Role = "volunteer" | "organizer" | "admin" | null;
interface Account {
  name: string;
  role: Role;
}

function dashboardPath(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "organizer") return "/manage/dashboard";
  return "/dashboard";
}

const AVATARS = ["#bca6ff", "#7a6bf5"];

export default function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [loaded, setLoaded] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Resolve auth state client-side (PublicNav renders on many pages).
  useEffect(() => {
    const supabase = getBrowserSupabase();
    let active = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) {
        if (active) {
          setAccount(null);
          setLoaded(true);
        }
        return;
      }
      const meta = (u.user_metadata ?? {}) as { display_name?: string; full_name?: string };
      const name = meta.display_name || meta.full_name || u.email?.split("@")[0] || "Neighbor";
      let role: Role = null;
      try {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
        const list = ((roles ?? []) as { role: string }[]).map((r) => r.role);
        role = (["admin", "organizer", "volunteer"] as const).find((r) => list.includes(r)) ?? null;
      } catch {
        /* role optional for nav */
      }
      if (active) {
        setAccount({ name, role });
        setLoaded(true);
      }
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    closeMenu();
    setAcctOpen(false);
  }, [pathname, closeMenu]);

  // Close the account dropdown on outside click.
  useEffect(() => {
    if (!acctOpen) return;
    const onClick = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [acctOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  async function logout() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setAcctOpen(false);
    closeMenu();
    router.push("/");
    router.refresh();
  }

  const initial = account?.name?.charAt(0).toUpperCase() || "N";
  const acctLinks = [
    { label: "Dashboard", href: dashboardPath(account?.role ?? null) },
    ...(account?.role !== "organizer" && account?.role !== "admin"
      ? [
          { label: "My Missions", href: "/my-missions" },
          { label: "Settings", href: "/settings" },
        ]
      : []),
  ];

  return (
    <>
      <header
        className="public-nav-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 36px",
          borderBottom: "1px solid rgba(24,32,59,.05)",
          background: "rgba(255,255,255,.85)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 18 }}>NeighborLoop</span>
        </Link>

        <nav
          style={{ display: "flex", gap: 30, fontSize: 14.5, fontWeight: 500, color: "var(--muted-1)" }}
          className="public-links"
          aria-label="Main"
        >
          {DESKTOP_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="nav-link"
              style={pathname === l.href ? { color: "var(--coral-deep)", fontWeight: 700 } : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* mobile top-right CTA */}
          <Link href={account ? dashboardPath(account.role) : "/auth"} className="mobile-nav-cta btn-coral">
            {account ? "Dashboard" : "Sign up"}
          </Link>

          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <div className="public-nav-desktop-actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {!loaded ? (
              // reserve space to avoid a flash of the wrong state
              <span style={{ width: 150, height: 38 }} aria-hidden="true" />
            ) : account ? (
              <div ref={acctRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setAcctOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={acctOpen}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    background: acctOpen ? "#f1f3f8" : "transparent",
                    border: "1px solid rgba(24,32,59,.1)",
                    borderRadius: 999,
                    padding: "5px 12px 5px 5px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${AVATARS[0]}, ${AVATARS[1]})`,
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {initial}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {account.name}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: "var(--muted-2)" }} aria-hidden="true">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {acctOpen && (
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
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{account.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-3)", textTransform: "capitalize" }}>{account.role ?? "volunteer"}</div>
                    </div>
                    {acctLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        role="menuitem"
                        onClick={() => setAcctOpen(false)}
                        style={{ display: "block", padding: "9px 12px", borderRadius: 9, fontSize: 14, fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}
                        className="nav-acct-item"
                      >
                        {l.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={logout}
                      role="menuitem"
                      style={{ width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 9, fontSize: 14, fontWeight: 600, color: "#c0392b", background: "transparent", border: "none", cursor: "pointer" }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--muted-1)" }}>
                  Log in
                </Link>
                <Link
                  href="/auth"
                  className="btn-coral"
                  style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 12, boxShadow: "0 10px 22px -10px rgba(255,111,94,.8)" }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div
        className={`mobile-nav-backdrop${menuOpen ? " mobile-nav-backdrop--open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer${menuOpen ? " mobile-nav-drawer--open" : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="mobile-nav-drawer-head">
          <Link href="/" onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={24} />
            <span style={{ fontWeight: 800, fontSize: 16 }}>NeighborLoop</span>
          </Link>
          <button type="button" className="mobile-nav-drawer-close" aria-label="Close menu" onClick={closeMenu}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="mobile-nav-drawer-links" aria-label="Mobile">
          {MOBILE_LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={closeMenu} aria-current={pathname === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          {account &&
            acctLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={closeMenu} aria-current={pathname === l.href ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
        </nav>

        <div className="mobile-nav-drawer-footer">
          {account ? (
            <>
              <p className="mobile-nav-drawer-auth-label">Signed in as {account.name}</p>
              <div className="mobile-nav-drawer-auth">
                <button type="button" onClick={logout} className="mobile-nav-drawer-btn-login" style={{ width: "100%", cursor: "pointer" }}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mobile-nav-drawer-auth-label">Account</p>
              <div className="mobile-nav-drawer-auth">
                <Link href="/auth" onClick={closeMenu} className="mobile-nav-drawer-btn-signup">
                  Sign up
                </Link>
                <Link href="/auth" onClick={closeMenu} className="mobile-nav-drawer-btn-login">
                  Log in
                </Link>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
