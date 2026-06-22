"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home-hero-mobile");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("home-has-sticky-cta", visible);
    return () => document.body.classList.remove("home-has-sticky-cta");
  }, [visible]);

  return (
    <div
      className={`home-sticky-cta home-mobile-only${visible ? " home-sticky-cta--visible" : ""}`}
      aria-hidden={!visible}
    >
      <Link href="/explore" className="home-btn-primary">
        Find Missions
      </Link>
    </div>
  );
}
