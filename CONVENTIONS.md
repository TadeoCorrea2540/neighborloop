# NeighborLoop — build conventions (read before adding pages)

We are porting `design_bundle/volunteer-dashboard-design-system/project/NeighborLoop.dc.html`
(a flat gallery of 19 screens) into a **real multi-route Next.js 14 App Router app** with
**pixel-faithful ported CSS** (inline `style={{}}` objects + the utility classes in
`app/globals.css`). No Tailwind, no shadcn. Emoji are used as icons (keep them). CSS keyframe
animations live in `app/globals.css` and are referenced via the inline `animation` property.

## Fidelity rules
- Match the design's exact colors, radii, font sizes, spacing, gradients and shadows.
- The design wrapped every screen in a **fake browser frame** (traffic lights + URL bar) and a
  **gallery section label pill** because it was a gallery. In the real app these are gallery
  scaffolding — **DROP them**. Render only the actual product UI inside.
- Convert the design's templating to React:
  - `{{ x }}` → real values from `@/lib/data` or local state.
  - `<sc-for list as>` → `.map(...)`.
  - `<sc-if value>` → conditional render.
  - `style-hover="..."` → use a `className` from globals (`.lift`, `.lift-sm`, `.btn-coral`,
    `.btn-ghost`, `.row-hover`) or `onMouseEnter/Leave`.
  - count-up animations on numbers: just show the final value (no need to animate counters).
- Any page with interactivity (tabs, filters, toggles, billing switch, map/list, chat select,
  switches) must be a Client Component: add `"use client";` and use `useState`.

## Shared building blocks (import, don't re-create)
- `@/lib/data` — all seed data + types + helpers (`MISSIONS`, `causeArt`, `spotStyle`,
  `CAUSE_EMOJI`, `CHART`, `BADGES`, `MY_MISSIONS`, `MY_TABS`, `CONVERSATIONS`, `APPLICANTS`,
  `APP_TABS`, `notePill`, `MANAGE_ROWS`, `PRICING`, `MISSION_DETAILS`, `getMission`, `VOL_STATS`,
  `LIVE`, `NOTIFS`, `VOL_NAV`, `ORG_NAV`).
- `@/components/public-nav` — sticky top nav for public pages.
- `@/components/volunteer-shell` — sidebar+topbar; applied automatically to all routes under
  `app/(volunteer)/` via its layout. Just export the page content.
- `@/components/org-shell` — applied automatically to all routes under `app/manage/`.

## Design tokens (CSS vars in globals.css)
`--ink:#18203b` (text) · `--coral:#ff6f5e` / `--coral-deep:#f1543f` · `--mint:#1fae82` ·
`--blue:#3a8bf0` · `--lav:#7a6bf5` · `--orange:#ff8a3c` · muted text `#5a6685 #6b7799 #9aa3bd #b3bace`
· tints `#fbfcfe #f1f3f8 #eef0f5 #f6f8fc` · coral gradient `linear-gradient(135deg,#ff8a5c,#ff5e7a)`
· card shadow `0 40px 80px -50px rgba(24,32,59,.55)`.

## Routes
Public: `/` `/explore` `/missions/[slug]` `/pricing` `/org/[slug]` `/auth`
Volunteer (in `app/(volunteer)/`): `/dashboard` `/my-missions` `/badges` `/messages` `/impact` `/settings`
Org (in `app/manage/`): `/manage/dashboard` `/manage/missions` `/manage/missions/new` `/manage/applicants` `/manage/attendance` `/manage/reports`
Admin (in `app/admin/`): `/admin` `/admin/verify`

## Responsiveness
The design had a separate "Mobile" frame; instead make layouts degrade gracefully. Wrap multi-column
grids so they collapse under ~900px. A small global media query block can go in globals.css if needed,
but don't over-invest — desktop is primary.

Each page corresponds to a labeled section in the design file; find it by its
`<!-- ===== NN · NAME ===== -->` comment / `data-screen-label="..."` and port that block.
