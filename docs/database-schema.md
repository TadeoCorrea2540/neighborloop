# Database Schema

All tables live in `public`, use UUID primary keys and `timestamptz`. `updated_at`
is maintained by the `set_updated_at()` trigger. Source of truth: `supabase/migrations/`.

## Enums (001)
| Enum | Values |
| --- | --- |
| `app_role` | volunteer, organizer, admin |
| `organization_type` | nonprofit, school, university, student_club, community_group, faith_group, local_business, family_individual, other |
| `verification_status` | pending, verified, rejected, not_required |
| `mission_status` | draft, pending_review, published, paused, closed, cancelled, archived |
| `application_status` | pending, approved, waitlisted, declined, withdrawn, cancelled |

## Tables (003)

### profiles
1:1 with `auth.users`. **Public-safe only** — no email/phone/address/PII.
Key fields: `display_name`, `full_name?`, `avatar_url?`, `bio?`, `city?`, `country_code?`, `interests text[]`, `is_profile_public`.

### user_roles
Role assignment kept **separate** from editable profile fields so a user editing
their profile can never touch their role. PK `(user_id, role)`. Writable by admins only.

### mission_categories
Public, stable taxonomy. `slug` unique, `is_active`, `sort_order`. Seeded in `seed.sql`.

### organizations
Public organizer identity for every organizer type (nonprofit → family/individual).
`owner_id → profiles`, `slug` unique, `is_public`, `verification_status`.
`verification_note` is a **safe public** note; internal moderation detail lives in
`organization_verifications.internal_note` (admin-only). A trigger blocks non-admins
from changing `verification_status`/`verification_note` (no self-verify).

### organization_members
Team support. PK `(organization_id, user_id)`, `member_role ∈ {owner, admin, coordinator}`.
The owner is represented here too. Powers organizer-scoped RLS via `is_org_member()` /
`is_org_manager()`.

### organization_verifications
Moderation/verification record (Phase 6). `internal_note` is **never** publicly readable
(table is admin-only select); `public_reason` is the safe outward message.

### missions
Public mission/event data. `organization_id`, `category_id?`, `slug` unique, `status`,
schedule (`starts_at`, `ends_at?`, `timezone`), capacity/age/hours, `skills/materials/perks text[]`,
`location_label` (safe public label), optional `latitude/longitude`. **No exact private address.**
Has a generated `search_vector` (title + summary) with a GIN index for discovery.

### mission_private_details
1:1 with `missions`. Holds `exact_address`, private meeting instructions, and private
contact info. **Never publicly readable.** Organizer-managed now; approved-volunteer read
is deferred to Phase 4.

### applications
Volunteer applications. Unique `(mission_id, volunteer_id)` — one application per mission.
`organizer_note` is organizer/admin-only (see RLS notes).

### saved_missions
Volunteer bookmarks. Unique `(user_id, mission_id)`. Owner-only.

### reports
Moderation reports. Check constraint enforces **exactly one** target
(mission OR organization OR user). `internal_note` admin-only.

### audit_events
Internal traceability (`actor_id`, `event_type`, `entity_type`, `entity_id`, `metadata jsonb`).
No public/self-serve access; written server-side later.

## Relationships (high level)
- `profiles 1—1 auth.users`; `profiles 1—* user_roles`.
- `organizations *—1 profiles (owner)`; `organizations 1—* organization_members`, `1—* organization_verifications`, `1—* missions`.
- `missions *—1 mission_categories`; `missions 1—1 mission_private_details`; `missions 1—* applications`, `1—* saved_missions`.
- `reports` → optional FK to a mission/org/user; `audit_events` → optional `entity_id`.

## Constraints & indexes (004)
- Checks: `ends_at > starts_at`, capacity > 0, age 0–120, hours ≥ 0, lat/long ranges, reports single-target.
- Unique: applications `(mission_id, volunteer_id)`, saved `(user_id, mission_id)`.
- Indexes on mission `status`, `organization_id`, `category_id`, `starts_at`, `published_at`, `lower(city)`; org owner; members `user_id`; applications `volunteer_id`/`mission_id`; saved `user_id`; reports `status`; audit `(entity_type, entity_id)`; categories `(is_active, sort_order)`; GIN `search_vector`.

## Privacy decisions
- **Private mission details are a separate table** so public mission APIs/queries cannot
  accidentally leak addresses/contacts — and so approved-volunteer access can be granted
  later at the table level without exposing them to everyone.
- Family/individual **home addresses are never** in `missions`; only a safe `location_label`.
- `user_roles`, `organization_verifications.internal_note`, `reports.internal_note`,
  `applications.organizer_note`, and `audit_events` are restricted (see RLS matrix).

## Intentionally deferred tables (future phases)
`attendance`, `mission_updates`/announcements, `conversations`/`messages`, `notifications`,
`certificates`, `badges`/`badge_awards`, `payments`/`stipends`. Not created in Phase 2 to
keep the foundation stable.
