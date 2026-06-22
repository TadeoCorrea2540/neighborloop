/**
 * Mission repository — the seam pages import from.
 *
 * Today it delegates to the Supabase data layer. This indirection is the
 * adapter point for the gradual mock→live migration: a page keeps importing
 * `missionRepository`, and we swap the implementation behind it (e.g. a
 * mock-backed impl) without touching the page. See
 * docs/phase-2-backend-foundation.md → "Mock data transition strategy".
 */

import "server-only";
import {
  getPublishedMissions,
  getFeaturedMissions,
  getMissionBySlug,
  getMissionsByCategory,
  getMissionCategories,
  getOrganizationMissions,
} from "@/lib/data/missions";

export const missionRepository = {
  getPublished: getPublishedMissions,
  getFeatured: getFeaturedMissions,
  getBySlug: getMissionBySlug,
  getByCategory: getMissionsByCategory,
  getCategories: getMissionCategories,
  getForOrganization: getOrganizationMissions,
};

export type MissionRepository = typeof missionRepository;
