/**
 * Resolve storage paths to URLs. Public buckets → stable public URL; private
 * verification docs → short-lived signed URL (admin/org-manager only, gated by
 * storage RLS). We store only the PATH in the DB and resolve here when rendering.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { BUCKETS } from "@/lib/storage/storage-paths";

export function publicMediaUrl(bucket: string, path: string | null): string | null {
  if (!path) return null;
  return getServerSupabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function signedDocUrl(path: string | null, expiresIn = 300): Promise<string | null> {
  if (!path) return null;
  const { data } = await getServerSupabase().storage.from(BUCKETS.verificationDocs).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}
