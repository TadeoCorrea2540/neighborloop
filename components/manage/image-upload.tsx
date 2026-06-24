"use client";

/**
 * Reusable image upload control. The parent (a client component) passes a bound
 * server action via `upload`. Validates nothing client-side beyond a preview —
 * the server action enforces type/size + storage RLS. Shows current image,
 * local preview, and a toast on result.
 */
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";

type Result = { ok: boolean; error?: string; code?: string };

export default function ImageUpload({
  label,
  hint,
  currentUrl,
  shape = "rect",
  upload,
  onRemove,
}: {
  label: string;
  hint?: string;
  currentUrl: string | null;
  shape?: "rect" | "circle";
  upload: (fd: FormData) => Promise<Result>;
  onRemove?: () => Promise<Result>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [removing, startRemove] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setFileName(f.name);
  }

  function submit() {
    const f = inputRef.current?.files?.[0];
    if (!f) return show("Choose an image first.", "error");
    const fd = new FormData();
    fd.set("file", f);
    start(async () => {
      const res = await upload(fd);
      if (!res.ok) {
        if (res.code === "auth") return router.push("/auth?next=/manage/settings");
        return show(res.error ?? "Upload failed.", "error");
      }
      setPreview(null);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
      show("Image uploaded.", "success");
      router.refresh();
    });
  }

  function remove() {
    if (!onRemove) return;
    startRemove(async () => {
      const res = await onRemove();
      if (!res.ok) {
        if (res.code === "auth") return router.push("/auth?next=/manage/settings");
        return show(res.error ?? "Couldn’t remove image.", "error");
      }
      setPreview(null);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
      show("Image removed.", "success");
      router.refresh();
    });
  }

  const src = preview ?? currentUrl;
  const box: React.CSSProperties = {
    width: shape === "circle" ? 80 : 140,
    height: 80,
    borderRadius: shape === "circle" ? "50%" : 12,
    flexShrink: 0,
    background: "#fbfcfe",
    border: "1px solid rgba(24,32,59,.12)",
    backgroundImage: src ? `url('${src}')` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    color: "var(--muted-3)",
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "#3a425e", display: "block", marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={box}>{!src && "🖼️"}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onPick} style={{ fontSize: 13 }} />
          {hint && <div style={{ fontSize: 12, color: "var(--muted-3)", marginTop: 4 }}>{hint}</div>}
          {fileName && (
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="btn-coral"
              style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "#fff", padding: "8px 16px", borderRadius: 10, border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1 }}
            >
              {pending ? "Uploading…" : "Upload"}
            </button>
          )}
          {onRemove && currentUrl && !preview && (
            <button
              type="button"
              onClick={remove}
              disabled={removing}
              style={{ marginTop: 10, marginLeft: fileName ? 8 : 0, fontSize: 13, fontWeight: 600, color: "#c0392b", background: "transparent", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(192,57,43,.3)", cursor: removing ? "not-allowed" : "pointer", opacity: removing ? 0.7 : 1 }}
            >
              {removing ? "Removing…" : "Remove cover"}
            </button>
          )}
        </div>
      </div>
      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
