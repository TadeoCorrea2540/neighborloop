import ExploreMissionCard from "@/components/explore/explore-mission-card";
import type { MissionCard } from "@/lib/data/mission-cards";

export default function RecommendedMissionCard({ card }: { card: MissionCard }) {
  return (
    <ExploreMissionCard card={card} layout="compact" className="vol-rec-card lift" showCta />
  );
}
