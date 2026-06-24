"use client";

export default function ImpactProgressRing({
  percent,
  label,
  sub,
}: {
  percent: number;
  label: string;
  sub: string;
}) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg className="vol-progress-ring" width={88} height={88} viewBox="0 0 88 88" aria-hidden>
        <circle cx={44} cy={44} r={r} fill="none" stroke="#f1f3f8" strokeWidth={8} />
        <circle
          cx={44}
          cy={44}
          r={r}
          fill="none"
          stroke="url(#volGoalGrad)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
        />
        <defs>
          <linearGradient id="volGoalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff8a5c" />
            <stop offset="100%" stopColor="#ff5e7a" />
          </linearGradient>
        </defs>
        <text
          x="44"
          y="44"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="800"
          fill="#18203b"
        >
          {label}
        </text>
      </svg>
      <span style={{ fontSize: 11, color: "var(--muted-3)", fontWeight: 600 }}>{sub}</span>
    </div>
  );
}
