# QR Check-In Flow

Lets approved volunteers check themselves in by scanning a QR code — without any direct write access to attendance or read access to tokens. Table: `check_in_tokens` (014). Fn: `qr_check_in()` (015). Actions: `app/manage/attendance/actions.ts` (generate/deactivate), `app/check-in/actions.ts` (volunteer). UI: `components/manage/check-in-qr.tsx`, `app/check-in/[token]/page.tsx`.

## Token generation (organizer)
`generateCheckInTokenAction(missionId)`:
1. Deactivates any existing active token for the mission (partial unique index allows one active).
2. Creates a raw token (`randomBytes(16).hex`), stores **only its SHA-256 hash**, sets `expires_at = +30 days`, `is_active = true`.
3. Returns the raw token **once** as a URL `…/check-in/{raw}` + a server-generated QR data URL (qrcode). The raw token is never persisted, so the QR is shown right after generation; revisiting requires **Regenerate** (which deactivates the old one).

`deactivateCheckInTokenAction(tokenId)` flips `is_active = false`.

## QR URL
`https://<host>/check-in/{raw_token}` (host derived from request headers; `http://localhost:3000/check-in/{token}` locally).

## Volunteer scan → `qrCheckInAction(rawToken)`
1. Not logged in → the landing page redirects to `/auth?redirect=/check-in/{token}`.
2. Not a volunteer (role) → "Volunteer accounts only".
3. Hashes the token, calls the SECURITY DEFINER `qr_check_in(p_token_hash)` which returns a status:
   - `ok` → attendance row upserted to `checked_in` / method `qr` / `checked_in_at = now()`.
   - `already` → already checked in/out/completed (no duplicate).
   - `not_approved` → "This check-in link is only for approved volunteers."
   - `expired` / `inactive` → "This QR code has expired."
   - `invalid` → friendly invalid-link error.

## Why a SECURITY DEFINER function
Volunteers have **no** RLS write on `attendance_records` and **no** read on `check_in_tokens`. The definer fn validates the token + the caller's approved application and writes the attendance row for `auth.uid()` only — closing the gap without weakening RLS.

## Manual fallback
Organizers can always check volunteers in manually from the roster (QR can fail at real events). See [attendance-workflow.md](attendance-workflow.md).
