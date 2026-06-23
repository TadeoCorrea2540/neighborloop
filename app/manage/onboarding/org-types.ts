/**
 * Organization-type options for onboarding. Plain module (NOT "use server") so
 * it can be imported by both the client form and the server action — a
 * "use server" file may only export async functions, so this can't live there.
 */
import type { OrganizationType } from "@/types/database";

export const ORG_TYPES: { value: OrganizationType; label: string }[] = [
  { value: "nonprofit", label: "Nonprofit" },
  { value: "community_group", label: "Community group" },
  { value: "school", label: "School" },
  { value: "university", label: "University" },
  { value: "student_club", label: "Student club" },
  { value: "faith_group", label: "Faith group" },
  { value: "local_business", label: "Local business" },
  { value: "family_individual", label: "Family / individual" },
  { value: "other", label: "Other" },
];
