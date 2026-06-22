"use client";

import { useState } from "react";
import { TRUST_DETAILS, TRUST_POINTS } from "@/lib/organizers-mobile-data";

export default function OrganizerTrustPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="org-trust org-mobile-only" aria-labelledby="org-trust-heading">
      <h2 id="org-trust-heading" className="org-section-heading">
        Built for clear, respectful community action.
      </h2>
      <ul className="org-trust-checklist">
        {TRUST_POINTS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button
        type="button"
        className="org-trust-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Safety & verification details
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="org-trust-details">
          {TRUST_DETAILS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
