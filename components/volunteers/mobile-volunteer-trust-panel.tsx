"use client";

import { useState } from "react";
import { TRUST_CHECKLIST, TRUST_DETAILS } from "@/lib/volunteers-mobile-data";

export default function MobileVolunteerTrustPanel() {
  const [open, setOpen] = useState(false);
  const [perksOpen, setPerksOpen] = useState(false);

  return (
    <section className="vol-trust vol-mobile-only" aria-labelledby="vol-trust-heading">
      <h2 id="vol-trust-heading" className="vol-section-heading">
        Everything you need before you join.
      </h2>

      <ul className="vol-trust-checklist">
        {TRUST_CHECKLIST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <button
        type="button"
        className="vol-trust-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Hide details" : "Safety & before you join"}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="vol-trust-details">
          {TRUST_DETAILS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <div className="vol-perks-compact">
        <button
          type="button"
          className="vol-perks-toggle"
          aria-expanded={perksOpen}
          onClick={() => setPerksOpen((o) => !o)}
        >
          <span>Volunteer first. Perks when available.</span>
          <span aria-hidden="true">{perksOpen ? "−" : "+"}</span>
        </button>
        {perksOpen && (
          <p className="vol-perks-copy">
            Most NeighborLoop missions are unpaid. Some organizers may offer meals, transport support, community-service hours, certificates, event access, references, or a small stipend. Any benefit must be clearly listed before you join.
          </p>
        )}
      </div>
    </section>
  );
}
