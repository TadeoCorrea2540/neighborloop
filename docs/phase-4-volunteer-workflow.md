# Phase 4 — Volunteer Core Workflow

Makes the volunteer side run on **real Supabase data** while preserving the Phase 1 design.

## Journey
Explore real published missions → open a mission → save → apply → see status → track in My Missions → edit profile.

## What Phase 4 implements
- **/explore** — real published missions with search + filters (category, when, format, beginner, difficulty, sort) via **URL params**; empty/no-results states; real Save on cards. Desktop + mobile.
- **/missions/[slug]** — real mission data only (`notFound()` if missing/unpublished); apply / withdraw / save with full status-aware CTA.
- **/my-missions** — real tabs: Upcoming, Applications, Saved, Past, Cancelled.
- **/dashboard** — real counts (saved, pending, approved, total applied, next upcoming) + real recommended missions.
- **/impact** — real profile (name, city, bio, interests) + real activity counts.
- **/settings** — editable profile (display name, bio, city, country, interests, public toggle).

## What it does NOT implement (later phases)
Organizer mission create/edit, applicant approval UI, admin verification, QR/attendance, certificates, hours tracking, messaging, notifications, AI, payments, geo/distance, file uploads. Hours/badges/certificates/timeline are shown as **"Coming soon"** placeholders — never faked.

## Connected routes
`/explore`, `/missions/[slug]`, `/dashboard`, `/my-missions`, `/impact`, `/settings`.

## Data tables used
`missions`, `mission_categories`, `organizations`, `profiles`, `applications`, `saved_missions`. Reads use explicit public columns and never touch `mission_private_details` or `organizer_note`.

## New DB object
`get_mission_spot_counts(uuid[])` — `SECURITY DEFINER` read-only aggregate (migration 011) returning approved-application counts for **published** missions only, so "spots left" can be computed without exposing private application rows. No RLS was weakened.
