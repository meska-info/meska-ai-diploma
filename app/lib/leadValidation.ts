import type { DiplomaId } from "../content";

export const experienceOptions = [
  "0–2 years",
  "3–6 years",
  "7–10 years",
  "10+ years",
] as const;

export const paymentKinds = ["full", "installments"] as const;
export const startTimings = ["current_wave", "later_wave"] as const;

export type Experience = (typeof experienceOptions)[number];
export type PaymentKind = (typeof paymentKinds)[number];
export type StartTiming = (typeof startTimings)[number];

export type LeadInput = {
  fullName: string;
  email: string;
  mobile: string;
  linkedinUrl: string;
  yearsExperience: string;
  paymentPreference: string;
  startTiming: string;
  diplomaSlug: string;
};

export type NormalizedLead = {
  name: string;
  email: string;
  mobile: string;
  linkedinUrl: string;
  yearsExperience: Experience;
  paymentPreference: PaymentKind;
  startTiming: StartTiming;
  diplomaSlug: DiplomaId;
};

const disposableDomains = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
]);

function repeatedOrSequentialDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return /(\d)\1{6,}/.test(digits) ||
    ["0123456789", "1234567890", "9876543210"].some((sequence) =>
      digits.length >= 8 && sequence.includes(digits),
    );
}

function looksRandom(value: string) {
  const compact = value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  if (/^(.)\1{4,}$/u.test(compact)) return true;
  if (compact.length < 10) return false;
  if (!/^[a-z]+$/i.test(compact)) return false;
  const vowelCount = (compact.match(/[aeiou]/gi) ?? []).length;
  return vowelCount === 0;
}

export function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (/^01[0125]\d{8}$/.test(compact)) return `+20${compact.slice(1)}`;
  if (/^0020/.test(compact)) return `+${compact.slice(2)}`;
  return compact;
}

export function normalizeLinkedIn(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    url.protocol = "https:";
    url.hash = "";
    url.search = "";
    if (url.hostname === "linkedin.com" || url.hostname === "www.linkedin.com") {
      url.hostname = "www.linkedin.com";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

export function validateLead(input: LeadInput) {
  const errors: Record<string, string> = {};
  const name = input.fullName.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  const mobile = normalizePhone(input.mobile);
  const linkedinUrl = normalizeLinkedIn(input.linkedinUrl);

  if (!name) errors.fullName = "Full name is required.";
  else if (
    name.length < 2 ||
    name.length > 120 ||
    !/\p{L}/u.test(name) ||
    /^\d+$/u.test(name) ||
    /[^\p{L}\p{M}\s.'’-]/u.test(name) ||
    looksRandom(name)
  ) errors.fullName = "Enter a valid name using letters, spaces, apostrophes, or hyphens.";

  const emailMatch = email.match(/^([^\s@]+)@([a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)+)$/i);
  if (!email) errors.email = "Email address is required.";
  else if (!emailMatch || email.length > 254) errors.email = "Enter a valid email address.";
  else {
    const [local, domain] = [emailMatch[1], emailMatch[2]];
    if (
      /^(test|testing|fake|example|asdf|qwerty|12345|admin|no-?reply)$/i.test(local) ||
      /^(\d)\1{4,}$/.test(local) ||
      looksRandom(local) ||
      disposableDomains.has(domain)
    ) errors.email = "Enter a genuine work or personal email address.";
  }

  const digits = mobile.replace(/\D/g, "");
  const egyptianValid = /^\+201[0125]\d{8}$/.test(mobile);
  const internationalValid = /^\+[1-9]\d{7,14}$/.test(mobile);
  if (!input.mobile.trim()) errors.mobile = "Mobile number is required.";
  else if ((!egyptianValid && !internationalValid) || repeatedOrSequentialDigits(mobile)) {
    errors.mobile = "Enter a valid mobile number with its country code.";
  } else if (digits.length < 8 || digits.length > 15) {
    errors.mobile = "Enter a valid mobile number with its country code.";
  }

  let linkedinValid = false;
  try {
    const url = new URL(linkedinUrl);
    linkedinValid =
      url.protocol === "https:" &&
      url.hostname === "www.linkedin.com" &&
      /^\/in\/[a-z\d%_-]{2,}\/?$/i.test(url.pathname);
  } catch {
    linkedinValid = false;
  }
  if (!input.linkedinUrl.trim()) errors.linkedinUrl = "LinkedIn profile is required.";
  else if (!linkedinValid) errors.linkedinUrl = "Enter your LinkedIn profile URL, e.g. linkedin.com/in/your-profile.";

  if (!experienceOptions.includes(input.yearsExperience as Experience)) {
    errors.yearsExperience = "Select your years of experience.";
  }
  if (!paymentKinds.includes(input.paymentPreference as PaymentKind)) {
    errors.paymentPreference = "Select your payment preference.";
  }
  if (!startTimings.includes(input.startTiming as StartTiming)) {
    errors.startTiming = "Select when you could join.";
  }
  if (input.diplomaSlug !== "offline" && input.diplomaSlug !== "online") {
    errors.diploma = "Select a diploma format.";
  }

  return {
    errors,
    normalized: {
      name,
      email,
      mobile,
      linkedinUrl,
      yearsExperience: input.yearsExperience as Experience,
      paymentPreference: input.paymentPreference as PaymentKind,
      startTiming: input.startTiming as StartTiming,
      diplomaSlug: input.diplomaSlug as DiplomaId,
    } satisfies NormalizedLead,
    valid: Object.keys(errors).length === 0,
  };
}
