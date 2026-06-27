import type { IconName } from "@/components/icons";

export const MILESTONE_ICON: Record<string, IconName> = {
  first_mission: "sparkles",
  five_missions: "target",
  ten_hours: "clock",
  fifty_hours: "bar-chart",
  hundred_hours: "award",
  three_causes: "compass",
  certified: "check-circle",
};

export const MILESTONE_DESC: Record<string, string> = {
  first_mission: "Complete your first mission with confirmed attendance.",
  five_missions: "Show up consistently across five completed missions.",
  ten_hours: "Reach ten confirmed volunteer hours in your community.",
  fifty_hours: "Build deep impact with fifty hours of service.",
  hundred_hours: "Join the century club with one hundred volunteer hours.",
  three_causes: "Support missions across three different causes.",
  certified: "Earn your first certificate from a completed mission.",
};

export const MILESTONE_CATEGORY: Record<string, string> = {
  first_mission: "Mission milestones",
  five_missions: "Mission milestones",
  ten_hours: "Hours milestones",
  fifty_hours: "Hours milestones",
  hundred_hours: "Hours milestones",
  three_causes: "Cause milestones",
  certified: "Certificate milestones",
};

/** Visual journey order for the milestone path */
export const JOURNEY_ORDER = [
  "first_mission",
  "ten_hours",
  "certified",
  "five_missions",
  "three_causes",
  "fifty_hours",
  "hundred_hours",
] as const;

export const CATEGORY_ORDER = [
  "Mission milestones",
  "Hours milestones",
  "Cause milestones",
  "Certificate milestones",
] as const;
