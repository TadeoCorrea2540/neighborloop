"use client";

/**
 * Reusable image upload control. The parent (a client component) passes a bound
 * server action via `upload`. Validates nothing client-side beyond a preview —
 * the server action enforces type/size + storage RLS. Shows current image,
 * local preview, and a toast on result.
 */
import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import Icon from "@/components/icons";
import "./image-upload.css";

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
  const inputId = useId();
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
  const previewClass = `iu-preview${shape === "circle" ? " iu-preview--circle" : ""}`;

  return (
    <div className="iu-wrap">
      <span className="iu-label" id={`${inputId}-label`}>
        {label}
      </span>

      <div className="iu-row">
        <div
          className={previewClass}
          style={src ? { backgroundImage: `url('${src}')` } : undefined}
          aria-hidden
        />

        <div className="iu-body">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="iu-input-hidden"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onPick}
            aria-labelledby={`${inputId}-label`}
          />
          <label htmlFor={inputId} className="iu-pick">
            <Icon name="image" size={16} />
            {fileName ? "Change image" : "Choose image"}
          </label>

          {fileName ? (
            <p className="iu-filename" title={fileName}>
              {fileName}
            </p>
          ) : null}

          {hint ? <p className="iu-hint">{hint}</p> : null}

          {(fileName || (onRemove && currentUrl && !preview)) ? (
            <div className="iu-actions">
              {fileName ? (
                <button type="button" onClick={submit} disabled={pending} className="iu-btn-upload">
                  {pending ? "Uploading…" : "Upload"}
                </button>
              ) : null}
              {onRemove && currentUrl && !preview ? (
                <button type="button" onClick={remove} disabled={removing} className="iu-btn-remove">
                  {removing ? "Removing…" : "Remove cover"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
