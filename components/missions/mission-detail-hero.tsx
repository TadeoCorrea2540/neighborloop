import Icon from "@/components/icons";

export default function MissionDetailHero({
  coverImageUrl,
}: {
  coverImageUrl: string | null;
}) {
  if (coverImageUrl) {
    return (
      <div className="md-hero md-hero--image">
        <div
          className="md-hero-image"
          style={{ backgroundImage: `url('${coverImageUrl}')` }}
          aria-hidden="true"
        />
        <div className="md-hero-overlay" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="md-hero md-hero--fallback" aria-hidden="true">
      <div className="md-hero-glow md-hero-glow--a" />
      <div className="md-hero-glow md-hero-glow--b" />
      <div className="md-hero-shine" />
      <div className="md-hero-fallback-mark">
        <Icon name="target" size={28} />
      </div>
    </div>
  );
}
