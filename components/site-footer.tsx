/* Public site footer — ported from NeighborLoop.dc.html (newsletter strip,
   four link columns, impact band, bottom bar with socials).
   Static design spans are kept as spans; entries with a real route become
   <Link>s. Both share the .nav-link hover. */

import Link from "next/link";
import Logo from "./logo";

type Item = { label: string; href?: string };

const COLUMNS: { title: string; items: Item[] }[] = [
  {
    title: "VOLUNTEERS",
    items: [
      { label: "Explore missions", href: "/explore" },
      { label: "Causes near you", href: "/explore" },
      { label: "Badges & rewards", href: "/badges" },
      { label: "Impact certificates", href: "/impact" },
      { label: "How it works", href: "/" },
    ],
  },
  {
    title: "ORGANIZATIONS",
    items: [
      { label: "Post a mission", href: "/manage/missions/new" },
      { label: "Pricing & plans", href: "/pricing" },
      { label: "Attendance & QR", href: "/manage/attendance" },
      { label: "Impact reports", href: "/manage/reports" },
      { label: "Get verified", href: "/pricing" },
    ],
  },
  {
    title: "CAUSES",
    items: [
      { label: "Food security", href: "/explore" },
      { label: "Environment", href: "/explore" },
      { label: "Education", href: "/explore" },
      { label: "Animals", href: "/explore" },
      { label: "Seniors", href: "/explore" },
    ],
  },
  {
    title: "COMPANY",
    items: [
      { label: "About us" },
      { label: "Our impact", href: "/impact" },
      { label: "Careers" },
      { label: "Help center" },
      { label: "Contact" },
    ],
  },
];

const STATS = [
  { v: "48,213", l: "hours logged" },
  { v: "12,480", l: "volunteers" },
  { v: "847", l: "verified orgs" },
  { v: "91,240", l: "meals served" },
];

const linkStyle: React.CSSProperties = {
  cursor: "pointer",
  color: "inherit",
  textDecoration: "none",
};

function FooterLink({ item }: { item: Item }) {
  return item.href ? (
    <Link href={item.href} className="nav-link" style={linkStyle}>
      {item.label}
    </Link>
  ) : (
    <span className="nav-link" style={linkStyle}>
      {item.label}
    </span>
  );
}

const socialIcon: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  background: "rgba(255,255,255,.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

export default function SiteFooter() {
  return (
    <footer style={{ background: "#11182b", color: "#aeb6cf", padding: "52px 40px 28px" }}>
      {/* newsletter strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
          paddingBottom: 34,
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Logo size={30} />
            <span style={{ fontWeight: 800, fontSize: 19, color: "#fff" }}>NeighborLoop</span>
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 15, color: "#8d97b4", maxWidth: 380, lineHeight: 1.55 }}>
            Turn free time into real-world impact. Discover local missions, track your hours, and grow your
            community.
          </p>
        </div>
        <div style={{ minWidth: 300 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10 }}>
            Get new missions near you, weekly
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 12,
                padding: "13px 15px",
                color: "#7e88a6",
                fontSize: 14,
              }}
            >
              you@neighborhood.com
            </div>
            <span
              style={{
                background: "#ff6f5e",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                padding: "13px 20px",
                borderRadius: 12,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              Subscribe
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#6b7593", marginTop: 9 }}>
            No spam — just impact. Unsubscribe anytime.
          </div>
        </div>
      </div>

      {/* link columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr 1fr 1fr",
          gap: 24,
          padding: "36px 0 34px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
        className="footer-cols"
      >
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                color: "#6b7593",
                marginBottom: 14,
              }}
            >
              {col.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 14 }}>
              {col.items.map((item) => (
                <FooterLink key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* impact band */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          flexWrap: "wrap",
          padding: "26px 0",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          textAlign: "center",
        }}
      >
        {STATS.map((s, i) => (
          <div key={s.l}>
            <span style={{ fontSize: 20, fontWeight: 800, color: i % 2 === 0 ? "#ff8a73" : "#fff" }}>{s.v}</span>{" "}
            <span style={{ fontSize: 13, color: "#7e88a6" }}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* bottom bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          paddingTop: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13, color: "#7e88a6" }}>
          <span>© 2026 NeighborLoop, Inc.</span>
          <span className="nav-link" style={linkStyle}>Privacy</span>
          <span className="nav-link" style={linkStyle}>Terms</span>
          <span className="nav-link" style={linkStyle}>Cookies</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={socialIcon} aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#aeb6cf" aria-hidden="true">
                <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
              </svg>
            </span>
            <span style={socialIcon} aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#aeb6cf" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.2 1 .47 1.4.9.43.4.7.8.9 1.4.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.2.6-.47 1-.9 1.4-.4.43-.8.7-1.4.9-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42-.6-.2-1-.47-1.4-.9-.43-.4-.7-.8-.9-1.4-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.2-.6.47-1 .9-1.4.4-.43.8-.7 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-.9.04-1.4.2-1.7.3-.43.17-.74.37-1.06.7-.32.32-.52.63-.7 1.06-.1.3-.26.8-.3 1.7C3.8 8.5 3.8 8.9 3.8 12s0 3.5.07 4.7c.04.9.2 1.4.3 1.7.17.43.37.74.7 1.06.32.32.63.52 1.06.7.3.1.8.26 1.7.3 1.2.07 1.6.07 4.7.07s3.5 0 4.7-.07c.9-.04 1.4-.2 1.7-.3.43-.17.74-.37 1.06-.7.32-.32.52-.63.7-1.06.1-.3.26-.8.3-1.7.07-1.2.07-1.6.07-4.7s0-3.5-.07-4.7c-.04-.9-.2-1.4-.3-1.7-.17-.43-.37-.74-.7-1.06-.32-.32-.63-.52-1.06-.7-.3-.1-.8-.26-1.7-.3C15.5 4 15.1 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.3a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" />
              </svg>
            </span>
            <span style={socialIcon} aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#aeb6cf" aria-hidden="true">
                <path d="M18.9 1.2h3.7l-8 9.2L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.4h2L6.5 3.3H4.3l13.3 17.3Z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
