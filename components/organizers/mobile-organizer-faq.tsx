"use client";

import { useState } from "react";
import { MORE_ORG_FAQ, PRIMARY_ORG_FAQ } from "@/lib/organizers-mobile-data";

export default function MobileOrganizerFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const [showMore, setShowMore] = useState(false);
  const items = showMore ? [...PRIMARY_ORG_FAQ, ...MORE_ORG_FAQ] : PRIMARY_ORG_FAQ;

  return (
    <section className="org-faq org-mobile-only" aria-labelledby="org-faq-heading">
      <div className="org-section-kicker">FAQ</div>
      <h2 id="org-faq-heading" className="org-section-heading">
        Common questions
      </h2>
      <div className="org-faq-list">
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q} className={`org-faq-item${isOpen ? " org-faq-item--open" : ""}`}>
              <button
                type="button"
                className="org-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {q}
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <div className="org-faq-a">{a}</div>}
            </div>
          );
        })}
      </div>
      {!showMore && (
        <button type="button" className="org-faq-more" onClick={() => setShowMore(true)}>
          See more questions
        </button>
      )}
    </section>
  );
}
