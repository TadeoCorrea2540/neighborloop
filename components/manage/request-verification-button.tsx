"use client";

/**
 * Organizer "Request verification" (settings page). Submits a pending
 * organization_verifications row for admin review, with an OPTIONAL supporting
 * document (PDF/image) attached at request time — organizers can't update the
 * row afterward (admin-only). Shown when the org is unverified. Verification
 * never blocks publishing.
 */
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { requestVerificationAction } from "@/app/manage/settings/actions";

export default function RequestVerificationButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [docName, setDocName] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  function submit() {
    start(async () => {
      const file = inputRef.current?.files?.[0];
      let fd: FormData | undefined;
      if (file) {
        fd = new FormData();
        fd.set("document", file);
      }
      const res = await requestVerificationAction(fd);
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
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <label style={{ fontSize: 12.5, color: "var(--muted-1)", cursor: "pointer" }}>
        <input ref={inputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setDocName(e.target.files?.[0]?.name ?? null)} style={{ display: "none" }} />
        <span style={{ fontWeight: 700, color: "var(--blue)" }}>{docName ? `📎 ${docName}` : "📎 Attach document (optional)"}</span>
      </label>
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
    </div>
  );
}
