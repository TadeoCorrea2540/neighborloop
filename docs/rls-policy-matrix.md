# RLS Policy Matrix

RLS is **enabled on every table**; default-deny applies (no policy ⇒ no access).
Roles: `anon` (visitor), `authenticated` (logged-in), plus app roles checked via
`is_admin()`, `has_role()`, `is_org_member()`, `is_org_manager()`. Source: `005_rls_policies.sql`.

Legend: ✅ allowed · ❌ denied · 🔒 owner/role-scoped · ⏳ pending later phase.

| Table | SELECT | INSERT | UPDATE | DELETE | Why / notes |
| --- | --- | --- | --- | --- | --- |
| profiles | public rows + own + admin | self (`id=auth.uid()`) | self or admin | ❌ (cascade) | Public profile data only. |
| user_roles | own + admin | admin only | admin only | admin only | Users can READ their role, never write it. **No self-grant of admin.** |
| mission_categories | active rows + admin | admin | admin | admin | Public taxonomy; admin-managed. |
| organizations | public orgs + members + admin | self as owner (`owner_id=auth.uid()`) | managers/admin | managers/admin | Trigger blocks non-admins changing verification fields (no self-verify). |
| organization_members | members + admin | managers/admin, or owner's own initial 'owner' row | managers/admin | managers/admin | Enables team management; bootstraps owner row safely. |
| organization_verifications | **admin only** | managers/admin (as `submitted_by`) | admin only | admin only | `internal_note` never leaves admin. Org status read via `organizations`. |
| missions | published (public org) + members + admin | managers/admin | managers/admin | managers/admin | Public sees only `published` from public orgs. |
| mission_private_details | org members + admin | managers/admin | managers/admin | managers/admin | **Never public.** Approved-volunteer read ⏳ Phase 4. |
| applications | own (volunteer) + org members + admin | volunteer as self, mission must be `published` | volunteer (own) / org members / admin | admin only | `organizer_note` privacy from volunteers enforced at data layer (see caveat). |
| saved_missions | own + admin | self | — | self | Owner-only bookmarks. |
| reports | **admin only** | self (`reporter_id=auth.uid()`) | admin only | admin only | Reporter self-read ⏳ Phase 6 (`internal_note` stays admin-only). |
| audit_events | admin only | ❌ (server-side only) | ❌ | ❌ | Written by trusted server processes later. |

## Public visitor guarantees (anon)
Can: read active categories, public organizations, **published** missions, safe public
mission fields. Cannot: read private mission details, reports, verification internal notes,
user roles, audit events, or any private contact info.

## Column-privacy caveats (honest limitations)
Supabase RLS is **row**-level; it cannot hide individual columns, and admins share the
`authenticated` DB role (so column GRANTs can't single them out). Therefore:

- **`applications.organizer_note`** — volunteers *can* read their own application rows, which
  technically includes this column at the DB level. Phase 2 mitigates by **never selecting it**
  in volunteer data functions (`lib/data/applications.ts` → `VOLUNTEER_APP_COLUMNS`).
  **Recommended Phase 4 hardening:** move `organizer_note` into an `application_private` table
  (organizer/admin-only) for a true DB-level guarantee.
- **`reports.internal_note`** — kept fully safe in Phase 2 by making reports **admin-only**
  for SELECT. Reporter self-read is deferred (⏳ Phase 6) and will arrive via a private split
  or a safe view so `internal_note` stays admin-only.
- **`organization_verifications.internal_note`** — fully protected: the whole table is
  admin-only SELECT; orgs read their status via `organizations.verification_status`.

## RLS test matrix (verify after Phase 3 auth / with test accounts)
| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Anonymous reads `missions` where status=published | ✅ rows returned |
| 2 | Anonymous reads a `draft`/`pending_review` mission | ❌ no rows |
| 3 | Anonymous reads `mission_private_details` | ❌ denied (no rows) |
| 4 | Anonymous reads `reports` / `audit_events` / `user_roles` | ❌ denied |
| 5 | Volunteer A reads Volunteer B's `applications` | ❌ no rows |
| 6 | Volunteer inserts `applications` with `volunteer_id` = someone else | ❌ check fails |
| 7 | Volunteer inserts own application to a non-published mission | ❌ check fails |
| 8 | Organizer edits another org's `missions` | ❌ no rows updated |
| 9 | Organizer reads another org's `applications` | ❌ no rows |
| 10 | Organizer updates own org's `verification_status` to 'verified' | ❌ trigger raises |
| 11 | Normal user selects `reports` | ❌ denied (admin only) |
| 12 | Normal user inserts into `user_roles` (self-grant admin) | ❌ check fails |
| 13 | Admin reads `reports` / `audit_events` / verification internal notes | ✅ allowed |
| 14 | Admin status is gained only via DB `user_roles` row, never frontend logic | ✅ by design |

These run via SQL editor / psql using `set role` + `request.jwt.claims`, or end-to-end with
real test sessions once Phase 3 auth exists.

## Pending policies (created as schema, activated later)
- ⏳ **Approved-volunteer read of `mission_private_details`** (Phase 4, once applications are live):
  add a policy allowing select where the caller has an `approved` application for that mission.
- ⏳ **Reporter self-read of `reports`** (Phase 6) via private split / view.
- ⏳ **Storage object policies** (Phase 7) for `mission-media`, `organization-media`,
  `verification-documents`.
