/**
 * Profile repository — adapter seam for profile + saved-mission reads.
 * Delegates to the Supabase data layer (see mission-repository for rationale).
 */

import "server-only";
import { getProfileById, getSavedMissionIdsForUser } from "@/lib/data/profiles";
import { getVolunteerApplications } from "@/lib/data/applications";

export const profileRepository = {
  getById: getProfileById,
  getSavedMissionIds: getSavedMissionIdsForUser,
  getApplications: getVolunteerApplications,
};

export type ProfileRepository = typeof profileRepository;
