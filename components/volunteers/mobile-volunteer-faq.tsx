"use client";

import { useState } from "react";
import { MORE_FAQ, PRIMARY_FAQ } from "@/lib/volunteers-mobile-data";

export default function MobileVolunteerFaq() {
  const [open, setOpen] = useState<number | null>(0);
  const [showMore, setShowMore] = useState(false);
  const items = showMore ? [...PRIMARY_FAQ, ...MORE_FAQ] : PRIMARY_FAQ;

  return (
    <section className="vol-faq vol-mobile-only" aria-labelledby="vol-faq-heading">
      <div className="vol-section-kicker">FAQ</div>
      <h2 id="vol-faq-heading" className="vol-section-heading">
        Common questions
      </h2>
      <div className="vol-faq-list">
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q} className={`vol-faq-item${isOpen ? " vol-faq-item--open" : ""}`}>
              <button
                type="button"
                className="vol-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {q}
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <div className="vol-faq-a">{a}</div>}
            </div>
          );
        })}
      </div>
      {!showMore && (
        <button type="button" className="vol-faq-more" onClick={() => setShowMore(true)}>
          See more questions
        </button>
      )}
    </section>
  );
}
