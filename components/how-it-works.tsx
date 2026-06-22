/* "How it works" — custom animated SVG icons (Discover / Join / Grow).
   Each icon is tinted to its tile and animates gently on idle; the whole
   card lifts and the icon scales on hover (see .hiw-* rules in globals.css). */

function DiscoverIcon({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g className="hiw-mag">
        <circle cx="21" cy="21" r="11.5" stroke={c} strokeWidth="4.2" />
        <path d="M15.5 21A5.5 5.5 0 0 1 21 15.5" stroke={c} strokeWidth="3.4" strokeLinecap="round" opacity="0.45" />
        <line x1="29.8" y1="29.8" x2="39" y2="39" stroke={c} strokeWidth="4.4" strokeLinecap="round" />
      </g>
      <path className="hiw-spark" style={{ animationDelay: "0.4s" }} d="M38 8.5l1.1 2.9 2.9 1.1-2.9 1.1L38 17.5l-1.1-2.9-2.9-1.1 2.9-1.1z" fill={c} />
    </svg>
  );
}

function JoinIcon({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* a person — join the community */}
      <g className="hiw-join">
        <circle cx="19" cy="16" r="6.5" stroke={c} strokeWidth="3.8" />
        <path d="M8 38c0-7 4.9-12 11-12s11 5 11 12" stroke={c} strokeWidth="3.8" strokeLinecap="round" />
      </g>
      {/* plus — add yourself */}
      <g className="hiw-plus">
        <line x1="37" y1="9" x2="37" y2="19" stroke={c} strokeWidth="3.8" strokeLinecap="round" />
        <line x1="32" y1="14" x2="42" y2="14" stroke={c} strokeWidth="3.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function GrowIcon({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g className="hiw-sprout">
        <path d="M24 39C24 33 24 28 24 21" stroke={c} strokeWidth="3.6" strokeLinecap="round" />
        <path className="hiw-leafL" d="M24 24C19 24 15 21 14 16c6-1 10 2 10 8z" fill={c} />
        <path className="hiw-leafR" d="M24 27c5 0 9-3 10-8-6-1-10 2-10 8z" fill={c} />
      </g>
      <path d="M16 39q8 3 16 0" stroke={c} strokeWidth="3.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const STEPS = [
  {
    tile: "#fdf2ee",
    accent: "var(--coral-deep)",
    Icon: DiscoverIcon,
    t: "1 · Discover",
    d: "Filter missions by cause, distance, date and difficulty. Save the ones you love.",
  },
  {
    tile: "#fdf2ee",
    accent: "var(--coral-deep)",
    Icon: JoinIcon,
    t: "2 · Join",
    d: "Tap to apply. Get approved, message the org, and check in with a QR code on the day.",
  },
  {
    tile: "#fdf2ee",
    accent: "var(--coral-deep)",
    Icon: GrowIcon,
    t: "3 · Grow",
    d: "Track hours, earn badges, download certificates, and share your impact card.",
  },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: "58px 36px 20px", textAlign: "center", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-deep)", letterSpacing: ".08em" }}>HOW IT WORKS</div>
      <h2 style={{ fontSize: 34, fontWeight: 800, margin: "8px 0 36px", letterSpacing: "-.02em" }}>Three taps to real impact</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }} className="hiw-grid">
        {STEPS.map(({ tile, accent, Icon, t, d }) => (
          <div key={t} className="hiw-card" style={{ background: "var(--bg-tint)", border: "1px solid var(--line)", borderRadius: 20, padding: "28px 24px", textAlign: "left" }}>
            <div className="hiw-art" style={{ width: 56, height: 56, borderRadius: 16, background: tile, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
              <Icon c={accent} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, margin: "16px 0 6px" }}>{t}</div>
            <div style={{ fontSize: 14.5, color: "var(--muted-1)", lineHeight: 1.55 }}>{d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
