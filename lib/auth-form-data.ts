import type { CauseKey } from "./data";

export const VOLUNTEER_CAUSES = [
  "Food",
  "Cleanup",
  "Tutoring",
  "Animals",
  "Elderly",
  "Garden",
] as const satisfies readonly Exclude<CauseKey, "All">[];

export const EDUCATION_LEVELS = [
  "High school student",
  "High school graduate",
  "Some college",
  "Bachelor's degree",
  "Graduate degree",
  "Other / prefer not to say",
] as const;

export const VOLUNTEER_SKILLS = [
  "First aid",
  "Tutoring",
  "Driving",
  "Heavy lifting",
  "Bilingual",
  "Tech / social media",
  "Event setup",
  "Leadership",
  "Working with kids",
  "Working with seniors",
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "first-time", label: "First-time volunteer" },
  { value: "some", label: "Some experience" },
  { value: "regular", label: "Regular volunteer" },
] as const;

export const AVAILABILITY_OPTIONS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekends",
  "School breaks only",
  "Flexible / open schedule",
] as const;

export const TRANSPORT_OPTIONS = [
  "I have a car",
  "Public transit",
  "Bike / walk nearby",
  "Need rideshare budget",
] as const;

export const HEAR_ABOUT_OPTIONS = [
  "Friend or family",
  "School or university",
  "Social media",
  "Search engine",
  "Local organization",
  "Other",
] as const;

export const ORG_TYPES = [
  "Registered nonprofit",
  "School or university",
  "Community group",
  "Religious organization",
  "Municipal / government",
  "Other",
] as const;

export const ORG_TEAM_SIZES = [
  "Just me",
  "2–5 people",
  "6–20 people",
  "20+ people",
] as const;

export type HostKind = "organization" | "family" | "individual";

export const HOST_KIND_OPTIONS: {
  value: HostKind;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: "organization",
    label: "Organization",
    description: "Nonprofits, schools & community groups",
    emoji: "🏛️",
  },
  {
    value: "family",
    label: "Family",
    description: "Rally help for your household",
    emoji: "👨‍👩‍👧",
  },
  {
    value: "individual",
    label: "Individual",
    description: "Ask neighbors for personal support",
    emoji: "🙋",
  },
];

export type FamilySignupData = {
  groupName: string;
  city: string;
  state: string;
  contactName: string;
  email: string;
  password: string;
  phone: string;
  causes: string[];
  helpSummary: string;
  agreeTerms: boolean;
};

export type IndividualSignupData = {
  fullName: string;
  city: string;
  state: string;
  email: string;
  password: string;
  phone: string;
  helpSummary: string;
  agreeTerms: boolean;
};

export type VolunteerSignupData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: string;
  city: string;
  state: string;
  phone: string;
  education: string;
  schoolOrWork: string;
  skills: string[];
  causes: string[];
  experience: string;
  availability: string[];
  transport: string;
  hearAbout: string;
  bio: string;
  agreeTerms: boolean;
};

export type OrgSignupData = {
  orgName: string;
  orgType: string;
  website: string;
  city: string;
  state: string;
  contactName: string;
  contactRole: string;
  email: string;
  password: string;
  teamSize: string;
  causes: string[];
  missionSummary: string;
  agreeTerms: boolean;
};

export const emptyVolunteerForm = (): VolunteerSignupData => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  age: "",
  city: "",
  state: "",
  phone: "",
  education: "",
  schoolOrWork: "",
  skills: [],
  causes: [],
  experience: "first-time",
  availability: [],
  transport: "",
  hearAbout: "",
  bio: "",
  agreeTerms: false,
});

export const emptyOrgForm = (): OrgSignupData => ({
  orgName: "",
  orgType: "",
  website: "",
  city: "",
  state: "",
  contactName: "",
  contactRole: "",
  email: "",
  password: "",
  teamSize: "",
  causes: [],
  missionSummary: "",
  agreeTerms: false,
});

export const emptyFamilyForm = (): FamilySignupData => ({
  groupName: "",
  city: "",
  state: "",
  contactName: "",
  email: "",
  password: "",
  phone: "",
  causes: [],
  helpSummary: "",
  agreeTerms: false,
});

export const emptyIndividualForm = (): IndividualSignupData => ({
  fullName: "",
  city: "",
  state: "",
  email: "",
  password: "",
  phone: "",
  helpSummary: "",
  agreeTerms: false,
});
