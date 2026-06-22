"use client";

import { useState } from "react";
import { START_CHECKLIST, START_OPTIONAL } from "@/lib/organizers-mobile-data";

export default function OrganizerStartPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="org-start org-mobile-only" aria-labelledby="org-start-heading">
      <h2 id="org-start-heading" className="org-section-heading">
        You only need a clear purpose.
      </h2>
      <ul className="org-start-checklist">
        {START_CHECKLIST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="org-start-note">
        You do not need a perfect logo, a professional team, or complicated paperwork to get started.
      </p>
      <button
        type="button"
        className="org-start-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Optional details
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="org-start-optional">
          {START_OPTIONAL.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
