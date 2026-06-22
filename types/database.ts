/**
 * Convenience aliases over the generated Supabase types.
 *
 * `types/database.generated.ts` is produced by `npm run db:types` and uses the
 * standard nested shape (`Database["public"]["Tables"][T]["Row"]`, etc.). This
 * file gives the rest of the codebase short, stable names (`MissionRow`,
 * `ApplicationStatus`, …) that survive regeneration. Import row/enum types from
 * here — never edit the generated file by hand.
 */

import type { Database } from "./database.generated";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// ---------- row aliases ----------
export type ProfileRow = Tables<"profiles">;
export type UserRoleRow = Tables<"user_roles">;
export type MissionCategoryRow = Tables<"mission_categories">;
export type OrganizationRow = Tables<"organizations">;
export type OrganizationMemberRow = Tables<"organization_members">;
export type OrganizationVerificationRow = Tables<"organization_verifications">;
export type MissionRow = Tables<"missions">;
export type MissionPrivateDetailRow = Tables<"mission_private_details">;
export type ApplicationRow = Tables<"applications">;
export type SavedMissionRow = Tables<"saved_missions">;
export type ReportRow = Tables<"reports">;
export type AuditEventRow = Tables<"audit_events">;

// ---------- enum aliases ----------
export type AppRole = Enums<"app_role">;
export type OrganizationType = Enums<"organization_type">;
export type VerificationStatus = Enums<"verification_status">;
export type MissionStatus = Enums<"mission_status">;
export type ApplicationStatus = Enums<"application_status">;

export type { Database };
