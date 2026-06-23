/**
 * Storage bucket ids + safe path builders. Paths ALWAYS start with the
 * organization id so storage RLS (foldername[1] = org_id) can gate writes.
 * File names are random UUIDs — never the client-provided filename.
 */
import "server-only";
import { randomUUID } from "node:crypto";

export const BUCKETS = {
  orgMedia: "organization-media",
  missionMedia: "mission-media",
  verificationDocs: "verification-documents",
} as const;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

export function extForMime(mime: string): string {
  return EXT[mime] ?? "bin";
}

export function orgLogoPath(orgId: string, mime: string): string {
  return `${orgId}/logo/${randomUUID()}.${extForMime(mime)}`;
}
export function orgCoverPath(orgId: string, mime: string): string {
  return `${orgId}/cover/${randomUUID()}.${extForMime(mime)}`;
}
export function missionCoverPath(orgId: string, missionId: string, mime: string): string {
  return `${orgId}/${missionId}/cover/${randomUUID()}.${extForMime(mime)}`;
}
export function verificationDocPath(orgId: string, verificationId: string, mime: string): string {
  return `${orgId}/${verificationId}/${randomUUID()}.${extForMime(mime)}`;
}
