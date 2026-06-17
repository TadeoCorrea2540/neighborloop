"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";

const LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "For Organizations", href: "/pricing" },
  { label: "Impact", href: "/impact" },
  { label: "Pricing", href: "/pricing" },
];

export default function PublicNav() {
  const pathname = usePathname();
  return (
    <header
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
        style={{
          display: "flex",
          gap: 30,
          fontSize: 14.5,
          fontWeight: 500,
          color: "var(--muted-1)",
        }}
        className="public-links"
      >
        {LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="nav-link"
            style={
              pathname === l.href
                ? { color: "var(--coral-deep)", fontWeight: 700 }
                : undefined
            }
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link
          href="/auth"
          style={{ fontSize: 14.5, fontWeight: 600, color: "var(--muted-1)" }}
        >
          Log in
        </Link>
        <Link
          href="/explore"
          className="btn-coral"
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 18px",
            borderRadius: 12,
            boxShadow: "0 10px 22px -10px rgba(255,111,94,.8)",
          }}
        >
          Find Missions
        </Link>
      </div>
    </header>
  );
}
