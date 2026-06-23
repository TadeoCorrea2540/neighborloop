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
} from "@/app/manage/missions/actions";
import type { MissionFull } from "@/types/domain";

interface CategoryOption {
  id: string;
  name: string;
}

type Mode = "create" | "edit";

// ---- styling tokens (match the rest of /manage) ----
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#3a425e", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid rgba(24,32,59,.14)",
  borderRadius: 12,
  padding: "11px 13px",
  fontSize: 14,
  outline: "none",
  background: "#fbfcfe",
};
const sectionCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  border: "1px solid rgba(24,32,59,.06)",
  padding: 22,
  marginBottom: 18,
};
const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 800, margin: "0 0 4px" };
const sectionHint: React.CSSProperties = { fontSize: 13, color: "var(--muted-3)", margin: "0 0 16px" };

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
  cover_image_path: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  estimated_hours: string;
  is_virtual: boolean;
  location_label: string;
  city: string;
  country_code: string;
  volunteer_capacity: string;
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
      title: "", summary: "", description: "", category_id: "", cover_image_path: "",
      starts_at: "", ends_at: "", timezone: tz, estimated_hours: "",
      is_virtual: false, location_label: "", city: "", country_code: "",
      volunteer_capacity: "", minimum_age: "", difficulty: "", is_beginner_friendly: true,
      application_mode: "request", skills: "", materials_needed: "", perks: "", safety_notes: "",
    };
  }
  return {
    title: mission.title,
    summary: mission.summary,
    description: mission.description ?? "",
    category_id: mission.categoryId ?? "",
    cover_image_path: mission.coverImagePath ?? "",
    starts_at: toLocalInput(mission.startsAt),
    ends_at: toLocalInput(mission.endsAt),
    timezone: mission.timezone || tz,
    estimated_hours: mission.estimatedHours?.toString() ?? "",
    is_virtual: mission.isVirtual,
    location_label: mission.locationLabel ?? "",
    city: mission.city ?? "",
    country_code: mission.countryCode ?? "",
    volunteer_capacity: mission.volunteerCapacity?.toString() ?? "",
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

function buildFormData(s: FormState): FormData {
  const fd = new FormData();
  const strings: (keyof FormState)[] = [
    "title", "summary", "description", "category_id", "cover_image_path",
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
  return fd;
}

export default function MissionForm({
  mode,
  mission,
  categories,
}: {
  mode: Mode;
  mission: MissionFull | null;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [s, setS] = useState<FormState>(() => initialState(mission));
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

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

  function submit(publishAfter: boolean) {
    if (!s.title.trim()) return show("Please add a mission title.", "error");
    if (!s.summary.trim()) return show("Please add a short summary.", "error");
    if (!s.starts_at) return show("Please choose a start date & time.", "error");

    start(async () => {
      const fd = buildFormData(s);
      if (mode === "create") {
        const res = await createMissionDraftAction(fd);
        if (!res.ok) {
          if (routeOnGuard(res.code)) return;
          return show(res.error, "error");
        }
        if (publishAfter) {
          const { publishMissionAction } = await import("@/app/manage/missions/actions");
          const pub = await publishMissionAction(res.missionId);
          if (!pub.ok) {
            // Draft saved but publish blocked — send them to edit with the reason.
            show(pub.error, "error");
            router.push(`/manage/missions/${res.missionId}/edit`);
            return;
          }
          show("Mission published — it’s live on Explore.", "success");
        } else {
          show("Draft saved.", "success");
        }
        router.push(`/manage/missions/${res.missionId}/edit`);
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
      router.refresh();
    });
  }

  return (
    <div>
      {/* Basics */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>Basics</h3>
        <p style={sectionHint}>What is this mission and who is it for?</p>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="title">Mission title</label>
          <input id="title" style={inputStyle} value={s.title} onChange={(e) => set("title", e.target.value)} placeholder="Community Garden Planting Day" maxLength={140} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="summary">Short summary</label>
          <input id="summary" style={inputStyle} value={s.summary} onChange={(e) => set("summary", e.target.value)} placeholder="One line shown on cards & search" maxLength={200} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="description">Description</label>
          <textarea id="description" style={{ ...inputStyle, minHeight: 120, resize: "vertical", lineHeight: 1.5 }} value={s.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the work, the impact, and what a volunteer's day looks like. (Required to publish.)" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-2col">
          <div>
            <label style={labelStyle} htmlFor="category_id">Category</label>
            <select id="category_id" style={inputStyle} value={s.category_id} onChange={(e) => set("category_id", e.target.value)}>
              <option value="">Choose a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="cover_image_path">Cover image path <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(optional)</span></label>
            <input id="cover_image_path" style={inputStyle} value={s.cover_image_path} onChange={(e) => set("cover_image_path", e.target.value)} placeholder="e.g. covers/garden.jpg" />
          </div>
        </div>
      </div>

      {/* When */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>When</h3>
        <p style={sectionHint}>Times use your timezone ({s.timezone}).</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-2col">
          <div>
            <label style={labelStyle} htmlFor="starts_at">Starts</label>
            <input id="starts_at" type="datetime-local" style={inputStyle} value={s.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="ends_at">Ends <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(optional)</span></label>
            <input id="ends_at" type="datetime-local" style={inputStyle} value={s.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }} className="form-2col">
          <div>
            <label style={labelStyle} htmlFor="timezone">Timezone</label>
            <input id="timezone" style={inputStyle} value={s.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="UTC" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="estimated_hours">Estimated hours <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(optional)</span></label>
            <input id="estimated_hours" type="number" min={0} step="0.5" style={inputStyle} value={s.estimated_hours} onChange={(e) => set("estimated_hours", e.target.value)} placeholder="3" />
          </div>
        </div>
      </div>

      {/* Where */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>Where</h3>
        <p style={sectionHint}>City & location are required to publish an in-person mission.</p>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 14 }}>
          <input type="checkbox" checked={s.is_virtual} onChange={(e) => set("is_virtual", e.target.checked)} style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#3a425e" }}>This is a virtual / remote mission</span>
        </label>
        {!s.is_virtual && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="location_label">Location</label>
              <input id="location_label" style={inputStyle} value={s.location_label} onChange={(e) => set("location_label", e.target.value)} placeholder="Mission Community Garden" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-2col">
              <div>
                <label style={labelStyle} htmlFor="city">City</label>
                <input id="city" style={inputStyle} value={s.city} onChange={(e) => set("city", e.target.value)} placeholder="San Francisco" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="country_code">Country code <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(optional)</span></label>
                <input id="country_code" style={inputStyle} value={s.country_code} onChange={(e) => set("country_code", e.target.value)} placeholder="US" maxLength={8} />
              </div>
            </div>
          </>
        )}
        <p style={{ fontSize: 12.5, color: "var(--muted-3)", margin: "12px 0 0" }}>
          🔒 Exact address & contact details are added separately as <strong>private details</strong> — never shown publicly.
        </p>
      </div>

      {/* Logistics */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>Logistics</h3>
        <p style={sectionHint}>Capacity, requirements, and what volunteers should know.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="form-2col">
          <div>
            <label style={labelStyle} htmlFor="volunteer_capacity">Volunteers needed</label>
            <input id="volunteer_capacity" type="number" min={1} style={inputStyle} value={s.volunteer_capacity} onChange={(e) => set("volunteer_capacity", e.target.value)} placeholder="12" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="minimum_age">Minimum age</label>
            <input id="minimum_age" type="number" min={0} max={120} style={inputStyle} value={s.minimum_age} onChange={(e) => set("minimum_age", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" style={inputStyle} value={s.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              <option value="">Not specified</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }} className="form-2col">
          <div>
            <label style={labelStyle} htmlFor="application_mode">How volunteers join</label>
            <select id="application_mode" style={inputStyle} value={s.application_mode} onChange={(e) => set("application_mode", e.target.value)}>
              <option value="request">Request to join (you approve)</option>
              <option value="open">Open — auto-approve</option>
              <option value="external">External link / off-platform</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", paddingBottom: 11 }}>
              <input type="checkbox" checked={s.is_beginner_friendly} onChange={(e) => set("is_beginner_friendly", e.target.checked)} style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#3a425e" }}>Beginner friendly</span>
            </label>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle} htmlFor="skills">Skills <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(comma-separated)</span></label>
          <input id="skills" style={inputStyle} value={s.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Outdoors, Teamwork" />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle} htmlFor="materials_needed">Materials to bring <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(comma-separated)</span></label>
          <input id="materials_needed" style={inputStyle} value={s.materials_needed} onChange={(e) => set("materials_needed", e.target.value)} placeholder="Water bottle, Sun hat" />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle} htmlFor="perks">Perks <span style={{ fontWeight: 500, color: "var(--muted-3)" }}>(comma-separated)</span></label>
          <input id="perks" style={inputStyle} value={s.perks} onChange={(e) => set("perks", e.target.value)} placeholder="Snacks provided, Volunteer certificate" />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle} htmlFor="safety_notes">Safety notes</label>
          <textarea id="safety_notes" style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={s.safety_notes} onChange={(e) => set("safety_notes", e.target.value)} placeholder="Bring water and sun protection. Tools and gloves provided on site." />
        </div>
      </div>

      {/* actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {mode === "create" && (
          <span style={{ fontSize: 12.5, color: "var(--muted-3)", marginRight: "auto" }}>
            Preview: {s.title || "Untitled mission"} · {previewWhen}
          </span>
        )}
        {mode === "create" ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit(false)}
              style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-1)", background: "#fff", border: "1px solid rgba(24,32,59,.14)", padding: "12px 20px", borderRadius: 12, cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1 }}
            >
              {pending ? "Saving…" : "Save as draft"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit(true)}
              className="btn-coral"
              style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "12px 22px", borderRadius: 12, border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)" }}
            >
              {pending ? "Working…" : "🚀 Save & publish"}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(false)}
            className="btn-coral"
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "12px 24px", borderRadius: 12, border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)" }}
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
