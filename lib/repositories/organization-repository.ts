/**
 * Organization repository — adapter seam for organization reads.
 * Delegates to the Supabase data layer (see mission-repository for rationale).
 */

import "server-only";
import {
  getOrganizationBySlug,
  getOrganizationPublicMissions,
} from "@/lib/data/organizations";
import { getOrganizationApplications } from "@/lib/data/applications";

export const organizationRepository = {
  getBySlug: getOrganizationBySlug,
  getPublicMissions: getOrganizationPublicMissions,
  getApplications: getOrganizationApplications,
};

export type OrganizationRepository = typeof organizationRepository;
