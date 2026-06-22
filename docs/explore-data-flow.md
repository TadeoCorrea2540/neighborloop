# Explore data flow (Phase 4)

## Server-rendered, URL-param driven
`app/explore/page.tsx` (server) reads `searchParams`, builds `MissionFilters`,
and calls `getExploreMissionCards(filters, { userId })`. Changing a filter pushes
a new URL (`router.push`) → the server re-queries. This makes filtered views
shareable and back/forward-friendly.

### Supported URL params
```
/explore?category=<slug>     cause chip (slug, "all" = none)
/explore?q=<text>            search (title/summary/city/location, sanitized)
/explore?when=today|weekend|week|month
/explore?beginner=true
/explore?virtual=true|false
/explore?difficulty=Easy|Medium|Hard
/explore?sort=soonest|newest|spots
```

## How cards get their data
`getPublishedMissions(filters)` (DB-level `eq`/`ilike`/date-range/order, RLS =
published + public org) → `getMissionCards(missions, {userId})` enriches each with
org name (one `.in` query), category emoji/accent (categories map), **spots left**
(one `get_mission_spot_counts` RPC), and the viewer's saved + application state.
Fixed query count — no N+1. `sort=spots` is applied after counts merge.

## Card display
cover gradient from the category accent (emoji fallback — no upload needed),
category + beginner badges, title, org, date, location/hours, spots-left pill,
your application status (if any), and a real Save heart.

## States
- **Loading** — server-rendered (Next streaming).
- **Empty / no-results** — dashed card, "No missions match those filters yet",
  Reset + Explore-all CTAs.
- **Error** — the page catches data errors and falls back to the empty state
  (never a raw crash).

## Mobile
`ExploreMobileExperience` receives the same real cards (adapted to the mock card
shape via `cardToMission`) and keeps its rich client-side search/quick/advanced
filters. Geo/distance filters are disabled for real data (no lat/long yet). Save
is wired to the real action (slug→id).
