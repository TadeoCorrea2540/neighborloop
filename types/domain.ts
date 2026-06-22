/**
 * Domain types — UI-friendly models and mappers.
 *
 * These sit between the raw database rows (types/database.generated.ts) and the
 * frontend. The existing mock-data types in lib/data.ts are intentionally left
 * untouched; these domain types describe the shape live Supabase data will take
 * when pages are gradually migrated (see docs/phase-2-backend-foundation.md).
 */

import type {
  MissionRow,
  MissionCategoryRow,
  OrganizationRow,
  ApplicationRow,
  MissionStatus,
  ApplicationStatus,
  VerificationStatus,
  OrganizationType,
} from "./database";

export type {
  MissionStatus,
  ApplicationStatus,
  VerificationStatus,
  OrganizationType,
};

/** A public mission card/detail safe to render anywhere. No private fields. */
export interface MissionSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: MissionStatus;
  categoryId: string | null;
  organizationId: string;
  coverImagePath: string | null;
  isVirtual: boolean;
  locationLabel: string | null;
  city: string | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  volunteerCapacity: number | null;
  estimatedHours: number | null;
  difficulty: string | null;
  isBeginnerFriendly: boolean;
  skills: string[];
  perks: string[];
  publishedAt: string | null;
}

export interface MissionCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconKey: string | null;
  accentColor: string | null;
  sortOrder: number;
}

export interface OrganizationSummary {
  id: string;
  slug: string;
  name: string;
  type: OrganizationType;
  shortDescription: string | null;
  description: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  logoPath: string | null;
  coverImagePath: string | null;
  city: string | null;
  verificationStatus: VerificationStatus;
}

/** Volunteer-facing view of their own application (no organizer_note). */
export interface VolunteerApplication {
  id: string;
  missionId: string;
  status: ApplicationStatus;
  message: string | null;
  appliedAt: string;
  reviewedAt: string | null;
}

/** A volunteer's application joined with its (public) mission, for My Missions. */
export interface VolunteerApplicationWithMission {
  application: VolunteerApplication;
  mission: MissionSummary | null;
}

// ---------- mappers (snake_case row → camelCase domain) ----------

export function toMissionSummary(row: MissionRow): MissionSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    status: row.status,
    categoryId: row.category_id,
    organizationId: row.organization_id,
    coverImagePath: row.cover_image_path,
    isVirtual: row.is_virtual,
    locationLabel: row.location_label,
    city: row.city,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    volunteerCapacity: row.volunteer_capacity,
    estimatedHours: row.estimated_hours,
    difficulty: row.difficulty,
    isBeginnerFriendly: row.is_beginner_friendly,
    skills: row.skills ?? [],
    perks: row.perks ?? [],
    publishedAt: row.published_at,
  };
}

export function toMissionCategory(row: MissionCategoryRow): MissionCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    iconKey: row.icon_key,
    accentColor: row.accent_color,
    sortOrder: row.sort_order,
  };
}

export function toOrganizationSummary(row: OrganizationRow): OrganizationSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.organization_type,
    shortDescription: row.short_description,
    description: row.description,
    websiteUrl: row.website_url,
    instagramUrl: row.instagram_url,
    logoPath: row.logo_path,
    coverImagePath: row.cover_image_path,
    city: row.city,
    verificationStatus: row.verification_status,
  };
}

export function toVolunteerApplication(row: ApplicationRow): VolunteerApplication {
  return {
    id: row.id,
    missionId: row.mission_id,
    status: row.status,
    message: row.message,
    appliedAt: row.applied_at,
    reviewedAt: row.reviewed_at,
  };
}
