export default function AchievementSummary({
  unlocked,
  total,
  totalHours,
  completedCount,
  certificatesCount,
  causesCount,
}: {
  unlocked: number;
  total: number;
  totalHours: number;
  completedCount: number;
  certificatesCount: number;
  causesCount: number;
}) {
  const cells = [
    { label: "Badges unlocked", value: `${unlocked}/${total}`, warm: true },
    { label: "Volunteer hours", value: totalHours.toLocaleString() },
    { label: "Completed missions", value: completedCount.toLocaleString(), warm: true },
    { label: "Certificates earned", value: certificatesCount.toLocaleString() },
    { label: "Causes supported", value: causesCount.toLocaleString() },
  ];

  return (
    <div className="badges-summary-grid card-grid-4" role="list" aria-label="Achievement summary">
      {cells.map((c) => (
        <div key={c.label} className="badges-summary-cell" role="listitem">
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: c.warm ? "var(--coral-deep)" : "var(--ink)",
              lineHeight: 1.1,
            }}
          >
            {c.value}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted-3)", fontWeight: 600, marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}
