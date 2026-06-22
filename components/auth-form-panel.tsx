"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AVAILABILITY_OPTIONS,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  HEAR_ABOUT_OPTIONS,
  HOST_KIND_OPTIONS,
  ORG_TEAM_SIZES,
  ORG_TYPES,
  TRANSPORT_OPTIONS,
  VOLUNTEER_CAUSES,
  VOLUNTEER_SKILLS,
  emptyFamilyForm,
  emptyIndividualForm,
  emptyOrgForm,
  emptyVolunteerForm,
  type FamilySignupData,
  type HostKind,
  type IndividualSignupData,
  type OrgSignupData,
  type VolunteerSignupData,
} from "@/lib/auth-form-data";
import { CauseIcon, isVolunteerCause } from "@/components/cause-icons";
import { signUpAction, signInAction, type SignUpInput } from "@/app/auth/actions";
import AuthToast from "@/components/auth/auth-toast";

type Role = "volunteer" | "host";

const tabOn: React.CSSProperties = {
  padding: "9px 20px",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  background: "#fff",
  color: "var(--ink)",
  boxShadow: "0 4px 10px -4px rgba(24,32,59,.3)",
};
const tabOff: React.CSSProperties = {
  padding: "9px 20px",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  background: "transparent",
  color: "var(--muted-3)",
};
const roleBase: React.CSSProperties = {
  borderRadius: 15,
  padding: "15px 14px",
  cursor: "pointer",
  transition: ".18s",
  border: "1.5px solid rgba(24,32,59,.1)",
  background: "var(--bg-tint)",
  textAlign: "center",
};
const roleSel: React.CSSProperties = {
  ...roleBase,
  border: "1.5px solid #ff6f5e",
  background: "#fff0ec",
  boxShadow: "0 10px 22px -12px rgba(255,111,94,.7)",
};

function toggleChip(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="auth-steps" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`auth-step-dot ${i + 1 === step ? "auth-step-dot--active" : ""} ${i + 1 < step ? "auth-step-dot--done" : ""}`}
        />
      ))}
    </div>
  );
}

function ChipPicker({
  options,
  selected,
  onChange,
  renderLabel,
  renderIcon,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  renderLabel?: (opt: string) => string;
  renderIcon?: (opt: string) => React.ReactNode;
}) {
  return (
    <div className="auth-chip-grid">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            className={`auth-chip ${on ? "auth-chip--on" : ""}`}
            onClick={() => onChange(toggleChip(selected, opt))}
          >
            {renderIcon ? (
              <span className="auth-chip-icon">{renderIcon(opt)}</span>
            ) : null}
            {renderLabel ? renderLabel(opt) : opt}
          </button>
        );
      })}
    </div>
  );
}

function causeChipIcon(opt: string) {
  if (!isVolunteerCause(opt)) return null;
  return <CauseIcon cause={opt} size={14} />;
}

