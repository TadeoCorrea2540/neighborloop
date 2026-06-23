"use client";

/**
 * Organizer check-in QR controls. Generating returns the raw token ONCE (only a
 * hash is stored), so the QR + link are shown right after generate/regenerate;
 * on a later visit the organizer regenerates to display it again (the old code
 * is deactivated). Keeps the qrcode dependency server-side (action returns a
 * data URL).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import {
  generateCheckInTokenAction,
  deactivateCheckInTokenAction,
} from "@/app/manage/attendance/actions";

export default function CheckInQr({
  missionId,
  hasActiveToken,
  activeTokenId,
}: {
  missionId: string;
  hasActiveToken: boolean;
  activeTokenId: string | null;
}) {
  const router = useRouter();
  const [qr, setQr] = useState<{ url: string; qrDataUrl: string } | null>(null);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  function generate() {
    start(async () => {
      const res = await generateCheckInTokenAction(missionId);
      if (!res.ok) {
        if (res.code === "auth" || res.code === "role") return router.push("/auth?redirect=/manage/attendance");
        return show(res.error, "error");
      }
      setQr({ url: res.url, qrDataUrl: res.qrDataUrl });
      show("Check-in QR ready.", "success");
      router.refresh();
    });
  }

  function deactivate() {
    if (!activeTokenId) return;
    if (!window.confirm("Deactivate this check-in code? Existing QR printouts will stop working.")) return;
    start(async () => {
      const res = await deactivateCheckInTokenAction(activeTokenId);
      if (!res.ok) return show(res.error, "error");
      setQr(null);
      show("Check-in code deactivated.", "success");
      router.refresh();
    });
  }

  function copy() {
    if (!qr) return;
    navigator.clipboard?.writeText(qr.url).then(() => show("Link copied.", "success"), () => show("Couldn’t copy.", "error"));
  }

  const btn = (bg: string, color: string): React.CSSProperties => ({
    fontSize: 14, fontWeight: 700, color, background: bg, padding: "11px 18px", borderRadius: 12, border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1,
  });

  return (
    <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 18, padding: 24 }}>
      {qr ? (
        <div style={{ textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr.qrDataUrl} alt="Mission check-in QR code" width={240} height={240} style={{ borderRadius: 14, border: "1px solid rgba(24,32,59,.08)" }} />
          <p style={{ fontSize: 13.5, color: "var(--muted-2)", margin: "14px 0 6px", fontWeight: 600 }}>Volunteers scan this to check in.</p>
          <code style={{ display: "block", fontSize: 12, color: "var(--muted-3)", wordBreak: "break-all", background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 10, padding: "8px 10px", margin: "0 auto 14px", maxWidth: 420 }}>{qr.url}</code>
          <div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={copy} style={btn("#18203b", "#fff")}>Copy link</button>
            <button type="button" disabled={pending} onClick={generate} style={btn("#f1f3f8", "var(--muted-1)")}>Regenerate</button>
            <button type="button" disabled={pending} onClick={deactivate} style={btn("#ffeae6", "#c0392b")}>Deactivate</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🔳</div>
          {hasActiveToken ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700 }}>A check-in code is active</div>
              <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0 16px" }}>
                For security the code is shown only once. Regenerate to display & print it again (the old one stops working), or deactivate it.
              </p>
              <div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}>
                <button type="button" disabled={pending} onClick={generate} className="btn-coral" style={btn("var(--coral)", "#fff")}>{pending ? "Working…" : "Regenerate & show QR"}</button>
                <button type="button" disabled={pending} onClick={deactivate} style={btn("#ffeae6", "#c0392b")}>Deactivate</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 700 }}>No check-in QR yet</div>
              <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0 16px" }}>Generate a QR code volunteers can scan to check themselves in.</p>
              <button type="button" disabled={pending} onClick={generate} className="btn-coral" style={btn("var(--coral)", "#fff")}>{pending ? "Working…" : "Generate check-in QR"}</button>
            </>
          )}
        </div>
      )}
      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
