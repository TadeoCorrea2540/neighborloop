import { PRICING } from "@/lib/data";

export type BillingCycle = "monthly" | "annual";

export type PricingPlanId = "community" | "pro" | "impact";

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  tagline: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
  unavailable?: string[];
  cta: string;
  ctaHref: string;
  primary?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "community",
    name: "Community",
    tagline: "For small grassroots groups",
    features: [
      "Post up to 2 active missions",
      "Basic volunteer list",
      "Manual check-in",
    ],
    unavailable: ["Analytics & reports"],
    cta: "Start free",
    ctaHref: "/auth",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For active nonprofits",
    highlighted: true,
    badge: "Most popular",
    features: [
      "Unlimited missions",
      "QR code attendance",
      "Applicant management",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Choose Pro",
    ctaHref: "/auth",
    primary: true,
  },
  {
    id: "impact",
    name: "Impact",
    tagline: "For large orgs & school districts",
    features: [
      "Everything in Pro",
      "Impact reports & PDF export",
      "Multi-team accounts",
      "API & data export",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
    ctaHref: "/auth",
  },
];

export function planPrice(
  id: PricingPlanId,
  billing: BillingCycle
): { amount: string; suffix: string } {
  if (id === "community") {
    return { amount: "$0", suffix: "/forever" };
  }
  if (id === "pro") {
    return {
      amount: billing === "monthly" ? PRICING.monthly.pro : PRICING.annual.pro,
      suffix: billing === "monthly" ? "/month" : "/mo · billed yearly",
    };
  }
  return {
    amount: billing === "monthly" ? PRICING.monthly.impact : PRICING.annual.impact,
    suffix: billing === "monthly" ? "/month" : "/mo · billed yearly",
  };
}

export const PRICING_FOOTNOTE =
  "All plans include verified-org badge, messaging, and bank-grade security. Nonprofits get 30% off annual.";
