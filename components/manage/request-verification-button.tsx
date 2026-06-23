"use client";

/**
 * Organizer "Request verification" button (settings page). Submits a pending
 * organization_verifications row for admin review. Shown when the org is
 * unverified (not_required / rejected). Verification never blocks publishing.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { requestVerificationAction } from "@/app/manage/settings/actions";

export default function RequestVerificationButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  function submit() {
    start(async () => {
      const res = await requestVerificationAction();
      if (!res.ok) {
        if (res.code === "auth") return router.push("/auth?next=/manage/settings");
        return show(res.error, "error");
      }
      setDone(true);
      show("Verification requested — an admin will review your organization.", "success");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={pending || done}
        onClick={submit}
        style={{
          fontSize: 13, fontWeight: 700, color: "#fff", background: "#18203b",
          padding: "9px 16px", borderRadius: 11, border: "none",
          cursor: pending || done ? "not-allowed" : "pointer", opacity: pending || done ? 0.7 : 1, whiteSpace: "nowrap",
        }}
      >
        {done ? "Requested ✓" : pending ? "Requesting…" : "Request verification"}
      </button>
      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </>
  );
}
