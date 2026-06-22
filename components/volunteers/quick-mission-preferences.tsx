"use client";

import {
  PREFERENCE_CHIPS,
  PreferenceChip,
  preferenceMatchCount,
} from "@/lib/volunteers-mobile-data";

export default function QuickMissionPreferences({
  selected,
  onChange,
}: {
  selected: PreferenceChip[];
  onChange: (next: PreferenceChip[]) => void;
}) {
  const toggle = (chip: PreferenceChip) => {
    onChange(
      selected.includes(chip)
        ? selected.filter((c) => c !== chip)
        : [...selected, chip]
    );
  };

  const count = preferenceMatchCount(selected);

  return (
    <section className="vol-prefs vol-mobile-only" aria-labelledby="vol-prefs-heading">
      <h2 id="vol-prefs-heading" className="vol-section-heading">
        What fits your day?
      </h2>
      <div className="vol-prefs-scroll" role="group" aria-label="Mission preferences">
        {PREFERENCE_CHIPS.map((chip) => {
          const on = selected.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              className={`vol-pref-chip${on ? " vol-pref-chip--active" : ""}`}
              aria-pressed={on}
              onClick={() => toggle(chip)}
            >
              {chip}
            </button>
          );
        })}
      </div>
      <p className="vol-prefs-result" aria-live="polite">
        <strong>{count} missions</strong> match this
      </p>
    </section>
  );
}
