import Icon from "@/components/icons";
import { FormPillGroup } from "@/components/manage/form-choice";

export type MissionPrivateDetailsState = {
  exact_address: string;
  private_meeting_instructions: string;
  private_contact_name: string;
  private_contact_phone: string;
  private_contact_email: string;
  show_exact_address_publicly: boolean;
};

export function emptyPrivateDetails(): MissionPrivateDetailsState {
  return {
    exact_address: "",
    private_meeting_instructions: "",
    private_contact_name: "",
    private_contact_phone: "",
    private_contact_email: "",
    show_exact_address_publicly: false,
  };
}

export function MissionPrivateDetailsSection({
  values,
  onChange,
}: {
  values: MissionPrivateDetailsState;
  onChange: <K extends keyof MissionPrivateDetailsState>(k: K, v: MissionPrivateDetailsState[K]) => void;
}) {
  const visibility = values.show_exact_address_publicly ? "public" : "private";

  return (
    <>
      <div className="mf-private-head">
        <div>
          <div className="mf-private-title-row">
            <h3 className="mf-section-title">Private details</h3>
            <Icon name="lock" size={17} aria-hidden />
          </div>
          <p className="mf-section-hint" style={{ marginBottom: 0 }}>
            Only approved volunteers and your organization team can see contact info. The exact address can be public or private.
          </p>
        </div>
        <span className="mf-private-pill">Private</span>
      </div>

      <p className="mf-private-bridge">
        Public mission info helps volunteers decide whether to apply. Choose whether the exact address is visible to everyone on your mission page, or only shared after approval.
      </p>

      <div className="mf-field">
        <label className="mf-label" htmlFor="exact_address">Exact address</label>
        <input
          id="exact_address"
          className="mf-input"
          value={values.exact_address}
          onChange={(e) => onChange("exact_address", e.target.value)}
          placeholder="1234 Garden St, San Francisco, CA"
        />
      </div>

      <div className="mf-field">
        <span id="mf-address-visibility-label" className="mf-label">Address visibility</span>
        <FormPillGroup
          name="address_visibility"
          value={visibility}
          onChange={(v) => onChange("show_exact_address_publicly", v === "public")}
          options={[
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
          ]}
          labelledBy="mf-address-visibility-label"
        />
        <p className="mf-note" style={{ marginTop: 10, marginBottom: 0 }}>
          {values.show_exact_address_publicly
            ? "Anyone can see this exact address on Explore and the mission page — including visitors who are not logged in."
            : "Only a general public location label is shown until volunteers are approved."}
        </p>
      </div>

      <div className="mf-field">
        <label className="mf-label" htmlFor="private_meeting_instructions">Meeting instructions</label>
        <textarea
          id="private_meeting_instructions"
          className="mf-textarea mf-textarea--sm"
          value={values.private_meeting_instructions}
          onChange={(e) => onChange("private_meeting_instructions", e.target.value)}
          placeholder="Meet at the north gate; look for the green tent."
        />
      </div>

      <div className="mf-private-grid">
        <div className="mf-field">
          <label className="mf-label" htmlFor="private_contact_name">Contact name</label>
          <input
            id="private_contact_name"
            className="mf-input"
            value={values.private_contact_name}
            onChange={(e) => onChange("private_contact_name", e.target.value)}
            placeholder="Sam Rivera"
          />
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="private_contact_phone">Contact phone</label>
          <input
            id="private_contact_phone"
            className="mf-input"
            value={values.private_contact_phone}
            onChange={(e) => onChange("private_contact_phone", e.target.value)}
            placeholder="+1 555 012 3456"
          />
        </div>
        <div className="mf-field">
          <label className="mf-label" htmlFor="private_contact_email">Contact email</label>
          <input
            id="private_contact_email"
            type="email"
            className="mf-input"
            value={values.private_contact_email}
            onChange={(e) => onChange("private_contact_email", e.target.value)}
            placeholder="day-of@org.com"
          />
        </div>
      </div>
    </>
  );
}