function VolunteerSignupForm({
  data,
  setData,
  step,
  setStep,
  onSubmit,
  submitting,
}: {
  data: VolunteerSignupData;
  setData: React.Dispatch<React.SetStateAction<VolunteerSignupData>>;
  step: number;
  setStep: (n: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const patch = (partial: Partial<VolunteerSignupData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const stepLabels = ["About you", "Skills & causes", "Availability"];

  return (
    <>
      <StepBar step={step} total={3} />
      <p className="auth-step-label">
        Step {step} of 3 · {stepLabels[step - 1]}
      </p>

      {step === 1 && (
        <div className="auth-section">
          <p className="auth-section-title">Personal info</p>
          <div className="auth-field-row auth-field">
            <div>
              <label className="auth-label" htmlFor="firstName">First name</label>
              <input
                id="firstName"
                className="auth-input"
                placeholder="Maya"
                value={data.firstName}
                onChange={(e) => patch({ firstName: e.target.value })}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="auth-label" htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                className="auth-input"
                placeholder="Rivera"
                value={data.lastName}
                onChange={(e) => patch({ lastName: e.target.value })}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="you@neighborhood.com"
              value={data.email}
              onChange={(e) => patch({ email: e.target.value })}
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="auth-input"
              placeholder="At least 8 characters"
              value={data.password}
              onChange={(e) => patch({ password: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field-row auth-field">
            <div>
              <label className="auth-label" htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                min={13}
                max={120}
                className="auth-input"
                placeholder="18"
                value={data.age}
                onChange={(e) => patch({ age: e.target.value })}
              />
            </div>
            <div>
              <label className="auth-label" htmlFor="phone">
                Phone <span className="auth-label-hint">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                className="auth-input"
                placeholder="(555) 123-4567"
                value={data.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="auth-field-row auth-field">
            <div>
              <label className="auth-label" htmlFor="city">City</label>
              <input
                id="city"
                className="auth-input"
                placeholder="San Francisco"
                value={data.city}
                onChange={(e) => patch({ city: e.target.value })}
                autoComplete="address-level2"
              />
            </div>
            <div>
              <label className="auth-label" htmlFor="state">State / region</label>
              <input
                id="state"
                className="auth-input"
                placeholder="CA"
                value={data.state}
                onChange={(e) => patch({ state: e.target.value })}
                autoComplete="address-level1"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="auth-section">
          <p className="auth-section-title">Background</p>
          <div className="auth-field">
            <label className="auth-label" htmlFor="education">Education level</label>
            <select
              id="education"
              className="auth-select"
              value={data.education}
              onChange={(e) => patch({ education: e.target.value })}
            >
              <option value="">Select one</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="schoolOrWork">
              School or workplace <span className="auth-label-hint">(optional)</span>
            </label>
            <input
              id="schoolOrWork"
              className="auth-input"
              placeholder="Lincoln High · or Acme Co."
              value={data.schoolOrWork}
              onChange={(e) => patch({ schoolOrWork: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Volunteer experience</label>
            <div className="auth-chip-grid">
              {EXPERIENCE_LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`auth-chip ${data.experience === value ? "auth-chip--on" : ""}`}
                  onClick={() => patch({ experience: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">Skills you can offer</label>
            <ChipPicker
              options={VOLUNTEER_SKILLS}
              selected={data.skills}
              onChange={(skills) => patch({ skills })}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Causes you care about</label>
            <ChipPicker
              options={[...VOLUNTEER_CAUSES]}
              selected={data.causes}
              onChange={(causes) => patch({ causes })}
              renderIcon={causeChipIcon}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="auth-section">
          <p className="auth-section-title">When &amp; how you help</p>
          <div className="auth-field">
            <label className="auth-label">Typical availability</label>
            <ChipPicker
              options={AVAILABILITY_OPTIONS}
              selected={data.availability}
              onChange={(availability) => patch({ availability })}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="transport">Getting to missions</label>
            <select
              id="transport"
              className="auth-select"
              value={data.transport}
              onChange={(e) => patch({ transport: e.target.value })}
            >
              <option value="">Select one</option>
              {TRANSPORT_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="bio">
              Short intro <span className="auth-label-hint">(optional)</span>
            </label>
            <textarea
              id="bio"
              className="auth-textarea"
              placeholder="Why you want to volunteer, languages you speak, anything organizers should know…"
              value={data.bio}
              onChange={(e) => patch({ bio: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="hearAbout">
              How did you hear about us? <span className="auth-label-hint">(optional)</span>
            </label>
            <select
              id="hearAbout"
              className="auth-select"
              value={data.hearAbout}
              onChange={(e) => patch({ hearAbout: e.target.value })}
            >
              <option value="">Select one</option>
              {HEAR_ABOUT_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <label className="auth-check-row">
            <input
              type="checkbox"
              checked={data.agreeTerms}
              onChange={(e) => patch({ agreeTerms: e.target.checked })}
            />
            <span>
              I agree to the Terms &amp; Privacy Policy. I understand NeighborLoop may
              share my profile with verified organizations for mission matching.
            </span>
          </label>
        </div>
      )}

      <div className="auth-nav-row">
        {step > 1 ? (
          <button type="button" className="auth-btn-back" onClick={() => setStep(step - 1)}>
            Back
          </button>
        ) : null}
        {step < 3 ? (
          <button
            type="button"
            className="btn-coral auth-btn-next"
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 15.5,
              padding: 14,
              borderRadius: 13,
              boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
            }}
            onClick={() => setStep(step + 1)}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="btn-coral auth-btn-next"
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: 700,
              fontSize: 15.5,
              padding: 14,
              borderRadius: 13,
              boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
              display: "block",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Creating…" : "Create account"}
          </button>
        )}
      </div>
    </>
  );
}

function HostKindPicker({
  value,
  onChange,
}: {
  value: HostKind;
  onChange: (kind: HostKind) => void;
}) {
  return (
    <div className="auth-subtype-section">
      <div className="auth-subtype-heading">Which best describes you?</div>
      <div className="auth-subtype-pills">
        {HOST_KIND_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`auth-subtype-pill ${value === opt.value ? "auth-subtype-pill--on" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FamilySignupForm({
  data,
  setData,
  onSubmit,
  submitting,
}: {
  data: FamilySignupData;
  setData: React.Dispatch<React.SetStateAction<FamilySignupData>>;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const patch = (partial: Partial<FamilySignupData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  return (
    <>
      <div className="auth-section">
        <p className="auth-section-title">Your household</p>
        <div className="auth-field">
          <label className="auth-label" htmlFor="groupName">Family or group name</label>
          <input
            id="groupName"
            className="auth-input"
            placeholder="The Rivera Family"
            value={data.groupName}
            onChange={(e) => patch({ groupName: e.target.value })}
          />
        </div>
        <div className="auth-field-row auth-field">
          <div>
            <label className="auth-label" htmlFor="familyCity">City</label>
            <input
              id="familyCity"
              className="auth-input"
              placeholder="San Francisco"
              value={data.city}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </div>
          <div>
            <label className="auth-label" htmlFor="familyState">State / region</label>
            <input
              id="familyState"
              className="auth-input"
              placeholder="CA"
              value={data.state}
              onChange={(e) => patch({ state: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="auth-section">
        <p className="auth-section-title">Account</p>
        <div className="auth-field">
          <label className="auth-label" htmlFor="familyContact">Primary contact name</label>
          <input
            id="familyContact"
            className="auth-input"
            placeholder="Maria Rivera"
            value={data.contactName}
            onChange={(e) => patch({ contactName: e.target.value })}
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="familyEmail">Email</label>
          <input
            id="familyEmail"
            type="email"
            className="auth-input"
            placeholder="family@email.com"
            value={data.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </div>
        <div className="auth-field-row auth-field">
          <div>
            <label className="auth-label" htmlFor="familyPassword">Password</label>
            <input
              id="familyPassword"
              type="password"
              className="auth-input"
              placeholder="At least 8 characters"
              value={data.password}
              onChange={(e) => patch({ password: e.target.value })}
            />
          </div>
          <div>
            <label className="auth-label" htmlFor="familyPhone">
              Phone <span className="auth-label-hint">(optional)</span>
            </label>
            <input
              id="familyPhone"
              type="tel"
              className="auth-input"
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => patch({ phone: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="auth-section">
        <p className="auth-section-title">What you need</p>
        <div className="auth-field">
          <label className="auth-label">Areas of help</label>
          <ChipPicker
            options={[...VOLUNTEER_CAUSES]}
            selected={data.causes}
            onChange={(causes) => patch({ causes })}
            renderIcon={causeChipIcon}
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="familyHelp">Describe your campaign</label>
          <textarea
            id="familyHelp"
            className="auth-textarea"
            placeholder="e.g. Yard cleanup after a storm, meal train for a new baby, moving help…"
            value={data.helpSummary}
            onChange={(e) => patch({ helpSummary: e.target.value })}
          />
        </div>
        <label className="auth-check-row">
          <input
            type="checkbox"
            checked={data.agreeTerms}
            onChange={(e) => patch({ agreeTerms: e.target.checked })}
          />
          <span>
            I agree to the Terms &amp; Privacy Policy and confirm this request is
            for legitimate community support.
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="btn-coral"
        style={{
          width: "100%",
          color: "#fff",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 15.5,
          padding: 14,
          borderRadius: 13,
          boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
          display: "block",
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Creating…" : "Create family account"}
      </button>
    </>
  );
}

function IndividualSignupForm({
  data,
  setData,
  onSubmit,
  submitting,
}: {
  data: IndividualSignupData;
  setData: React.Dispatch<React.SetStateAction<IndividualSignupData>>;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const patch = (partial: Partial<IndividualSignupData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  return (
    <>
      <div className="auth-section">
        <p className="auth-section-title">About you</p>
        <div className="auth-field">
          <label className="auth-label" htmlFor="indName">Full name</label>
          <input
            id="indName"
            className="auth-input"
            placeholder="Alex Chen"
            value={data.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
          />
        </div>
        <div className="auth-field-row auth-field">
          <div>
            <label className="auth-label" htmlFor="indCity">City</label>
            <input
              id="indCity"
              className="auth-input"
              placeholder="Berkeley"
              value={data.city}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </div>
          <div>
            <label className="auth-label" htmlFor="indState">State / region</label>
            <input
              id="indState"
              className="auth-input"
              placeholder="CA"
              value={data.state}
              onChange={(e) => patch({ state: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="auth-section">
        <p className="auth-section-title">Account</p>
        <div className="auth-field">
          <label className="auth-label" htmlFor="indEmail">Email</label>
          <input
            id="indEmail"
            type="email"
            className="auth-input"
            placeholder="you@email.com"
            value={data.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </div>
        <div className="auth-field-row auth-field">
          <div>
            <label className="auth-label" htmlFor="indPassword">Password</label>
            <input
              id="indPassword"
              type="password"
              className="auth-input"
              placeholder="At least 8 characters"
              value={data.password}
              onChange={(e) => patch({ password: e.target.value })}
            />
          </div>
          <div>
            <label className="auth-label" htmlFor="indPhone">
              Phone <span className="auth-label-hint">(optional)</span>
            </label>
            <input
              id="indPhone"
              type="tel"
              className="auth-input"
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => patch({ phone: e.target.value })}
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="indHelp">What do you need help with?</label>
          <textarea
            id="indHelp"
            className="auth-textarea"
            placeholder="Briefly explain your situation and the kind of support you're looking for…"
            value={data.helpSummary}
            onChange={(e) => patch({ helpSummary: e.target.value })}
          />
        </div>
        <label className="auth-check-row">
          <input
            type="checkbox"
            checked={data.agreeTerms}
            onChange={(e) => patch({ agreeTerms: e.target.checked })}
          />
          <span>
            I agree to the Terms &amp; Privacy Policy and understand my request
            may be reviewed before going live.
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="btn-coral"
        style={{
          width: "100%",
          color: "#fff",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 15.5,
          padding: 14,
          borderRadius: 13,
          boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
          display: "block",
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Creating…" : "Create account"}
      </button>
    </>
  );
}

function OrgSignupForm({
  data,
  setData,
  onSubmit,
  submitting,
}: {
  data: OrgSignupData;
  setData: React.Dispatch<React.SetStateAction<OrgSignupData>>;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const patch = (partial: Partial<OrgSignupData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  return (
    <>
      <div className="auth-section">
        <p className="auth-section-title">Organization</p>
        <div className="auth-field">
          <label className="auth-label" htmlFor="orgName">Organization name</label>
          <input
            id="orgName"
            className="auth-input"
            placeholder="Helping Hands SF"
            value={data.orgName}
            onChange={(e) => patch({ orgName: e.target.value })}
          />
        </div>
        <div className="auth-field-row auth-field">
          <div>
            <label className="auth-label" htmlFor="orgType">Organization type</label>
            <select
              id="orgType"
              className="auth-select"
              value={data.orgType}
              onChange={(e) => patch({ orgType: e.target.value })}
            >
              <option value="">Select one</option>
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="auth-label" htmlFor="teamSize">Team size</label>
            <select
              id="teamSize"
              className="auth-select"
              value={data.teamSize}
              onChange={(e) => patch({ teamSize: e.target.value })}
            >
              <option value="">Select one</option>
              {ORG_TEAM_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="auth-field-row auth-field">
          <div>
            <label className="auth-label" htmlFor="orgCity">City</label>
            <input
              id="orgCity"
              className="auth-input"
              placeholder="Oakland"
              value={data.city}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </div>
          <div>
            <label className="auth-label" htmlFor="orgState">State / region</label>
            <input
              id="orgState"
              className="auth-input"
              placeholder="CA"
              value={data.state}
              onChange={(e) => patch({ state: e.target.value })}
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="website">
            Website <span className="auth-label-hint">(optional)</span>
          </label>
          <input
            id="website"
            type="url"
            className="auth-input"
            placeholder="https://yourorg.org"
            value={data.website}
            onChange={(e) => patch({ website: e.target.value })}
          />
        </div>
      </div>

      <div className="auth-section">
        <p className="auth-section-title">Primary contact</p>
        <div className="auth-field-row auth-field">
          <div>
            <label className="auth-label" htmlFor="contactName">Your name</label>
            <input
              id="contactName"
              className="auth-input"
              placeholder="Jordan Lee"
              value={data.contactName}
              onChange={(e) => patch({ contactName: e.target.value })}
            />
          </div>
          <div>
            <label className="auth-label" htmlFor="contactRole">Your role</label>
            <input
              id="contactRole"
              className="auth-input"
              placeholder="Program director"
              value={data.contactRole}
              onChange={(e) => patch({ contactRole: e.target.value })}
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="orgEmail">Work email</label>
          <input
            id="orgEmail"
            type="email"
            className="auth-input"
            placeholder="hello@yourorg.org"
            value={data.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="orgPassword">Password</label>
          <input
            id="orgPassword"
            type="password"
            className="auth-input"
            placeholder="At least 8 characters"
            value={data.password}
            onChange={(e) => patch({ password: e.target.value })}
          />
        </div>
      </div>

      <div className="auth-section">
        <p className="auth-section-title">Mission focus</p>
        <div className="auth-field">
          <label className="auth-label">Causes you serve</label>
          <ChipPicker
            options={[...VOLUNTEER_CAUSES]}
            selected={data.causes}
            onChange={(causes) => patch({ causes })}
            renderIcon={causeChipIcon}
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="missionSummary">What does your org do?</label>
          <textarea
            id="missionSummary"
            className="auth-textarea"
            placeholder="Briefly describe your mission and the kind of volunteer help you need…"
            value={data.missionSummary}
            onChange={(e) => patch({ missionSummary: e.target.value })}
          />
        </div>
        <label className="auth-check-row">
          <input
            type="checkbox"
            checked={data.agreeTerms}
            onChange={(e) => patch({ agreeTerms: e.target.checked })}
          />
          <span>
            I confirm I represent this organization and agree to the Terms &amp;
            Organizer Guidelines.
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="btn-coral"
        style={{
          width: "100%",
          color: "#fff",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 15.5,
          padding: 14,
          borderRadius: 13,
          boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
          display: "block",
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Creating…" : "Create organization account"}
      </button>
    </>
  );
}

function LoginForm({
  mobile,
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  submitting,
}: {
  mobile?: boolean;
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <>
      <div className="auth-field">
        <label className="auth-label" htmlFor="loginEmail">Email</label>
        <input
          id="loginEmail"
          type="email"
          className="auth-input"
          placeholder="you@neighborhood.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="auth-field">
        <label className="auth-label" htmlFor="loginPassword">Password</label>
        <input
          id="loginPassword"
          type="password"
          className="auth-input"
          placeholder="Your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !submitting) onSubmit();
          }}
        />
      </div>
      <Link href="/forgot-password" className="auth-forgot">
        Forgot password?
      </Link>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className={`btn-coral${mobile ? " auth-mobile-primary" : ""}`}
        style={{
          color: "#fff",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 15.5,
          padding: 14,
          borderRadius: 13,
          boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)",
          display: "block",
          width: "100%",
          border: "none",
          marginTop: 8,
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </>
  );
}

function GoogleButton() {
  // Google OAuth is deferred to a later phase; shown but disabled.
  return (
    <button
      type="button"
      className="auth-google-btn"
      disabled
      title="Coming soon"
      style={{ opacity: 0.55, cursor: "not-allowed" }}
    >
      <span className="auth-google-icon" aria-hidden="true" />
      Continue with Google · Coming soon
    </button>
  );
}

function AuthDivider() {
  return (
    <div className="auth-mobile-divider">
      <span />
      or
      <span />
    </div>
  );
}

const emailConfirmIcon = (
  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }} aria-hidden="true">
    <span
      style={{
        width: 72,
        height: 72,
        borderRadius: 20,
        background: "linear-gradient(135deg,#ffd9c2,#ff9e7d)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 28px -14px rgba(255,111,94,.45)",
      }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5.5" width="18" height="13" rx="2" stroke="#fff" strokeWidth="1.8" />
        <path d="M3 7.5 12 13.5 21 7.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </div>
);

export function AuthFormPanel({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [role, setRole] = useState<Role>("volunteer");
  const [hostKind, setHostKind] = useState<HostKind>("organization");
  const [volunteerStep, setVolunteerStep] = useState(1);
  const [volunteerData, setVolunteerData] = useState(emptyVolunteerForm);
  const [orgData, setOrgData] = useState(emptyOrgForm);
  const [familyData, setFamilyData] = useState(emptyFamilyForm);
  const [individualData, setIndividualData] = useState(emptyIndividualForm);

  // Auth state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // bump on each new error so the toast re-animates even for repeat messages
  const [toastSeq, setToastSeq] = useState(0);

  const showError = (msg: string) => {
    setError(msg);
    setToastSeq((n) => n + 1);
  };

  const mobile = variant === "mobile";
  const isSignup = mode === "signup";
  const showStickyNav = mobile && isSignup && role === "volunteer";
  // Social sign-in shows on login and on the first signup step — but not on the
  // deeper volunteer signup steps (2 & 3).
  const onLaterVolunteerStep = isSignup && role === "volunteer" && volunteerStep > 1;
  const showSocial = !onLaterVolunteerStep;

  const handleRoleChange = (next: Role) => {
    setRole(next);
    setVolunteerStep(1);
    setError(null);
  };

  const handleModeChange = (next: "signup" | "login") => {
    setMode(next);
    setVolunteerStep(1);
    setError(null);
    setSuccess(null);
  };

  // Build the signup payload from whichever form is active.
  function buildSignUpInput(): { input?: SignUpInput; error?: string } {
    if (role === "volunteer") {
      const d = volunteerData;
      if (!d.agreeTerms) return { error: "Please accept the Terms & Privacy Policy to continue." };
      const fullName = [d.firstName, d.lastName].filter(Boolean).join(" ").trim();
      return {
        input: {
          email: d.email,
          password: d.password,
          selectedRole: "volunteer",
          displayName: d.firstName || undefined,
          fullName: fullName || undefined,
          bio: d.bio || undefined,
          city: d.city || undefined,
          region: d.state || undefined,
          interests: d.causes,
          skills: d.skills,
          availability: d.availability,
          educationLevel: d.education || undefined,
          volunteerExperience: d.experience || undefined,
          transport: d.transport || undefined,
          referralSource: d.hearAbout || undefined,
        },
      };
    }
    // host → organizer (org details captured later in /manage/onboarding)
    if (hostKind === "organization") {
      const d = orgData;
      if (!d.agreeTerms) return { error: "Please accept the Terms & Privacy Policy to continue." };
      return {
        input: {
          email: d.email,
          password: d.password,
          selectedRole: "organizer",
          displayName: d.contactName || d.orgName || undefined,
          fullName: d.contactName || undefined,
          bio: d.missionSummary || undefined,
          city: d.city || undefined,
          region: d.state || undefined,
          interests: d.causes,
        },
      };
    }
    if (hostKind === "family") {
      const d = familyData;
      if (!d.agreeTerms) return { error: "Please accept the Terms & Privacy Policy to continue." };
      return {
        input: {
          email: d.email,
          password: d.password,
          selectedRole: "organizer",
          displayName: d.groupName || d.contactName || undefined,
          fullName: d.contactName || undefined,
          bio: d.helpSummary || undefined,
          city: d.city || undefined,
          region: d.state || undefined,
          interests: d.causes,
        },
      };
    }
    const d = individualData;
    if (!d.agreeTerms) return { error: "Please accept the Terms & Privacy Policy to continue." };
    return {
      input: {
        email: d.email,
        password: d.password,
        selectedRole: "organizer",
        displayName: d.fullName || undefined,
        fullName: d.fullName || undefined,
        bio: d.helpSummary || undefined,
        city: d.city || undefined,
        region: d.state || undefined,
      },
    };
  }

  async function handleSignup() {
    setError(null);
    const { input, error: buildError } = buildSignUpInput();
    if (buildError || !input) {
      showError(buildError ?? "Please complete the form.");
      return;
    }
    setPending(true);
    const res = await signUpAction(input);
    setPending(false);
    if (res.error) showError(res.error);
    else setSuccess(res.success ?? "Check your email to verify your account.");
  }

  async function handleLogin() {
    setError(null);
    setPending(true);
    // Redirects on success; only returns here on error.
    const res = await signInAction({ email: loginEmail, password: loginPassword });
    setPending(false);
    if (res?.error) showError(res.error);
  }

  const hostSubtitle =
    hostKind === "organization"
      ? "Set up your organization to post missions and manage volunteers."
      : hostKind === "family"
        ? "Create a family campaign and invite neighbors to help."
        : "Post a personal request and connect with local volunteers.";

  // Post-signup success screen ("check your email").
  if (success) {
    return (
      <div className={`auth-form-side${mobile ? " auth-form-side--mobile" : ""}`}>
        <div
          style={{
            textAlign: "center",
            padding: mobile ? "20px 4px" : "30px 8px",
            maxWidth: 380,
            margin: "0 auto",
          }}
        >
          {emailConfirmIcon}
          <h2 style={{ fontSize: 23, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-.02em" }}>
            Check your email
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted-2)", lineHeight: 1.6, margin: "0 0 22px" }}>
            {success} You’ll need to verify your email before you can log in.
          </p>
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className="btn-coral"
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "13px 22px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 14px 28px -14px rgba(255,111,94,.8)",
            }}
          >
            Back to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`auth-form-side${mobile ? " auth-form-side--mobile" : ""}${showStickyNav ? " auth-form-side--sticky-body" : ""}`}
    >
      {mobile ? (
        <div className="auth-mobile-mode-toggle" role="tablist" aria-label="Sign up or log in">
          <button
            type="button"
            role="tab"
            aria-selected={isSignup}
            className={`auth-mobile-mode-btn${isSignup ? " auth-mobile-mode-btn--on" : ""}`}
            onClick={() => handleModeChange("signup")}
          >
            Sign up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            className={`auth-mobile-mode-btn${!isSignup ? " auth-mobile-mode-btn--on" : ""}`}
            onClick={() => handleModeChange("login")}
          >
            Log in
          </button>
        </div>
      ) : (
        <div style={{ display: "inline-flex", background: "var(--bg-chip)", borderRadius: 13, padding: 5, marginBottom: 22, alignSelf: "flex-start" }}>
          <span onClick={() => handleModeChange("signup")} style={isSignup ? tabOn : tabOff}>Sign up</span>
          <span onClick={() => handleModeChange("login")} style={isSignup ? tabOff : tabOn}>Log in</span>
        </div>
      )}

      {mobile ? (
        <h2 className="auth-mobile-title">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
      ) : (
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-.02em" }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
      )}

      {mobile ? (
        <p className="auth-mobile-lead">
          {isSignup
            ? role === "volunteer"
              ? "Tell us a bit about yourself so we can match you with the right missions."
              : hostSubtitle
            : "Log in to pick up where you left off."}
        </p>
      ) : (
        <p style={{ fontSize: 14.5, color: "var(--muted-3)", margin: "0 0 20px" }}>
          {isSignup
            ? role === "volunteer"
              ? "Tell us a bit about yourself so we can match you with the right missions."
              : hostSubtitle
            : "Log in to pick up where you left off."}
        </p>
      )}

      {isSignup && (
        <div style={{ marginBottom: mobile ? 16 : 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted-1)", marginBottom: 9 }}>
            I&apos;m joining as a…
          </div>
          {mobile ? (
            <div className="auth-role-grid">
              <button
                type="button"
                className={`auth-role-card${role === "volunteer" ? " auth-role-card--on" : ""}`}
                onClick={() => handleRoleChange("volunteer")}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <g stroke="#f1543f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8.5" r="3.6" />
                    <path d="M5 19.5c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
                  </g>
                </svg>
                <div className="auth-role-title">Volunteer</div>
                <div className="auth-role-sub">Find &amp; join missions</div>
              </button>
              <button
                type="button"
                className={`auth-role-card${role === "host" ? " auth-role-card--on" : ""}`}
                onClick={() => handleRoleChange("host")}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <g stroke="#f1543f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.2 9.3 12 4l8.8 5.3" />
                    <path d="M6 11.2v6.3M10 11.2v6.3M14 11.2v6.3M18 11.2v6.3" />
                    <path d="M3.6 20h16.8" />
                  </g>
                </svg>
                <div className="auth-role-title">Organizer</div>
                <div className="auth-role-sub">Post missions &amp; request help</div>
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              <div onClick={() => handleRoleChange("volunteer")} style={role === "volunteer" ? roleSel : roleBase}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <g stroke="#f1543f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8.5" r="3.6" />
                      <path d="M5 19.5c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
                    </g>
                  </svg>
                </div>
                <div className="auth-role-title">Volunteer</div>
                <div style={{ fontSize: 12, color: "var(--muted-3)" }}>Find &amp; join missions</div>
              </div>
              <div onClick={() => handleRoleChange("host")} style={role === "host" ? roleSel : roleBase}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <g stroke="#f1543f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.2 9.3 12 4l8.8 5.3" />
                      <path d="M6 11.2v6.3M10 11.2v6.3M14 11.2v6.3M18 11.2v6.3" />
                      <path d="M3.6 20h16.8" />
                    </g>
                  </svg>
                </div>
                <div className="auth-role-title">Organization / Family or Individual</div>
                <div style={{ fontSize: 12, color: "var(--muted-3)" }}>Post campaigns &amp; request help</div>
              </div>
            </div>
          )}

          {role === "host" ? (
            <HostKindPicker value={hostKind} onChange={setHostKind} />
          ) : null}
        </div>
      )}

      {error ? (
        <AuthToast key={toastSeq} message={error} tone="error" onClose={() => setError(null)} />
      ) : null}

      {isSignup && role === "volunteer" ? (
        <VolunteerSignupForm
          data={volunteerData}
          setData={setVolunteerData}
          step={volunteerStep}
          setStep={setVolunteerStep}
          onSubmit={handleSignup}
          submitting={pending}
        />
      ) : null}

      {isSignup && role === "host" && hostKind === "organization" ? (
        <OrgSignupForm data={orgData} setData={setOrgData} onSubmit={handleSignup} submitting={pending} />
      ) : null}

      {isSignup && role === "host" && hostKind === "family" ? (
        <FamilySignupForm data={familyData} setData={setFamilyData} onSubmit={handleSignup} submitting={pending} />
      ) : null}

      {isSignup && role === "host" && hostKind === "individual" ? (
        <IndividualSignupForm
          data={individualData}
          setData={setIndividualData}
          onSubmit={handleSignup}
          submitting={pending}
        />
      ) : null}

      {!isSignup ? (
        <LoginForm
          mobile={mobile}
          email={loginEmail}
          password={loginPassword}
          setEmail={setLoginEmail}
          setPassword={setLoginPassword}
          onSubmit={handleLogin}
          submitting={pending}
        />
      ) : null}

      {showSocial && (
        <>
          {mobile ? (
            <>
              <AuthDivider />
              <GoogleButton />
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px", color: "var(--muted-4)", fontSize: 13 }}>
                <span style={{ flex: 1, height: 1, background: "rgba(24,32,59,.1)" }} />
                or
                <span style={{ flex: 1, height: 1, background: "rgba(24,32,59,.1)" }} />
              </div>
              <div className="btn-ghost" title="Coming soon" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "1px solid var(--line-3)", borderRadius: 13, padding: 13, fontWeight: 600, fontSize: 14.5, cursor: "not-allowed", opacity: 0.55 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "conic-gradient(#ea4335,#fbbc05,#34a853,#4285f4)" }} />
                Continue with Google · Coming soon
              </div>
            </>
          )}
        </>
      )}

      {mobile ? (
        <p className="auth-mobile-footer-note">
          By continuing you agree to our Terms &amp; Privacy Policy.
        </p>
      ) : (
        <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--muted-3)", margin: "18px 0 0" }}>
          By continuing you agree to our Terms &amp; Privacy Policy.
        </p>
      )}
    </div>
  );
}
