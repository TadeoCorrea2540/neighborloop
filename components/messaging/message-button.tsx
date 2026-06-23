"use client";

/**
 * Opens (or creates) the mission conversation for an application, then routes to
 * the thread. Used by volunteers (My Missions) and organizers (applicant rows).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { createConversationForApplicationAction } from "@/app/messages/actions";

export default function MessageButton({
  applicationId,
  basePath,
  label = "Message",
  style,
}: {
  applicationId: string;
  basePath: "/messages" | "/manage/messages";
  label?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);

  function open() {
    start(async () => {
      const res = await createConversationForApplicationAction(applicationId);
      if (!res.ok) {
        if (res.code === "auth") return router.push("/auth");
        setToast({ msg: res.error, tone: "error" });
        setSeq((n) => n + 1);
        return;
      }
      router.push(`${basePath}/${res.conversationId}`);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={pending}
        style={
          style ?? {
            fontSize: 13, fontWeight: 600, color: "#18203b", border: "1px solid rgba(24,32,59,.12)",
            padding: "9px 13px", borderRadius: 11, background: "#fff", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.6 : 1,
          }
        }
      >
        {pending ? "Opening…" : `💬 ${label}`}
      </button>
      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </>
  );
}
