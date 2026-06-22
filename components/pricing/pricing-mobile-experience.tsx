"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BillingCycle,
  PRICING_FOOTNOTE,
  PRICING_PLANS,
  planPrice,
} from "@/lib/pricing-mobile-data";

export default function PricingMobileExperience() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <>
      <header className="price-header">
        <div className="price-kicker">For organizers &amp; community groups</div>
        <h1 className="price-title">Plans that scale with your impact</h1>
        <p className="price-lead">
          Free forever to get started. Upgrade when you need analytics, attendance, and impact reports.
        </p>

        <div className="price-billing" role="tablist" aria-label="Billing cycle">
          <button
            type="button"
            role="tab"
            aria-selected={billing === "monthly"}
            className={`price-billing-btn${billing === "monthly" ? " price-billing-btn--on" : ""}`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={billing === "annual"}
            className={`price-billing-btn${billing === "annual" ? " price-billing-btn--on" : ""}`}
            onClick={() => setBilling("annual")}
          >
            Annual
          </button>
          <span className="price-billing-save">Save 20%</span>
        </div>
      </header>

      <section className="price-plans" aria-label="Pricing plans">
        {PRICING_PLANS.map((plan) => {
          const { amount, suffix } = planPrice(plan.id, billing);

          return (
            <article
              key={plan.id}
              className={`price-card${plan.highlighted ? " price-card--highlight" : ""}`}
            >
              {plan.badge ? (
                <span className="price-card-badge">{plan.badge}</span>
              ) : null}

              <div className="price-card-head">
                <h2 className="price-card-name">{plan.name}</h2>
                <p className="price-card-tagline">{plan.tagline}</p>
              </div>

              <div className="price-card-price">
                <span className="price-card-amount">{amount}</span>
                <span className="price-card-suffix">{suffix}</span>
              </div>

              <ul className="price-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <span className="price-check" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
                {plan.unavailable?.map((f) => (
                  <li key={f} className="price-feature--muted">
                    <span className="price-dash" aria-hidden="true">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.primary ? (
                <Link href={plan.ctaHref} className="price-btn-primary">
                  {plan.cta}
                </Link>
              ) : (
                <Link href={plan.ctaHref} className="price-btn-secondary">
                  {plan.cta}
                </Link>
              )}
            </article>
          );
        })}
      </section>

      <section className="price-trust" aria-labelledby="price-trust-heading">
        <h2 id="price-trust-heading" className="price-trust-title">
          What every plan includes
        </h2>
        <ul className="price-trust-list">
          <li>Verified organization badge</li>
          <li>Volunteer messaging</li>
          <li>Bank-grade security</li>
        </ul>
        <p className="price-footnote">{PRICING_FOOTNOTE}</p>
      </section>

      <section className="price-final">
        <div className="price-final-inner">
          <h2>Start free. Upgrade when you&apos;re ready.</h2>
          <p>Post your first mission in minutes — no credit card required.</p>
          <Link href="/auth" className="price-btn-primary">
            Get started free
          </Link>
        </div>
      </section>
    </>
  );
}
