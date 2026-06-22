"use client";

import { ORG_TYPES, OrgTypeId } from "@/lib/organizers-mobile-data";

export default function OrganizerTypeSelector({
  selected,
  onSelect,
}: {
  selected: OrgTypeId;
  onSelect: (id: OrgTypeId) => void;
}) {
  const active = ORG_TYPES.find((t) => t.id === selected);

  return (
    <section className="org-who org-mobile-only" aria-labelledby="org-who-heading">
      <div className="org-section-kicker">Who can organize</div>
      <h2 id="org-who-heading" className="org-section-heading">
        You do not need to be a big organization.
      </h2>
      <p className="org-who-lead">
        If you are organizing something that helps people, animals, education, or your neighborhood, you can start here.
      </p>

      <p className="org-who-picker-label">I am organizing as…</p>
      <div className="org-type-scroll" role="tablist" aria-label="Organizer type">
        {ORG_TYPES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected === id}
            className={`org-type-chip${selected === id ? " org-type-chip--active" : ""}`}
            onClick={() => onSelect(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {active && (
        <p className="org-type-response" aria-live="polite">
          {active.response}
        </p>
      )}
    </section>
  );
}
