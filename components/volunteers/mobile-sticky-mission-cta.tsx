"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MobileStickyMissionCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("vol-hero-mobile");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("vol-has-sticky-cta", visible);
    return () => document.body.classList.remove("vol-has-sticky-cta");
  }, [visible]);

  return (
    <div
      className={`vol-sticky-cta vol-mobile-only${visible ? " vol-sticky-cta--visible" : ""}`}
      aria-hidden={!visible}
    >
      <Link href="/explore" className="vol-btn-primary">
        Find missions near you
      </Link>
    </div>
  );
}
