"use client";

import Link from "next/link";
import Logo from "@/components/logo";
import "./auth-visual-panel.css";

export function AuthVisualPanel() {
  return (
    <div className="auth-aside auth-visual-panel">
      <span className="auth-visual-ambient" aria-hidden />

      <Link href="/" className="auth-visual-brand">
        <Logo size={34} />
        <span>NeighborLoop</span>
      </Link>

      <figure className="auth-visual-figure">
        <div className="auth-visual-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loginn.png"
            alt="Volunteers collaborating in the neighborhood"
            className="auth-visual-img"
          />
          <span className="auth-visual-shade" aria-hidden />
          <figcaption className="auth-visual-caption">
            <span className="auth-visual-caption-stat">12,480+</span>
            <span className="auth-visual-caption-label">
              neighbors volunteered this year
            </span>
          </figcaption>
        </div>
      </figure>

      <div className="auth-visual-copy">
        <h2>Real impact, right where you live.</h2>
        <p>
          Free for volunteers. Verified organizations. Your data stays yours.
        </p>
        <div className="auth-visual-trust">
          <span>Bank-grade security</span>
          <span>Verified organizations</span>
        </div>
      </div>
    </div>
  );
}
