# Storage Security

Uploads go through Supabase Storage. Buckets are created in migration 006; their RLS lives in migration 016 (Phase 7). Helpers: `lib/storage/storage-paths.ts`, `lib/storage/urls.ts`, `lib/storage/upload.ts`. Uploads run in **server actions** using the cookie-authenticated client (no service-role key) — storage RLS enforces ownership.

## Buckets
| Bucket | Visibility | Holds |
|---|---|---|
| `organization-media` | public read | org logo, cover |
| `mission-media` | public read | mission cover |
| `verification-documents` | **private** | org verification documents |

## Path structure (org id is always the first folder)
```
organization-media/{org_id}/logo|cover/{uuid}.{ext}
mission-media/{org_id}/{mission_id}/cover/{uuid}.{ext}
verification-documents/{org_id}/{uuid}/{uuid}.{ext}
```
File names are random UUIDs — never the client filename, never an email.

## RLS (migration 016) — keyed on `(storage.foldername(name))[1] = org_id`
- `organization-media`, `mission-media`: **insert/update/delete** require `is_org_manager(org_id)`. Reads are public (public buckets / public URLs).
- `verification-documents`: **select/insert/update/delete** require `is_admin() OR is_org_manager(org_id)`. No public read; access is via short-lived signed URLs.

## Validation (server-side, before upload)
- Public images: `image/jpeg|png|webp|avif`. Logo ≤ 2MB, covers ≤ 5MB.
- Verification docs: `application/pdf` + `image/jpeg|png|webp`, ≤ 10MB.
- Type + size are checked in `uploadFile()` and surfaced as friendly errors.

## Public vs private rendering
- Only the **path** is stored in the DB (`organizations.logo_path/cover_image_path`, `missions.cover_image_path`, `organization_verifications.document_path`).
- Public images resolve to a stable URL via `publicMediaUrl(bucket, path)` (`getPublicUrl`).
- Private docs resolve to a **signed** URL via `signedDocUrl(path)` (`createSignedUrl`, ~5 min) and are shown only to admins on the verification detail page.

## Privacy decisions
- Verification documents are never public and never linked on public pages.
- Organizers attach a verification document at **request time** (they can't update the admin-only verification row afterward).
- No service-role key in app code; every upload/read is gated by storage RLS evaluated as the signed-in user.
