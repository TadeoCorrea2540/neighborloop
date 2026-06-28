import ExploreMissionCard from "@/components/explore/explore-mission-card";
import type { MissionCard } from "@/lib/data/mission-cards";

export default function RecommendedMissionCard({
  card,
  index = 0,
}: {
  card: MissionCard;
  index?: number;
}) {
  return (
    <ExploreMissionCard
      card={card}
      index={index}
      layout="compact"
      className="vol-rec-card"
      showCta
    />
  );
}
