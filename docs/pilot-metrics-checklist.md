# Pilot Metrics Checklist

Measurable metrics to capture during a NeighborLoop pilot. Most come straight from the platform (org report, CSV exports, admin dashboard); a few require a short survey.

## From the platform (no extra work)
- [ ] Organizations onboarded — `/admin` (Organizations) or count of orgs you created.
- [ ] Missions posted — `/admin` (missions) / `/manage/missions`.
- [ ] Missions completed/closed — mission statuses in the org report.
- [ ] Volunteers registered — `/admin` (volunteers).
- [ ] Applications submitted — `/admin` (applications submitted) / org reports.
- [ ] Volunteers approved — org report / applicants.
- [ ] Completed attendances — org report / `attendance-summary.csv`.
- [ ] Total hours tracked — org report / `volunteer-hours.csv` / `/admin` platform impact.
- [ ] Certificates issued — org report / `certificates-issued.csv`.
- [ ] Avg attendance completion rate — org report.
- [ ] No-show rate — mission reports / org report.
- [ ] Returning volunteers + returning rate — org report (engagement).
- [ ] Categories/causes covered — org report (cause breakdown) / `/admin` participation.

## From a short survey (qualitative)
- [ ] Number of schools / community groups involved.
- [ ] Average time saved by organizers per event (estimate: hours of coordination before vs after).
- [ ] Organizer satisfaction (1–5) + one quote.
- [ ] Volunteer satisfaction (1–5) + one quote.
- [ ] Would organizers/volunteers use it again? (yes/no + why).

## How to capture
1. Run the pilot end to end (see [phase-9-test-data.md](phase-9-test-data.md) for the flow).
2. Open `/manage/reports`, set the range, export the four CSVs and print the PDF.
3. Open `/admin` for platform totals (admin account).
4. Send the 5-question survey to organizers and volunteers.
5. Drop the numbers into [neighborloop-impact-case-study-template.md](neighborloop-impact-case-study-template.md).
