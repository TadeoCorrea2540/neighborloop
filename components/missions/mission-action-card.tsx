import { MissionDateLabel, MissionMetaTile } from "@/components/mission-meta-label";
import MissionActions from "@/components/volunteer/mission-actions";
import type { ApplicationStatus } from "@/types/database";
import type { AttendanceStatus } from "@/lib/data/attendance";

type ViewerRole = "anon" | "volunteer" | "organizer" | "admin";

export default function MissionActionCard({
  missionId,
  missionSlug,
  role,
  initialStatus,
  initialApplicationId,
  initialSaved,
  attendanceStatus,
  hoursCredited,
  certificateId,
  date,
  time,
  locationDisplay,
  isVirtual,
  estimatedHours,
  spotsLeft,
  spotsTotal,
  capacityUnlimited,
}: {
  missionId: string;
  missionSlug: string;
  role: ViewerRole;
  initialStatus: ApplicationStatus | null;
  initialApplicationId: string | null;
  initialSaved: boolean;
  attendanceStatus: AttendanceStatus | null;
  hoursCredited: number | null;
  certificateId: string | null;
  date: string;
  time: string;
  locationDisplay: string;
  isVirtual: boolean;
  estimatedHours: number | null;
  spotsLeft: number;
  spotsTotal: number;
  capacityUnlimited: boolean;
}) {
  const isFull = !capacityUnlimited && spotsLeft <= 0;
  const pct = capacityUnlimited
    ? 100
    : spotsTotal > 0
    ? Math.round((spotsLeft / spotsTotal) * 100)
    : 0;

  const spotsLabel = capacityUnlimited
    ? "Open capacity"
    : isFull
    ? "Mission full"
    : `${spotsLeft} of ${spotsTotal} spots remaining`;

  return (
    <aside className="md-action-card md-reveal md-reveal--delay">
      <div className="md-action-accent" aria-hidden="true" />

      <div className="md-action-meta">
        <div className="md-action-row">
          <MissionMetaTile name="calendar" background="linear-gradient(180deg,#fff8f2,#fff0e6)" />
          <div>
            <div className="md-action-label">Date &amp; time</div>
            <div className="md-action-value">
              <MissionDateLabel>{date}</MissionDateLabel>
              {time ? <span className="md-action-sub"> · {time}</span> : null}
            </div>
          </div>
        </div>

        <div className="md-action-row">
          <MissionMetaTile name={isVirtual ? "globe" : "pin"} background="linear-gradient(180deg,#fff8f2,#fff0e6)" />
          <div>
            <div className="md-action-label">Location</div>
            <div className="md-action-value">{locationDisplay}</div>
          </div>
        </div>

        {estimatedHours != null && (
          <div className="md-action-row">
            <MissionMetaTile name="clock" background="linear-gradient(180deg,#fff8f2,#fff0e6)" />
            <div>
              <div className="md-action-label">Estimated time</div>
              <div className="md-action-value">~{estimatedHours} hours</div>
            </div>
          </div>
        )}

        <div className="md-action-row">
          <MissionMetaTile name="check-circle" background="linear-gradient(180deg,#eef8f2,#e4f5eb)" />
          <div className="md-action-capacity">
            <div className="md-action-label">Spots</div>
            <div className={`md-action-value${isFull ? " md-action-value--full" : ""}`}>{spotsLabel}</div>
            <div className="md-capacity-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={spotsLabel}>
              <span
                className={`md-capacity-fill${isFull ? " md-capacity-fill--full" : ""}`}
                style={{ width: `${Math.max(8, pct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <MissionActions
        missionId={missionId}
        missionSlug={missionSlug}
        role={role}
        initialStatus={initialStatus}
        initialApplicationId={initialApplicationId}
        initialSaved={initialSaved}
        attendanceStatus={attendanceStatus}
        hoursCredited={hoursCredited}
        certificateId={certificateId}
      />
    </aside>
  );
}
