"use client";

import { useState } from "react";
import { MissionCategoryId, OrgTypeId } from "@/lib/organizers-mobile-data";
import MobileStickyPostMissionCTA from "./mobile-sticky-post-mission-cta";
import MobileOrganizerHero from "./mobile-organizer-hero";
import OrganizerTypeSelector from "./organizer-type-selector";
import MobileMissionCategoryRail from "./mobile-mission-category-rail";
import OrganizerStartPanel from "./organizer-start-panel";
import OrganizerJourneyMobile from "./organizer-journey-mobile";
import OrganizerBenefitsMobile from "./organizer-benefits-mobile";
import OrganizerMomentumFeed from "./organizer-momentum-feed";
import OrganizerTrustPanel from "./organizer-trust-panel";
import MobileOrganizerFAQ from "./mobile-organizer-faq";
import MobileOrganizerFinalCTA from "./mobile-organizer-final-cta";

export default function OrganizersMobileExperience() {
  const [orgType, setOrgType] = useState<OrgTypeId>("nonprofit");
  const [category, setCategory] = useState<MissionCategoryId>("food");

  return (
    <>
      <MobileStickyPostMissionCTA />
      <MobileOrganizerHero categoryId={category} />
      <OrganizerTypeSelector selected={orgType} onSelect={setOrgType} />
      <MobileMissionCategoryRail selected={category} onSelect={setCategory} />
      <OrganizerStartPanel />
      <OrganizerJourneyMobile />
      <OrganizerBenefitsMobile />
      <OrganizerMomentumFeed />
      <OrganizerTrustPanel />
      <MobileOrganizerFAQ />
      <MobileOrganizerFinalCTA />
    </>
  );
}
