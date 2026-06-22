"use client";

import { useEffect, useState } from "react";
import { LIVE } from "@/lib/data";
import { useInView } from "./use-in-view";

const fmt = (n: number) => n.toLocaleString();

export default function MobileImpactBlock() {
  const { ref, inView } = useInView<HTMLElement>();
  const target = LIVE.volunteers;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }
    const duration = 1400;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <section
      ref={ref}
      className={`home-impact-mobile home-mobile-only home-reveal${inView ? " home-reveal--in" : ""}`}
      aria-labelledby="mobile-impact-heading"
    >
      <div className="home-impact-mobile-ring" aria-hidden="true">
        <span className="home-impact-mobile-ring-dot" />
        <div className="home-impact-mobile-stat">{fmt(value)}+</div>
      </div>
      <div id="mobile-impact-heading" className="home-impact-mobile-label">
        neighbors volunteered this year
      </div>
      <p className="home-impact-mobile-quote">
        One afternoon can help a family, a shelter, a classroom — or your own
        neighborhood.
      </p>
    </section>
  );
}
