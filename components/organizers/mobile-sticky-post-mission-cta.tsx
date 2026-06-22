"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MobileStickyPostMissionCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("org-hero-mobile");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("org-has-sticky-cta", visible);
    return () => document.body.classList.remove("org-has-sticky-cta");
  }, [visible]);

  return (
    <div
      className={`org-sticky-cta org-mobile-only${visible ? " org-sticky-cta--visible" : ""}`}
      aria-hidden={!visible}
    >
      <Link href="/auth" className="org-btn-primary">
        Start your mission
      </Link>
    </div>
  );
}
