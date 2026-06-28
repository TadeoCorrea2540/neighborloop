import Link from "next/link";
import DefaultAvatar from "@/components/default-avatar";
import Icon from "@/components/icons";

export default function MissionDetailIdentity({
  title,
  summary,
  organizationName,
  orgSlug,
  orgVerified,
  categoryName,
  difficulty,
  isBeginnerFriendly,
}: {
  title: string;
  summary: string;
  organizationName: string;
  orgSlug: string | null;
  orgVerified: boolean;
  categoryName: string | null;
  difficulty: string | null;
  isBeginnerFriendly: boolean;
}) {
  return (
    <header className="md-identity md-reveal">
      <div className="md-identity-badges">
        {categoryName && <span className="md-pill md-pill--neutral">{categoryName}</span>}
        {difficulty && <span className="md-pill md-pill--neutral">{difficulty}</span>}
        {isBeginnerFriendly && <span className="md-pill md-pill--mint">Beginner-friendly</span>}
      </div>

      <h1 className="md-title">{title}</h1>

      <div className="md-org-row">
        <DefaultAvatar size={38} radius={12} kind="org" />
        <div className="md-org-copy">
          <span className="md-org-label">Hosted by</span>
          {orgSlug ? (
            <Link href={`/org/${orgSlug}`} className="md-org-name">
              {organizationName}
            </Link>
          ) : (
            <span className="md-org-name">{organizationName}</span>
          )}
        </div>
        {orgVerified && (
          <span className="md-verified">
            <Icon name="verified" size={14} />
            Verified
          </span>
        )}
      </div>

      {summary && <p className="md-summary">{summary}</p>}
    </header>
  );
}
