/**
 * Server-side file validation + upload. Validates type/size BEFORE touching
 * storage, uploads via the cookie-authenticated client (storage RLS enforces
 * the org-scoped path), and returns the stored path. Never trusts the client
 * filename — callers pass a generated path.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export type UploadResult = { ok: true; path: string } | { ok: false; error: string };

export function readFile(fd: FormData, key = "file"): File | null {
  const f = fd.get(key);
  return f instanceof File && f.size > 0 ? f : null;
}

export async function uploadFile(opts: {
  bucket: string;
  path: string;
  file: File;
  allowedTypes: string[];
  maxBytes: number;
}): Promise<UploadResult> {
  const { bucket, path, file, allowedTypes, maxBytes } = opts;
  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: "Unsupported file type. Use JPG, PNG, or WebP." + (allowedTypes.includes("application/pdf") ? " (PDF allowed for documents.)" : "") };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `File is too large (max ${Math.round(maxBytes / 1_048_576)}MB).` };
  }
  const supabase = getServerSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { ok: false, error: "Upload failed. Please try again." };
  return { ok: true, path };
}
