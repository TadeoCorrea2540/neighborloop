"use client";

import { useState } from "react";
import { CauseKey } from "@/lib/data";
import { PreferenceChip, filterMissions } from "@/lib/volunteers-mobile-data";
import MobileVolunteerHero from "./mobile-volunteer-hero";
import QuickMissionPreferences from "./quick-mission-preferences";
import MissionSwipeStack from "./mission-swipe-stack";
import MobileWhyVolunteer from "./mobile-why-volunteer";
import MobileCauseExplorer from "./mobile-cause-explorer";
import MobileVolunteerJourney from "./mobile-volunteer-journey";
import ImpactProfileMobileCard from "./impact-profile-mobile-card";
import CommunityActivityStrip from "./community-activity-strip";
import MobileVolunteerTrustPanel from "./mobile-volunteer-trust-panel";
import MobileVolunteerFaq from "./mobile-volunteer-faq";
import MobileVolunteerFinalCTA from "./mobile-volunteer-final-cta";
import MobileStickyMissionCTA from "./mobile-sticky-mission-cta";

export default function VolunteersMobileExperience() {
  const [cause, setCause] = useState<CauseKey>("All");
  const [prefs, setPrefs] = useState<PreferenceChip[]>([]);
  const missions = filterMissions(cause);

  return (
    <>
      <MobileStickyMissionCTA />
      <MobileVolunteerHero />
      <QuickMissionPreferences selected={prefs} onChange={setPrefs} />
      <MobileWhyVolunteer />
      <MobileCauseExplorer cause={cause} onCauseChange={setCause} />
      <div id="vol-missions">
        <MissionSwipeStack missions={missions} />
      </div>
      <MobileVolunteerJourney />
      <ImpactProfileMobileCard />
      <CommunityActivityStrip />
      <MobileVolunteerTrustPanel />
      <MobileVolunteerFaq />
      <MobileVolunteerFinalCTA />
    </>
  );
}
