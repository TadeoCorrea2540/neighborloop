import type { CauseKey } from "@/lib/data";

export type VolunteerCause = Exclude<CauseKey, "All">;

const cc = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none" as const,
};

type CauseIconProps = {
  cause: VolunteerCause;
  size?: number;
  className?: string;
};

export function CauseIcon({ cause, size = 14, className }: CauseIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    className,
  };

  switch (cause) {
    case "Food":
      return (
        <svg {...props} fill="none">
          <path d="M3.6 10.6h16.8a8.4 8.4 0 0 1-16.8 0Z" fill="currentColor" />
          <path
            d="M2.4 10.6h19.2M9 5.4c1-1 1-2 0-3M12 5.4c1-1 1-2 0-3M15 5.4c1-1 1-2 0-3"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </svg>
      );
    case "Cleanup":
      return (
        <svg {...props}>
          <g {...cc}>
            <path d="M3 8c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" />
            <path d="M3 13c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" />
            <path d="M3 18c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" />
          </g>
        </svg>
      );
    case "Tutoring":
      return (
        <svg {...props}>
          <path
            d="M12 7.5C10.4 6.2 8 5.7 5 6.1v11.4c3-.4 5.4.1 7 1.4 1.6-1.3 4-1.8 7-1.4V6.1c-3-.4-5.4.1-7 1.4zM12 7.5v11.4"
            {...cc}
          />
        </svg>
      );
    case "Animals":
      return (
        <svg {...props} fill="currentColor">
          <ellipse cx="8" cy="9.7" rx="1.5" ry="1.9" />
          <ellipse cx="12" cy="8.4" rx="1.6" ry="2" />
          <ellipse cx="16" cy="9.7" rx="1.5" ry="1.9" />
          <path d="M12 11.4c2.3 0 4.1 1.6 4.1 3.6 0 1.4-1.1 2.3-2.5 2.3-.8 0-1-.4-1.6-.4s-.8.4-1.6.4c-1.4 0-2.5-.9-2.5-2.3 0-2 1.8-3.6 4.1-3.6z" />
        </svg>
      );
    case "Elderly":
      return (
        <svg {...props} fill="none">
          <path
            d="M12 8 10.8 6.9a1.85 1.85 0 0 0-2.6 2.6L12 13.3l3.8-3.8a1.85 1.85 0 0 0-2.6-2.6z"
            fill="currentColor"
          />
          <path
            d="M4.8 14.6c1.8 2.1 4.5 3.6 7.2 3.6s5.4-1.5 7.2-3.6"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </svg>
      );
    case "Garden":
      return (
        <svg {...props}>
          <g {...cc}>
            <path d="M12 20v-7" />
            <path d="M12 13C9.3 13 7 11 6.5 7.8c3.2-.5 5.5 1.4 5.5 5.2z" />
            <path d="M12.3 15c2.7 0 5-2 5.5-5.2-3.2-.5-5.5 1.4-5.5 5.2z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

export function isVolunteerCause(value: string): value is VolunteerCause {
  return (
    value === "Food" ||
    value === "Cleanup" ||
    value === "Tutoring" ||
    value === "Animals" ||
    value === "Elderly" ||
    value === "Garden"
  );
}
