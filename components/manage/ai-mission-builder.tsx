"use client";

/**
 * AI Mission Builder — a 4-question guided flow that asks Gemini (server-side)
 * for a structured mission draft, lets the organizer review/edit it, and on
 * "Use this draft" hands the draft to the parent form. It never saves or
 * publishes; the normal mission form + actions remain the only write path.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "@/components/icons";
import { generateMissionDraftAction } from "@/app/manage/missions/ai-actions";
import type { AIMissionAnswers, AIMissionDraft } from "@/lib/ai/mission-draft-schema";
import { FormPillGroup } from "@/components/manage/form-choice";
import "./ai-mission-builder.css";

type Category = { id: string; name: string; slug: string };
type Stage = "form" | "loading" | "review" | "error";

const QUESTIONS: {
  key: "purpose" | "whereWhen" | "tasksRequirements" | "volunteersImpact";
  step: string;
  label: string;
  helper: string;
  placeholder: string;
}[] = [
  {
    key: "purpose",
    step: "Purpose",
    label: "What is this mission about?",
    helper: "Briefly describe the cause, goal, or problem you want volunteers to help with.",
    placeholder:
      "We need volunteers to help sort food donations and prepare boxes for families in the community.",
  },
  {
    key: "whereWhen",
    step: "Where & when",
    label: "Where and when will it happen?",
    helper: "Add the public location, date, time, and whether it's in person or virtual.",
    placeholder:
      "Saturday, June 26 at 10 AM, at the community center in San Nicolás. In person.",
  },
  {
    key: "tasksRequirements",
    step: "Requirements",
    label: "What will volunteers do, and what should they bring or know?",
    helper: "Mention tasks, skills, materials, age limits, safety notes, or anything volunteers should know.",
    placeholder:
      "They will sort donations, pack boxes, and help with basic setup. No experience needed. Comfortable shoes recommended.",
  },
  {
    key: "volunteersImpact",
    step: "Impact",
    label: "How many volunteers do you need, and what impact should this create?",
    helper: "Add the number of volunteers, expected duration, and what success looks like.",
    placeholder: "We need 12 volunteers for about 3 hours. The goal is to prepare 150 food boxes for local families.",
  },
];

const LOADING_STEPS = [
  "Understanding the mission",
  "Organizing volunteer tasks",
  "Writing the impact goal",
  "Preparing your draft",
];

const EMPTY: AIMissionAnswers = {
  purpose: "",
  whereWhen: "",
  exactAddress: "",
  addressVisibility: "private",
  tasksRequirements: "",
  volunteersImpact: "",
};

export default function AIMissionBuilder({
  categories,
  onApply,
}: {
  categories: Category[];
  onApply: (draft: AIMissionDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AIMissionAnswers>(EMPTY);
  const [draft, setDraft] = useState<AIMissionDraft | null>(null);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [portalReady, setPortalReady] = useState(false);
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPortalReady(true), []);

  const reset = () => {
    setStage("form");
    setStep(0);
    setAnswers(EMPTY);
    setDraft(null);
    setError("");
  };

  function close() {
    setOpen(false);
  }

  // Lock page scroll (iOS-safe) + Escape to close while the modal is open
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.classList.add("amb-open");
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("amb-open");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Block background scroll on iOS; allow scroll only inside .amb-body
  useLayoutEffect(() => {
    if (!open) return;
    const scrollEl = bodyRef.current;
    const panel = scrollEl?.closest(".amb-panel");
    if (!scrollEl || !panel) return;

    const onTouchMove = (e: TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      if (!panel.contains(target)) {
        e.preventDefault();
        return;
      }

      if (scrollEl.contains(target)) {
        const canScroll = scrollEl.scrollHeight > scrollEl.clientHeight + 1;
        if (!canScroll) e.preventDefault();
        return;
      }

      // Header, stepper, footer — no drag
      e.preventDefault();
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => document.removeEventListener("touchmove", onTouchMove);
  }, [open, stage, step]);

  // Keep focused fields visible when the iOS keyboard opens
  useEffect(() => {
    if (!open || stage !== "form") return;
    const scrollEl = bodyRef.current;
    if (!scrollEl) return;

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target;
      if (!(t instanceof HTMLElement) || !scrollEl.contains(t)) return;
      if (!t.matches("textarea, input")) return;
      window.setTimeout(() => {
        t.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 320);
    };

    scrollEl.addEventListener("focusin", onFocusIn);
    return () => scrollEl.removeEventListener("focusin", onFocusIn);
  }, [open, stage, step]);

  // rotate the loading micro-steps
  useEffect(() => {
    if (stage !== "loading") return;
    setLoadingStep(0);
    const id = window.setInterval(() => setLoadingStep((n) => (n + 1) % LOADING_STEPS.length), 1100);
    return () => window.clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (open && stage === "form") firstFieldRef.current?.focus();
  }, [open, stage, step]);

  const q = QUESTIONS[step];
  const value = answers[q.key];
  const canNext =
    q.key === "whereWhen"
      ? answers.whereWhen.trim().length >= 12
      : value.trim().length >= 12;
  const isLast = step === QUESTIONS.length - 1;
  const addressVisibility = answers.addressVisibility;

  function goBack() {
    if (step === 0) close();
    else setStep((s) => s - 1);
  }

  const formStepActions = (
    <div className="amb-actions">
      <button type="button" className="amb-btn amb-btn--ghost" onClick={goBack}>
        {step === 0 ? "Cancel" : "Back"}
      </button>
      {isLast ? (
        <button type="button" className="amb-btn amb-btn--primary" disabled={!canNext} onClick={generate}>
          <Icon name="sparkles" size={15} /> Generate draft
        </button>
      ) : (
        <button type="button" className="amb-btn amb-btn--primary" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
          Next
        </button>
      )}
    </div>
  );

  async function generate() {
    setStage("loading");
    setError("");
    const res = await generateMissionDraftAction(answers);
    if (res.ok) {
      setDraft(res.draft);
      setStage("review");
    } else {
      setError(res.error);
      setStage("error");
    }
  }

  function apply() {
    if (draft) onApply(draft);
    close();
    // reset after the close animation so the next open starts fresh
    window.setTimeout(reset, 250);
  }

  const patch = (p: Partial<AIMissionDraft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const categoryName = draft?.categorySlug
    ? categories.find((c) => c.slug === draft.categorySlug)?.name ?? null
    : null;

  return (
    <>
      <button type="button" className="amb-trigger" onClick={() => setOpen(true)}>
        <span className="amb-trigger-glow" aria-hidden />
        <span className="amb-trigger-icon" aria-hidden>
          <Icon name="sparkles" size={18} />
        </span>
        <span className="amb-trigger-text">
          <span className="amb-trigger-title">Draft with AI</span>
          <span className="amb-trigger-sub">Answer 4 quick questions and get a polished draft</span>
        </span>
        <span className="amb-trigger-arrow" aria-hidden>→</span>
      </button>

      {open && portalReady &&
        createPortal(
        <div className="amb-overlay" role="dialog" aria-modal="true" aria-label="AI Mission Builder" onMouseDown={close}>
          <div className="amb-panel" onMouseDown={(e) => e.stopPropagation()}>
            {/* header */}
            <div className="amb-head">
              <div className="amb-head-title">
                <span className="amb-head-icon" aria-hidden><Icon name="sparkles" size={16} /></span>
                AI Mission Builder
              </div>
              <button type="button" className="amb-close" onClick={close} aria-label="Close">
                <Icon name="x-circle" size={20} />
              </button>
            </div>

            {/* stepper rail (hidden during loading) */}
            {(stage === "form" || stage === "review") && (
              <div className="amb-rail" aria-hidden>
                {QUESTIONS.map((qq, i) => (
                  <div
                    key={qq.key}
                    className={`amb-rail-dot${stage === "review" || i < step ? " is-done" : ""}${stage === "form" && i === step ? " is-active" : ""}`}
                  >
                    <span>{qq.step}</span>
                  </div>
                ))}
                <div className={`amb-rail-dot${stage === "review" ? " is-active" : ""}`}>
                  <span>Review</span>
                </div>
              </div>
            )}

            {/* body */}
            <div className="amb-body" ref={bodyRef}>
              {stage === "form" && (
                <div className="amb-step" key={step}>
                  <div className="amb-step-meta">Step {step + 1} of {QUESTIONS.length}</div>
                  <label className="amb-q-label" htmlFor="amb-field">{q.label}</label>
                  <p className="amb-q-helper">{q.helper}</p>
                  <textarea
                    id="amb-field"
                    ref={firstFieldRef}
                    className="amb-textarea"
                    value={value}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
                    placeholder={q.placeholder}
                    rows={q.key === "whereWhen" ? 4 : 5}
                  />
                  {q.key === "whereWhen" && (
                    <div className="amb-address-block">
                      <label className="amb-address-label" htmlFor="amb-exact-address">
                        Exact street address <span className="amb-address-optional">(optional)</span>
                      </label>
                      <p className="amb-address-helper">
                        Add the precise address for day-of directions. You can keep it private or show it publicly on your mission page.
                      </p>
                      <input
                        id="amb-exact-address"
                        className="amb-input"
                        value={answers.exactAddress}
                        onChange={(e) => setAnswers((a) => ({ ...a, exactAddress: e.target.value }))}
                        placeholder="1234 Garden St, San Francisco, CA"
                      />
                      <div className="amb-address-visibility">
                        <span id="amb-address-visibility-label" className="amb-address-label">
                          Address visibility
                        </span>
                        <FormPillGroup
                          name="amb_address_visibility"
                          value={addressVisibility}
                          onChange={(v) =>
                            setAnswers((a) => ({
                              ...a,
                              addressVisibility: v as AIMissionAnswers["addressVisibility"],
                            }))
                          }
                          options={[
                            { value: "private", label: "Private" },
                            { value: "public", label: "Public" },
                          ]}
                          labelledBy="amb-address-visibility-label"
                        />
                        <p className="amb-address-note">
                          {addressVisibility === "public"
                            ? "Anyone can see this exact address on Explore and the mission page — including visitors who are not logged in."
                            : "Only a general public location is shown until volunteers are approved."}
                        </p>
                      </div>
                    </div>
                  )}
                  {!canNext && value.trim().length > 0 && (
                    <div className="amb-hint">Add one or two more details so we can create a useful draft.</div>
                  )}
                  <div className="amb-step-actions">{formStepActions}</div>
                </div>
              )}

              {stage === "loading" && (
                <div className="amb-loading">
                  <div className="amb-loading-orb" aria-hidden>
                    <Icon name="sparkles" size={26} />
                  </div>
                  <div className="amb-loading-title">Building your mission draft…</div>
                  <div className="amb-loading-sub">Turning your answers into a clear volunteer opportunity.</div>
                  <div className="amb-loading-steps" aria-live="polite">{LOADING_STEPS[loadingStep]}</div>
                  <div className="amb-skel">
                    <span className="amb-skel-line" style={{ width: "70%" }} />
                    <span className="amb-skel-line" style={{ width: "95%" }} />
                    <span className="amb-skel-line" style={{ width: "88%" }} />
                  </div>
                </div>
              )}

              {stage === "error" && (
                <div className="amb-error">
                  <div className="amb-error-icon" aria-hidden><Icon name="info" size={24} /></div>
                  <div className="amb-error-title">We couldn’t generate the draft</div>
                  <p className="amb-error-body">{error}</p>
                </div>
              )}

              {stage === "review" && draft && (
                <div className="amb-review">
                  <div className="amb-review-lead">
                    Review and edit anything below, then drop it into the mission form. Nothing is saved or
                    published until you do that yourself.
                  </div>

                  {draft.missingInformation.length > 0 && (
                    <div className="amb-warn">
                      <div className="amb-warn-head"><Icon name="info" size={14} /> A few things to double-check</div>
                      <ul>
                        {draft.missingInformation.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="amb-chips">
                    <span className="amb-chip">{categoryName ? `Category: ${categoryName}` : "Category: choose in form"}</span>
                    {draft.difficulty && <span className="amb-chip">Difficulty: {draft.difficulty}</span>}
                    {draft.isBeginnerFriendly && <span className="amb-chip amb-chip--mint">Beginner-friendly</span>}
                    {draft.estimatedHours != null && <span className="amb-chip">~{draft.estimatedHours}h</span>}
                    {draft.volunteerCapacity != null && <span className="amb-chip">{draft.volunteerCapacity} volunteers</span>}
                    <span className="amb-chip">{draft.isVirtual ? "Virtual" : draft.publicLocationLabel || draft.city || "Location TBD"}</span>
                  </div>

                  <Field label="Title">
                    <input className="amb-input" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
                  </Field>
                  <Field label="Summary">
                    <textarea className="amb-input" rows={2} value={draft.summary} onChange={(e) => patch({ summary: e.target.value })} />
                  </Field>
                  <Field label="Description">
                    <textarea className="amb-input" rows={5} value={draft.description} onChange={(e) => patch({ description: e.target.value })} />
                  </Field>
                  <Field label="What volunteers will do (one per line)">
                    <textarea
                      className="amb-input"
                      rows={3}
                      value={draft.whatYouWillDo.join("\n")}
                      onChange={(e) => patch({ whatYouWillDo: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                    />
                  </Field>
                  <Field label="Impact goal">
                    <textarea className="amb-input" rows={2} value={draft.impactGoal} onChange={(e) => patch({ impactGoal: e.target.value })} />
                  </Field>
                  <div className="amb-grid2">
                    <Field label="Required skills (comma separated)">
                      <input className="amb-input" value={draft.requiredSkills.join(", ")} onChange={(e) => patch({ requiredSkills: splitList(e.target.value) })} />
                    </Field>
                    <Field label="Materials needed (comma separated)">
                      <input className="amb-input" value={draft.materialsNeeded.join(", ")} onChange={(e) => patch({ materialsNeeded: splitList(e.target.value) })} />
                    </Field>
                    <Field label="Perks (comma separated)">
                      <input className="amb-input" value={draft.perks.join(", ")} onChange={(e) => patch({ perks: splitList(e.target.value) })} />
                    </Field>
                    <Field label="Safety notes (one per line)">
                      <textarea className="amb-input" rows={2} value={draft.safetyNotes.join("\n")} onChange={(e) => patch({ safetyNotes: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
                    </Field>
                  </div>

                  <div className="amb-grid2">
                    <Field label="Exact address (private details)">
                      <input className="amb-input" value={draft.exactAddress ?? ""} onChange={(e) => patch({ exactAddress: e.target.value || null })} placeholder="1234 Garden St, San Francisco, CA" />
                    </Field>
                    <Field label="Show exact address publicly?">
                      <FormPillGroup
                        name="amb_review_address_visibility"
                        value={draft.showExactAddressPublicly ? "public" : "private"}
                        onChange={(v) => patch({ showExactAddressPublicly: v === "public" })}
                        options={[
                          { value: "private", label: "Private" },
                          { value: "public", label: "Public" },
                        ]}
                      />
                    </Field>
                  </div>

                  {draft.privateMeetingInstructions && (
                    <div className="amb-private">
                      <div className="amb-private-head"><Icon name="info" size={14} /> Meeting instructions (private details)</div>
                      <p>{draft.privateMeetingInstructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* footer actions */}
            <div className={`amb-foot${stage === "form" ? " amb-foot--form" : ""}`}>
              {stage === "form" && formStepActions}

              {stage === "loading" && (
                <div className="amb-actions">
                  <button type="button" className="amb-btn amb-btn--ghost" onClick={close}>Cancel</button>
                </div>
              )}

              {stage === "error" && (
                <div className="amb-actions">
                  <button type="button" className="amb-btn amb-btn--ghost" onClick={() => setStage("form")}>Back to questions</button>
                  <button type="button" className="amb-btn amb-btn--primary" onClick={generate}>Try again</button>
                </div>
              )}

              {stage === "review" && (
                <div className="amb-actions">
                  <button type="button" className="amb-btn amb-btn--ghost" onClick={generate}>
                    <Icon name="trending-up" size={15} /> Regenerate
                  </button>
                  <button type="button" className="amb-btn amb-btn--primary" onClick={apply}>
                    Use this draft
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function splitList(v: string): string[] {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="amb-field">
      <span className="amb-field-label">{label}</span>
      {children}
    </label>
  );
}
