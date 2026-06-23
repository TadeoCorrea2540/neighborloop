"use client";

/**
 * Admin report triage controls (report detail page). Resolve / dismiss with an
 * optional admin-only internal note. Already-closed reports show no controls.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { resolveReportAction, dismissReportAction } from "@/app/admin/reports/actions";

type Mode = null | "resolve" | "dismiss";

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", border: "1px solid rgba(24,32,59,.14)",
  borderRadius: 11, padding: "10px 12px", fontSize: 13.5, outline: "none", background: "#fbfcfe", minHeight: 64, resize: "vertical",
};
function btn(bg: string, color: string, disabled?: boolean): React.CSSProperties {
  return { fontSize: 13.5, fontWeight: 700, padding: "10px 16px", borderRadius: 11, border: "none", background: bg, color, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 };
}

export default function ReportActions({
  reportId,
  status,
}: {
  reportId: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  if (status === "resolved" || status === "dismissed") {
    return (
      <div style={{ background: "#f1f3f8", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "var(--muted-1)" }}>
        This report is <strong>{status}</strong>. No further action needed.
      </div>
    );
  }

  function run(fn: () => Promise<{ ok: boolean; error?: string; code?: string }>, successMsg: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        if (res.code === "auth" || res.code === "role") return router.push("/auth?redirect=/admin/reports");
        return show(res.error ?? "Couldn’t update this report.", "error");
      }
      setMode(null);
      setNote("");
      show(successMsg, "success");
      router.refresh();
    });
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(24,32,59,.06)", padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Triage</div>
      {mode === null ? (
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button type="button" style={btn("#1fae82", "#fff")} onClick={() => setMode("resolve")}>✓ Resolve</button>
          <button type="button" style={btn("#f1f3f8", "var(--muted-1)")} onClick={() => setMode("dismiss")}>Dismiss</button>
        </div>
      ) : (
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#3a425e", display: "block", marginBottom: 6 }}>
            Internal note <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(optional, admin-only)</span>
          </label>
          <textarea style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you decide and why?" />
          <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
            <button
              type="button"
              disabled={pending}
              style={btn(mode === "resolve" ? "#1fae82" : "#18203b", "#fff", pending)}
              onClick={() =>
                run(
                  () => (mode === "resolve" ? resolveReportAction(reportId, note || undefined) : dismissReportAction(reportId, note || undefined)),
                  mode === "resolve" ? "Report resolved." : "Report dismissed."
                )
              }
            >
              {pending ? "Working…" : mode === "resolve" ? "Confirm resolve" : "Confirm dismiss"}
            </button>
            <button type="button" disabled={pending} style={btn("#f1f3f8", "var(--muted-1)", pending)} onClick={() => setMode(null)}>Cancel</button>
          </div>
        </div>
      )}

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
