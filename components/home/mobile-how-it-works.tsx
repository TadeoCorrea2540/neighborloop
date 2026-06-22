"use client";

import { useInView } from "./use-in-view";

function StepIcon({ type }: { type: "explore" | "join" | "impact" }) {
  const c = "var(--coral-deep)";
  if (type === "explore") {
    return (
      <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="21" cy="21" r="11.5" stroke={c} strokeWidth="4.2" />
        <line x1="29.8" y1="29.8" x2="39" y2="39" stroke={c} strokeWidth="4.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "join") {
    return (
      <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="19" cy="16" r="6.5" stroke={c} strokeWidth="3.8" />
        <path d="M8 38c0-7 4.9-12 11-12s11 5 11 12" stroke={c} strokeWidth="3.8" strokeLinecap="round" />
        <line x1="37" y1="9" x2="37" y2="19" stroke={c} strokeWidth="3.8" strokeLinecap="round" />
        <line x1="32" y1="14" x2="42" y2="14" stroke={c} strokeWidth="3.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 39C24 33 24 28 24 21" stroke={c} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M24 24C19 24 15 21 14 16c6-1 10 2 10 8z" fill={c} />
      <path d="M24 27c5 0 9-3 10-8-6-1-10 2-10 8z" fill={c} />
    </svg>
  );
}

const STEPS = [
  {
    icon: "explore" as const,
    title: "Pick a cause",
    desc: "Choose something that actually feels personal to you.",
  },
  {
    icon: "join" as const,
    title: "Join a mission",
    desc: "Find a time and place near you, in a couple of taps.",
  },
  {
    icon: "impact" as const,
    title: "Show up",
    desc: "Meet people, help out, and track your real impact.",
  },
];

export default function MobileHowItWorks() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="home-hiw-mobile home-mobile-only"
      aria-labelledby="mobile-hiw-heading"
      tabIndex={-1}
    >
      <div className="home-section-title">How it works</div>
      <h2 id="mobile-hiw-heading" className="home-section-heading">
        From idea to impact in three steps
      </h2>
      <ol className={`home-hiw-mobile-steps${inView ? " home-hiw-mobile-steps--in" : ""}`}>
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className={`home-hiw-mobile-step home-reveal${inView ? " home-reveal--in" : ""}`}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            <div className="home-hiw-mobile-icon" aria-hidden="true">
              <StepIcon type={step.icon} />
              <span className="home-hiw-mobile-num">{i + 1}</span>
            </div>
            <div>
              <h3 className="home-hiw-mobile-step-title">{step.title}</h3>
              <p className="home-hiw-mobile-step-desc">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
