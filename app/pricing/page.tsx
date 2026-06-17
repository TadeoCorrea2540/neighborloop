"use client";

import { useState } from "react";
import PublicNav from "@/components/public-nav";
import { PRICING } from "@/lib/data";

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const proPrice = billing === "monthly" ? PRICING.monthly.pro : PRICING.annual.pro;
  const impactPrice = billing === "monthly" ? PRICING.monthly.impact : PRICING.annual.impact;
  const billLabel = billing === "monthly" ? "/month" : "/mo · billed yearly";

  const seg = (active: boolean): React.CSSProperties => ({
    fontSize: 14,
    fontWeight: 700,
    padding: "8px 18px",
    borderRadius: 9,
    cursor: "pointer",
    transition: ".18s",
    color: active ? "var(--ink)" : "var(--muted-3)",
    background: active ? "#fff" : "transparent",
    boxShadow: active ? "0 6px 14px -8px rgba(24,32,59,.35)" : undefined,
  });

  const check = (muted = false): React.CSSProperties => ({
    display: "flex",
    gap: 10,
    fontSize: 14,
    color: muted ? "var(--muted-3)" : "#3a425e",
  });

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <PublicNav />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* header */}
        <div
          style={{
            padding: "54px 36px 24px",
            textAlign: "center",
            background: "linear-gradient(180deg,#fdf2ee,#fff)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-deep)", letterSpacing: ".08em" }}>
            FOR NONPROFITS, SCHOOLS &amp; COMMUNITY GROUPS
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-.02em", margin: "10px 0 14px" }}>
            Plans that scale with your impact
          </h2>
          <p style={{ fontSize: 17, color: "var(--muted-1)", margin: "0 auto 24px", maxWidth: 520 }}>
            Free forever to get started. Upgrade when you&apos;re ready for analytics, attendance and
            impact reports.
          </p>
          <div
            style={{
              display: "inline-flex",
              background: "#f1f3f8",
              borderRadius: 13,
              padding: 5,
              gap: 4,
              alignItems: "center",
            }}
          >
            <span onClick={() => setBilling("monthly")} style={seg(billing === "monthly")}>
              Monthly
            </span>
            <span onClick={() => setBilling("annual")} style={seg(billing === "annual")}>
              Annual
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--mint)",
                background: "#dff6ea",
                padding: "4px 9px",
                borderRadius: 99,
                marginLeft: 2,
              }}
            >
              Save 20%
            </span>
          </div>
        </div>

        {/* plans */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
            padding: "24px 36px 20px",
          }}
          className="card-grid-3"
        >
          {/* Community */}
          <div
            style={{
              border: "1px solid rgba(24,32,59,.1)",
              borderRadius: 22,
              padding: "28px 26px",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18 }}>Community</div>
            <div style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "4px 0 16px" }}>
              For small grassroots groups
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.02em" }}>$0</span>
              <span style={{ fontSize: 14, color: "var(--muted-3)" }}>/forever</span>
            </div>
            <div style={{ marginTop: 18, height: 1, background: "rgba(24,32,59,.07)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 11, margin: "18px 0 22px" }}>
              <div style={check()}>
                <span style={{ color: "var(--mint)" }}>✓</span> Post up to 2 active missions
              </div>
              <div style={check()}>
                <span style={{ color: "var(--mint)" }}>✓</span> Basic volunteer list
              </div>
              <div style={check()}>
                <span style={{ color: "var(--mint)" }}>✓</span> Manual check-in
              </div>
              <div style={check(true)}>
                <span>—</span> Analytics &amp; reports
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                border: "1.5px solid rgba(24,32,59,.14)",
                fontWeight: 700,
                fontSize: 14.5,
                padding: 12,
                borderRadius: 13,
                cursor: "pointer",
              }}
            >
              Start free
            </div>
          </div>

          {/* Pro (highlight) */}
          <div
            style={{
              border: "2px solid #ff6f5e",
              borderRadius: 22,
              padding: "28px 26px",
              position: "relative",
              boxShadow: "0 28px 50px -28px rgba(255,111,94,.5)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -13,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#ff6f5e",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 999,
              }}
            >
              ★ Most popular
            </span>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Pro</div>
            <div style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "4px 0 16px" }}>
              For active nonprofits
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.02em", color: "var(--coral-deep)" }}>
                {proPrice}
              </span>
              <span style={{ fontSize: 14, color: "var(--muted-3)" }}>{billLabel}</span>
            </div>
            <div style={{ marginTop: 18, height: 1, background: "rgba(24,32,59,.07)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 11, margin: "18px 0 22px" }}>
              {[
                "Unlimited missions",
                "QR code attendance",
                "Applicant management",
                "Analytics dashboard",
                "Priority support",
              ].map((f) => (
                <div key={f} style={check()}>
                  <span style={{ color: "var(--mint)" }}>✓</span> {f}
                </div>
              ))}
            </div>
            <div
              className="btn-coral"
              style={{
                textAlign: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14.5,
                padding: 13,
                borderRadius: 13,
                boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
              }}
            >
              Choose Pro
            </div>
          </div>

          {/* Impact */}
          <div
            style={{
              border: "1px solid rgba(24,32,59,.1)",
              borderRadius: 22,
              padding: "28px 26px",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18 }}>Impact</div>
            <div style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "4px 0 16px" }}>
              For large orgs &amp; school districts
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.02em" }}>{impactPrice}</span>
              <span style={{ fontSize: 14, color: "var(--muted-3)" }}>{billLabel}</span>
            </div>
            <div style={{ marginTop: 18, height: 1, background: "rgba(24,32,59,.07)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 11, margin: "18px 0 22px" }}>
              {[
                "Everything in Pro",
                "Impact reports & PDF export",
                "Multi-team accounts",
                "API & data export",
                "Dedicated success manager",
              ].map((f) => (
                <div key={f} style={check()}>
                  <span style={{ color: "var(--mint)" }}>✓</span> {f}
                </div>
              ))}
            </div>
            <div
              style={{
                textAlign: "center",
                border: "1.5px solid rgba(24,32,59,.14)",
                fontWeight: 700,
                fontSize: 14.5,
                padding: 12,
                borderRadius: 13,
                cursor: "pointer",
              }}
            >
              Talk to sales
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "6px 0 48px", fontSize: 13.5, color: "var(--muted-3)" }}>
          All plans include verified-org badge, messaging, and bank-grade security. Nonprofits get 30%
          off annual.
        </div>
      </div>
    </div>
  );
}
