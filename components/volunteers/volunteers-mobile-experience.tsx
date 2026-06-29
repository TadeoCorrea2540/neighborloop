"use client";

import { useMemo, useState } from "react";
import { CauseKey } from "@/lib/data";
import type { MissionCard } from "@/lib/data/mission-cards";
import {
  PreferenceChip,
  causeMissionCounts,
  filterVolunteerMissionCards,
} from "@/lib/volunteers-mobile-data";
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
import "../../app/explore/explore-mission-cards.css";

export default function VolunteersMobileExperience({
  missionCards,
}: {
  missionCards: MissionCard[];
}) {
  const [cause, setCause] = useState<CauseKey>("All");
  const [prefs, setPrefs] = useState<PreferenceChip[]>([]);
  const causeCounts = useMemo(() => causeMissionCounts(missionCards), [missionCards]);
  const missions = useMemo(
    () => filterVolunteerMissionCards(cause, missionCards),
    [cause, missionCards]
  );

  return (
    <>
      <MobileStickyMissionCTA />
      <MobileVolunteerHero spotlight={missionCards[0] ?? null} totalCount={missionCards.length} />
      <QuickMissionPreferences selected={prefs} onChange={setPrefs} totalCount={missions.length} />
      <MobileWhyVolunteer />
      <MobileCauseExplorer cause={cause} onCauseChange={setCause} causeCounts={causeCounts} />
      <div id="vol-missions">
        <MissionSwipeStack cards={missions} />
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
