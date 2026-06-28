"use client";

/** Branded circular-dot toggle and radio groups. */
export function FormToggle({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="mf-choice" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="mf-choice-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="mf-choice-indicator" aria-hidden />
      <span>
        <span className="mf-choice-label">{label}</span>
        {hint ? <div className="mf-choice-hint">{hint}</div> : null}
      </span>
    </label>
  );
}

export function FormPillGroup({
  name,
  value,
  onChange,
  options,
  labelledBy,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  labelledBy?: string;
}) {
  return (
    <div className="mf-pill-group" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        return (
          <label key={opt.value} className="mf-pill" htmlFor={id}>
            <input
              id={id}
              type="radio"
              name={name}
              className="mf-choice-input"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <span className="mf-choice-indicator" aria-hidden />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function FormRadioGroup({
  name,
  value,
  onChange,
  options,
  labelledBy,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; hint?: string }[];
  labelledBy?: string;
}) {
  return (
    <div className="mf-radio-group" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((opt) => {
        const id = `${name}-${opt.value || "none"}`;
        return (
          <label key={opt.value} className="mf-choice" htmlFor={id}>
            <input
              id={id}
              type="radio"
              name={name}
              className="mf-choice-input"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <span className="mf-choice-indicator" aria-hidden />
            <span>
              <span className="mf-choice-label">{opt.label}</span>
              {opt.hint ? <div className="mf-choice-hint">{opt.hint}</div> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
