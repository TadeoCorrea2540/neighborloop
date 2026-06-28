"use client";

/**
 * Shared organizer mission form (create + edit). Controlled inputs grouped into
 * mobile-friendly sections. On create it saves a draft (optionally publishing
 * right after); on edit it updates the draft/mission in place. Publish/lifecycle
 * for an existing mission lives in the status bar on the edit page, not here.
 *
 * The cover image is a path/placeholder only — no upload in Phase 5.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import {
  createMissionDraftAction,
  updateMissionAction,
  uploadMissionCoverAction,
  removeMissionCoverAction,
} from "@/app/manage/missions/actions";
import ImageUpload from "@/components/manage/image-upload";
import AIMissionBuilder from "@/components/manage/ai-mission-builder";
import BrandedDateTimeField from "@/components/manage/branded-datetime-field";
import { FormPillGroup, FormRadioGroup, FormToggle } from "@/components/manage/form-choice";
import {
  MissionPrivateDetailsSection,
  emptyPrivateDetails,
  type MissionPrivateDetailsState,
} from "@/components/manage/mission-private-details-section";
import type { AIMissionDraft } from "@/lib/ai/mission-draft-schema";
import type { MissionFull } from "@/types/domain";
import "./mission-form.css";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

type Mode = "create" | "edit";

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "easy", label: "Easy", hint: "Light activity, minimal training" },
  { value: "moderate", label: "Moderate", hint: "Some physical or mental effort" },
  { value: "challenging", label: "Challenging", hint: "Demanding work or skills" },
];

const APPLICATION_OPTIONS = [
  { value: "request", label: "Request to join", hint: "You approve each volunteer" },
  { value: "open", label: "Open — auto-approve", hint: "Volunteers join instantly" },
  { value: "external", label: "External link", hint: "Sign-ups happen off-platform" },
];

// datetime-local helpers — keep the user's wall-clock time.
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface FormState {
  title: string;
  summary: string;
  description: string;
  category_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  estimated_hours: string;
  is_virtual: boolean;
  location_label: string;
  city: string;
  country_code: string;
  volunteer_capacity: string;
  capacity_mode: "limited" | "open";
  minimum_age: string;
  difficulty: string;
  is_beginner_friendly: boolean;
  application_mode: string;
  skills: string;
  materials_needed: string;
  perks: string;
  safety_notes: string;
}

function initialState(mission: MissionFull | null): FormState {
  const tz =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : "UTC";
  if (!mission) {
    return {
      title: "", summary: "", description: "", category_id: "",
      starts_at: "", ends_at: "", timezone: tz, estimated_hours: "",
      is_virtual: false, location_label: "", city: "", country_code: "",
      volunteer_capacity: "", capacity_mode: "limited", minimum_age: "", difficulty: "", is_beginner_friendly: true,
      application_mode: "request", skills: "", materials_needed: "", perks: "", safety_notes: "",
    };
  }
  return {
    title: mission.title,
    summary: mission.summary,
    description: mission.description ?? "",
    category_id: mission.categoryId ?? "",
    starts_at: toLocalInput(mission.startsAt),
    ends_at: toLocalInput(mission.endsAt),
    timezone: mission.timezone || tz,
    estimated_hours: mission.estimatedHours?.toString() ?? "",
    is_virtual: mission.isVirtual,
    location_label: mission.locationLabel ?? "",
    city: mission.city ?? "",
    country_code: mission.countryCode ?? "",
    volunteer_capacity: mission.volunteerCapacity?.toString() ?? "",
    capacity_mode: mission.volunteerCapacity == null ? "open" : "limited",
    minimum_age: mission.minimumAge?.toString() ?? "",
    difficulty: mission.difficulty ?? "",
    is_beginner_friendly: mission.isBeginnerFriendly,
    application_mode: mission.applicationMode || "request",
    skills: mission.skills.join(", "),
    materials_needed: mission.materialsNeeded.join(", "),
    perks: mission.perks.join(", "),
    safety_notes: mission.safetyNotes ?? "",
  };
}

function buildFormData(s: FormState, privateDetails: MissionPrivateDetailsState): FormData {
  const fd = new FormData();
  const strings: (keyof FormState)[] = [
    "title", "summary", "description", "category_id",
    "starts_at", "ends_at", "timezone", "estimated_hours",
    "location_label", "city", "country_code", "volunteer_capacity",
    "minimum_age", "difficulty", "application_mode",
    "skills", "materials_needed", "perks", "safety_notes",
  ];
  for (const k of strings) {
    const v = s[k];
    if (typeof v === "string" && v.trim()) fd.set(k, v.trim());
  }
  if (s.is_virtual) fd.set("is_virtual", "on");
  if (s.is_beginner_friendly) fd.set("is_beginner_friendly", "on");

  const pdStrings: (keyof MissionPrivateDetailsState)[] = [
    "exact_address",
    "private_meeting_instructions",
    "private_contact_name",
    "private_contact_phone",
    "private_contact_email",
  ];
  for (const k of pdStrings) {
    const v = privateDetails[k];
    if (typeof v === "string" && v.trim()) fd.set(k, v.trim());
  }
  if (privateDetails.show_exact_address_publicly) fd.set("show_exact_address_publicly", "on");

  return fd;
}

export default function MissionForm({
  mode,
  mission,
  categories,
  coverImageUrl = null,
  initialPrivateDetails = null,
}: {
  mode: Mode;
  mission: MissionFull | null;
  categories: CategoryOption[];
  coverImageUrl?: string | null;
  initialPrivateDetails?: MissionPrivateDetailsState | null;
}) {
  const router = useRouter();
  const [s, setS] = useState<FormState>(() => initialState(mission));
  const [privateDetails, setPrivateDetails] = useState<MissionPrivateDetailsState>(
    () => initialPrivateDetails ?? emptyPrivateDetails()
  );
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [createDraftId, setCreateDraftId] = useState<string | null>(null);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setS((prev) => ({ ...prev, [k]: v }));
    setFieldErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const setPrivate = <K extends keyof MissionPrivateDetailsState>(
    k: K,
    v: MissionPrivateDetailsState[K]
  ) => {
    setPrivateDetails((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "show_exact_address_publicly" && v === true && next.exact_address.trim()) {
        setS((sPrev) => ({ ...sPrev, location_label: next.exact_address.trim() }));
      }
      if (k === "exact_address" && typeof v === "string" && next.show_exact_address_publicly && v.trim()) {
        setS((sPrev) => ({ ...sPrev, location_label: v.trim() }));
      }
      return next;
    });
  };

  const addressIsPublic = privateDetails.show_exact_address_publicly;

  // Fill the form from an approved AI draft. Everything stays editable, and
  // nothing is saved — the organizer still hits Save/Publish below.
  function applyDraft(d: AIMissionDraft) {
    const catId = d.categorySlug ? categories.find((c) => c.slug === d.categorySlug)?.id ?? "" : "";
    const descParts = [d.description.trim()];
    if (d.whatYouWillDo.length) descParts.push("What you’ll do:\n" + d.whatYouWillDo.map((x) => `• ${x}`).join("\n"));
    if (d.impactGoal.trim()) descParts.push("Impact goal:\n" + d.impactGoal.trim());
    setS((prev) => ({
      ...prev,
      title: d.title || prev.title,
      summary: d.summary || prev.summary,
      description: descParts.filter(Boolean).join("\n\n") || prev.description,
      category_id: catId || prev.category_id,
      difficulty: d.difficulty ?? prev.difficulty,
      is_beginner_friendly: d.isBeginnerFriendly,
      estimated_hours: d.estimatedHours != null ? String(d.estimatedHours) : prev.estimated_hours,
      volunteer_capacity: d.volunteerCapacity != null ? String(d.volunteerCapacity) : "",
      capacity_mode: d.volunteerCapacity != null ? "limited" : "open",
      is_virtual: d.isVirtual,
      city: d.city ?? prev.city,
      skills: d.requiredSkills.length ? d.requiredSkills.join(", ") : prev.skills,
      materials_needed: d.materialsNeeded.length ? d.materialsNeeded.join(", ") : prev.materials_needed,
      perks: d.perks.length ? d.perks.join(", ") : prev.perks,
      safety_notes: d.safetyNotes.length ? d.safetyNotes.join("\n") : prev.safety_notes,
      starts_at: d.suggestedStartsAt ? toLocalInput(d.suggestedStartsAt) : prev.starts_at,
      ends_at: d.suggestedEndsAt ? toLocalInput(d.suggestedEndsAt) : prev.ends_at,
      location_label:
        d.showExactAddressPublicly && d.exactAddress
          ? d.exactAddress
          : d.publicLocationLabel ?? prev.location_label,
    }));
    setPrivateDetails((prev) => ({
      ...prev,
      exact_address: d.exactAddress ?? prev.exact_address,
      show_exact_address_publicly: d.showExactAddressPublicly ?? prev.show_exact_address_publicly,
      private_meeting_instructions: d.privateMeetingInstructions ?? prev.private_meeting_instructions,
    }));
    show("Draft added below — review private details and address visibility, then save when you’re ready.", "success");
  }

  const previewWhen = useMemo(() => {
    if (!s.starts_at) return "Date TBD";
    const d = new Date(s.starts_at);
    return Number.isNaN(d.getTime())
      ? "Date TBD"
      : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }, [s.starts_at]);

  function routeOnGuard(code: string): boolean {
    if (code === "auth") {
      router.push("/auth?next=/manage/missions");
      return true;
    }
    if (code === "no_org") {
      router.push("/manage/onboarding");
      return true;
    }
    return false;
  }

  function validate(publishAfter: boolean): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {};
    const missingLabels: string[] = [];

    const mark = (key: keyof FormState, label: string, message: string) => {
      errors[key] = message;
      missingLabels.push(label);
    };

    if (!s.title.trim()) mark("title", "mission title", "Add a mission title.");
    if (!s.summary.trim()) mark("summary", "short summary", "Add a short summary.");

    if (!s.starts_at) mark("starts_at", "start date & time", "Add a start date before publishing this mission.");
    else if (!/T\d{2}:\d{2}/.test(s.starts_at)) {
      mark("starts_at", "start time", "Choose a start time for this mission.");
    }

    if (publishAfter) {
      if (!s.description.trim()) mark("description", "description", "Add a description before publishing.");
      if (!s.category_id) mark("category_id", "category", "Choose a category before publishing.");
      if (!s.is_virtual) {
        if (!s.location_label.trim()) mark("location_label", "location", "Add a public location before publishing.");
        if (!s.city.trim()) mark("city", "city", "Add a city before publishing.");
      }
    }

    if (s.ends_at && s.starts_at) {
      const start = new Date(s.starts_at).getTime();
      const end = new Date(s.ends_at).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
        errors.ends_at = "End time must be after the start time.";
        missingLabels.push("end time");
      }
    }

    setFieldErrors(errors);
    if (missingLabels.length > 0) {
      const unique = Array.from(new Set(missingLabels));
      show(
        publishAfter
          ? `Before publishing, add: ${unique.join(", ")}.`
          : unique[0] === "end time"
            ? errors.ends_at!
            : errors.title ?? errors.summary ?? errors.starts_at ?? "Please fix the highlighted fields.",
        "error"
      );
      return false;
    }
    if (Object.keys(errors).length > 0) {
      show(errors.ends_at ?? "Please fix the highlighted fields.", "error");
      return false;
    }
    return true;
  }

  function submit(publishAfter: boolean) {
    if (!validate(publishAfter)) return;

    start(async () => {
      const fd = buildFormData(s, privateDetails);
      if (mode === "create") {
        let missionId = createDraftId;

        if (createDraftId) {
          const updateRes = await updateMissionAction(createDraftId, fd);
          if (!updateRes.ok) {
            if (routeOnGuard(updateRes.code)) return;
            return show(updateRes.error, "error");
          }
        } else {
          const createRes = await createMissionDraftAction(fd);
          if (!createRes.ok) {
            if (routeOnGuard(createRes.code)) return;
            return show(createRes.error, "error");
          }
          missionId = createRes.missionId;
          setCreateDraftId(createRes.missionId);
        }

        if (!missionId) return;

        if (publishAfter) {
          const { publishMissionAction } = await import("@/app/manage/missions/actions");
          const pub = await publishMissionAction(missionId);
          if (!pub.ok) {
            show(pub.error, "error");
            return;
          }
          show("Mission published — it’s live on Explore.", "success");
          router.push("/manage/dashboard?published=1");
          router.refresh();
          return;
        }
        show("Draft saved.", "success");
        router.push(`/manage/missions/${missionId}/edit`);
        router.refresh();
        return;
      }

      // edit
      const res = await updateMissionAction(mission!.id, fd);
      if (!res.ok) {
        if (routeOnGuard(res.code)) return;
        return show(res.error, "error");
      }
      show("Changes saved.", "success");
      router.push("/manage/dashboard");
    });
  }

  return (
    <div className="mf-page">
      {mode === "create" && <AIMissionBuilder categories={categories} onApply={applyDraft} />}

      <section className="mf-section">
        <h3 className="mf-section-title">Basics</h3>
        <p className="mf-section-hint">What is this mission and who is it for?</p>

        <div className="mf-field">
          <label className="mf-label" htmlFor="title">Mission title</label>
          <input id="title" className={`mf-input${fieldErrors.title ? " mf-input--error" : ""}`} value={s.title} onChange={(e) => set("title", e.target.value)} placeholder="Community Garden Planting Day" maxLength={140} aria-invalid={Boolean(fieldErrors.title)} />
          {fieldErrors.title ? <p className="mf-error" role="alert">{fieldErrors.title}</p> : null}
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="summary">Short summary</label>
          <input id="summary" className={`mf-input${fieldErrors.summary ? " mf-input--error" : ""}`} value={s.summary} onChange={(e) => set("summary", e.target.value)} placeholder="One line shown on cards & search" maxLength={200} aria-invalid={Boolean(fieldErrors.summary)} />
          {fieldErrors.summary ? <p className="mf-error" role="alert">{fieldErrors.summary}</p> : null}
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="description">Description</label>
          <textarea id="description" className={`mf-textarea${fieldErrors.description ? " mf-input--error" : ""}`} value={s.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the work, the impact, and what a volunteer's day looks like. (Required to publish.)" aria-invalid={Boolean(fieldErrors.description)} />
          {fieldErrors.description ? <p className="mf-error" role="alert">{fieldErrors.description}</p> : null}
        </div>
        <div className="mf-field">
          <span id="mf-category-label" className="mf-label">Category</span>
          <FormPillGroup
            name="category_id"
            value={s.category_id}
            onChange={(v) => set("category_id", v)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            labelledBy="mf-category-label"
          />
          {fieldErrors.category_id ? <p className="mf-error" role="alert">{fieldErrors.category_id}</p> : null}
        </div>

        {mode === "edit" && mission ? (
          <div style={{ marginTop: 16 }}>
            <ImageUpload
              label="Cover image"
              currentUrl={coverImageUrl}
              hint="Shown on Explore and the mission page. Up to 5MB (JPG/PNG/WebP). Falls back to the coral placeholder if none."
              upload={(fd) => uploadMissionCoverAction(mission.id, fd)}
              onRemove={() => removeMissionCoverAction(mission.id)}
            />
          </div>
        ) : (
          <p className="mf-note" style={{ marginTop: 6 }}>
            You can add a cover image after saving, from the edit page. Until then a category gradient is used.
          </p>
        )}
      </section>

      <section className="mf-section">
        <h3 className="mf-section-title">When</h3>
        <p className="mf-section-hint">Times use your timezone ({s.timezone}).</p>
        <div className="mf-grid mf-grid--2">
          <BrandedDateTimeField id="starts_at" label="Starts" value={s.starts_at} onChange={(v) => set("starts_at", v)} error={fieldErrors.starts_at} />
          <BrandedDateTimeField id="ends_at" label="Ends" value={s.ends_at} onChange={(v) => set("ends_at", v)} optional error={fieldErrors.ends_at} />
        </div>
        <div className="mf-grid mf-grid--2" style={{ marginTop: 14 }}>
          <div className="mf-field">
            <label className="mf-label" htmlFor="timezone">Timezone</label>
            <input id="timezone" className="mf-input" value={s.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="UTC" />
          </div>
          <div className="mf-field">
            <label className="mf-label" htmlFor="estimated_hours">Estimated hours <span className="mf-label-hint">(optional)</span></label>
            <input id="estimated_hours" type="number" min={0} step="0.5" className="mf-input" value={s.estimated_hours} onChange={(e) => set("estimated_hours", e.target.value)} placeholder="3" />
          </div>
        </div>
      </section>

      <section className="mf-section">
        <h3 className="mf-section-title">Where</h3>
        <p className="mf-section-hint">City & location are required to publish an in-person mission.</p>
        <div className="mf-field">
          <FormToggle id="is_virtual" checked={s.is_virtual} onChange={(v) => set("is_virtual", v)} label="This is a virtual / remote mission" hint="Skip public address fields when volunteers join online." />
        </div>
        {!s.is_virtual && (
          <>
            <div className="mf-field">
              <label className="mf-label" htmlFor="location_label">
                Location {addressIsPublic ? <span className="mf-label-hint">(using public exact address)</span> : null}
              </label>
              <input
                id="location_label"
                className={`mf-input${fieldErrors.location_label ? " mf-input--error" : ""}`}
                value={s.location_label}
                onChange={(e) => set("location_label", e.target.value)}
                placeholder="Mission Community Garden"
                disabled={addressIsPublic && Boolean(privateDetails.exact_address.trim())}
                aria-invalid={Boolean(fieldErrors.location_label)}
              />
              {fieldErrors.location_label ? <p className="mf-error" role="alert">{fieldErrors.location_label}</p> : null}
            </div>
            <div className="mf-grid mf-grid--2">
              <div className="mf-field">
                <label className="mf-label" htmlFor="city">City</label>
                <input id="city" className={`mf-input${fieldErrors.city ? " mf-input--error" : ""}`} value={s.city} onChange={(e) => set("city", e.target.value)} placeholder="San Francisco" aria-invalid={Boolean(fieldErrors.city)} />
                {fieldErrors.city ? <p className="mf-error" role="alert">{fieldErrors.city}</p> : null}
              </div>
              <div className="mf-field">
                <label className="mf-label" htmlFor="country_code">Country code <span className="mf-label-hint">(optional)</span></label>
                <input id="country_code" className="mf-input" value={s.country_code} onChange={(e) => set("country_code", e.target.value)} placeholder="US" maxLength={8} />
              </div>
            </div>
          </>
        )}
        <p className="mf-note">
          The public location above helps volunteers decide whether to apply. Exact address, day-of contact, and visibility are in <strong>Private details</strong> below.
        </p>
      </section>

      {!s.is_virtual ? (
        <section className="mf-section mf-section--private" id="mf-private-details">
          <MissionPrivateDetailsSection values={privateDetails} onChange={setPrivate} />
        </section>
      ) : null}

      <section className="mf-section">
        <h3 className="mf-section-title">Logistics</h3>
        <p className="mf-section-hint">Capacity, requirements, and what volunteers should know.</p>
        <div className="mf-grid mf-grid--2">
          <div className="mf-field">
            <span id="mf-capacity-label" className="mf-label">Volunteers needed</span>
            <FormPillGroup
              name="capacity_mode"
              value={s.capacity_mode}
              onChange={(v) => {
                const mode = v as FormState["capacity_mode"];
                set("capacity_mode", mode);
                if (mode === "open") set("volunteer_capacity", "");
              }}
              options={[
                { value: "limited", label: "Limited spots" },
                { value: "open", label: "Open" },
              ]}
              labelledBy="mf-capacity-label"
            />
            {s.capacity_mode === "limited" ? (
              <input
                id="volunteer_capacity"
                type="number"
                min={1}
                className="mf-input mf-input--compact"
                value={s.volunteer_capacity}
                onChange={(e) => set("volunteer_capacity", e.target.value)}
                placeholder="12"
                aria-label="Number of volunteers"
              />
            ) : (
              <p className="mf-capacity-open-hint">No limit on volunteers — anyone approved can join.</p>
            )}
          </div>
          <div className="mf-field">
            <label className="mf-label" htmlFor="minimum_age">Minimum age</label>
            <input id="minimum_age" type="number" min={0} max={120} className="mf-input" value={s.minimum_age} onChange={(e) => set("minimum_age", e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="mf-field" style={{ marginTop: 14 }}>
          <span id="mf-difficulty-label" className="mf-label">Difficulty</span>
          <FormRadioGroup name="difficulty" value={s.difficulty} onChange={(v) => set("difficulty", v)} options={DIFFICULTY_OPTIONS} labelledBy="mf-difficulty-label" />
        </div>

        <div className="mf-field" style={{ marginTop: 14 }}>
          <span id="mf-join-label" className="mf-label">How volunteers join</span>
          <FormRadioGroup name="application_mode" value={s.application_mode} onChange={(v) => set("application_mode", v)} options={APPLICATION_OPTIONS} labelledBy="mf-join-label" />
        </div>

        <div className="mf-field" style={{ marginTop: 8 }}>
          <FormToggle id="is_beginner_friendly" checked={s.is_beginner_friendly} onChange={(v) => set("is_beginner_friendly", v)} label="Beginner friendly" hint="Great for first-time volunteers." />
        </div>

        <div className="mf-field" style={{ marginTop: 14 }}>
          <label className="mf-label" htmlFor="skills">Skills <span className="mf-label-hint">(comma-separated)</span></label>
          <input id="skills" className="mf-input" value={s.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Outdoors, Teamwork" />
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="materials_needed">Materials to bring <span className="mf-label-hint">(comma-separated)</span></label>
          <input id="materials_needed" className="mf-input" value={s.materials_needed} onChange={(e) => set("materials_needed", e.target.value)} placeholder="Water bottle, Sun hat" />
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="perks">Perks <span className="mf-label-hint">(comma-separated)</span></label>
          <input id="perks" className="mf-input" value={s.perks} onChange={(e) => set("perks", e.target.value)} placeholder="Snacks provided, Volunteer certificate" />
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="safety_notes">Safety notes</label>
          <textarea id="safety_notes" className="mf-textarea mf-textarea--sm" value={s.safety_notes} onChange={(e) => set("safety_notes", e.target.value)} placeholder="Bring water and sun protection. Tools and gloves provided on site." />
        </div>
      </section>

      <div className={`mf-actions${mode === "edit" ? " mf-actions--edit" : ""}`}>
        {mode === "create" && (
          <span className="mf-preview">
            Preview: {s.title || "Untitled mission"} · {previewWhen}
          </span>
        )}
        {mode === "create" ? (
          <>
            <button type="button" disabled={pending} onClick={() => submit(false)} className="mf-btn-ghost">
              {pending ? "Saving…" : "Save as draft"}
            </button>
            <button type="button" disabled={pending} onClick={() => submit(true)} className="mf-btn-coral btn-coral">
              {pending ? "Working…" : "Save & publish"}
            </button>
          </>
        ) : (
          <button type="button" disabled={pending} onClick={() => submit(false)} className="mf-btn-coral btn-coral">
            {pending ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
