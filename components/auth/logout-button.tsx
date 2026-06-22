"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/auth/actions";

/** Signs the user out via the server action, then redirects to /auth. */
export default function LogoutButton({
  label = "Log out",
  style,
  className,
}: {
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={className}
      onClick={() => startTransition(() => void signOutAction())}
      disabled={pending}
      style={{
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.6 : 1,
        ...style,
      }}
    >
      {pending ? "Signing out…" : label}
    </button>
  );
}
