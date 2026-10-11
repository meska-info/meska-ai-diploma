import type { DiplomaId } from "../content";

export const experienceOptions = [
  "0–2 years",
  "3–6 years",
  "7–10 years",
  "10+ years",
] as const;

export const paymentKinds = ["full", "installments"] as const;
export const startTimings = ["current_wave", "later_wave"] as const;
export const enrollmentTypes = ["individual", "team"] as const;
export const copilotReadinessOptions = ["upcoming", "later", "discuss_upcoming"] as const;
export const individualLicenceOptions = ["yes", "no", "unsure"] as const;
export const teamLicenceOptions = ["all", "some", "none", "unsure"] as const;

export type EnrollmentType = (typeof enrollmentTypes)[number];

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

export const disposableDomains = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
  "sharklasers.com",
  "throwawaymail.com",
  "trashmail.com",
]);

const consumerEmailDomains = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
]);

export const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "zoho.com",
  "zohomail.com",
  "hey.com",
  "fastmail.com",
  "tutanota.com",
  "inbox.com",
  "mail.ru",
  "qq.com",
  "163.com",
  "126.com",
]);

export const PERSONAL_EMAIL_PATTERNS = [
  /^(gmail|googlemail|hotmail|outlook|live|yahoo|ymail|aol|gmx|yandex|icloud)\.[a-z.]{2,6}$/,
] as const;

export const WORK_EMAIL_ERROR =
  "Please use your work email (e.g. name@yourcompany.com). Personal addresses like Gmail, Outlook or Yahoo aren't accepted.";

const keyboardRuns = [
  "qwerty",
  "asdfgh",
  "zxcvbn",
  "qazwsx",
  "poiuyt",
  "lkjhg",
  "mnbvc",
];

const placeholderWords = new Set([
  "demo",
  "dummy",
  "example",
  "fake",
  "placeholder",
  "sample",
  "synthetic",
  "test",
  "testing",
]);

function repeatedOrSequentialDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return /(\d)\1{6,}/.test(digits) ||
    ["0123456789", "1234567890", "9876543210"].some((sequence) =>
      digits.length >= 8 && sequence.includes(digits),
    );
}

function isRepeatedPattern(value: string) {
  for (let unitLength = 1; unitLength <= 3; unitLength += 1) {
    if (value.length >= unitLength * 3) {
      const unit = value.slice(0, unitLength);
      if (unit.repeat(Math.ceil(value.length / unitLength)).slice(0, value.length) === value) {
        return true;
      }
    }
  }
  return false;
}

function asciiGarbageSignals(value: string) {
  const compact = value.toLowerCase().replace(/[^a-z]/g, "");
  if (!compact || compact.length < 4) return 0;

  let score = 0;
  if (/^(.)\1{3,}$/.test(compact) || isRepeatedPattern(compact)) score += 4;
  if (keyboardRuns.some((run) => compact.includes(run) || run.startsWith(compact))) {
    score += 4;
  }
  if (/^(?:abc|xyz)(?:abc|xyz|\d)*$/i.test(value.replace(/[^a-z\d]/gi, ""))) score += 4;

  const vowels = (compact.match(/[aeiouy]/g) ?? []).length;
  const maxConsonantRun = Math.max(
    ...(compact.match(/[^aeiouy]+/g) ?? [""]).map((part) => part.length),
  );
  if (vowels === 0) score += compact.length >= 7 ? 4 : 2;
  else if (compact.length >= 9 && vowels / compact.length < 0.16) score += 2;
  if (maxConsonantRun >= 6) score += 2;
  if (compact.length >= 6 && new Set(compact).size <= 2) score += 3;
  return score;
}

function looksLikeGarbageName(value: string) {
  const tokens = value.toLowerCase().split(/[\s.'’-]+/u).filter(Boolean);
  if (tokens.some((token) => placeholderWords.has(token))) return true;
  return tokens.some((token) => /^[a-z]+$/i.test(token) && asciiGarbageSignals(token) >= 4);
}

function looksLikeGarbageEmailLocal(local: string, domain: string) {
  const atoms = local.split(/[._+-]+/).filter(Boolean);
  const placeholderStem = local.toLowerCase().replace(/[._+-]?\d+$/, "");
  if (placeholderWords.has(placeholderStem) || /^(?:no-?reply)$/i.test(placeholderStem)) return true;
  if (/^(?:asdf|qwerty|zxcv|abcabc|12345)(?:\d+)?$/i.test(local)) return true;
  if (/^(.)\1{4,}$/u.test(local)) return true;

  const signal = Math.max(0, ...atoms.map(asciiGarbageSignals));
  if (signal >= 4) return true;
  // A four-to-six-letter, vowel-free identifier on a mass-market mailbox is
  // a strong fake-input signal. Keep this narrow so business acronyms and
  // legitimate two/three-letter personal addresses remain valid.
  return consumerEmailDomains.has(domain) &&
    atoms.length === 1 &&
    /^[a-z]{4,6}$/i.test(local) &&
    !/[aeiouy]/i.test(local);
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
  const nameLetterCount = (name.match(/\p{L}/gu) ?? []).length;

  if (!name) errors.fullName = "Full name is required.";
  else if (
    nameLetterCount < 3 ||
    name.length > 120 ||
    !/\p{L}/u.test(name) ||
    /^\d+$/u.test(name) ||
    /[^\p{L}\p{M}\s.'’-]/u.test(name) ||
    looksLikeGarbageName(name)
  ) errors.fullName = "Please enter your real full name.";

  const emailMatch = email.match(/^([^\s@]+)@([a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)+)$/i);
  if (!email) errors.email = "Email address is required.";
  else if (!emailMatch || email.length > 254) {
    errors.email = "Please enter a valid email address you actively use.";
  }
  else {
    const [local, domain] = [emailMatch[1], emailMatch[2]];
    const domainLabels = domain.split(".");
    const tld = domainLabels.at(-1) ?? "";
    if (
      local.length > 64 ||
      !/^[a-z\d!#$%&'*+/=?^_`{|}~.-]+$/i.test(local) ||
      local.startsWith(".") ||
      local.endsWith(".") ||
      local.includes("..") ||
      domainLabels.some((label) => label.length > 63) ||
      !/^(?:[a-z]{2,63}|xn--[a-z\d-]{2,59})$/i.test(tld) ||
      /^(\d)\1{4,}$/.test(local) ||
      looksLikeGarbageEmailLocal(local, domain) ||
      disposableDomains.has(domain)
    ) errors.email = "Please enter a valid email address you actively use.";
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

export type CopilotLeadInput = {
  fullName?: unknown;
  email?: unknown;
  mobile?: unknown;
  linkedinUrl?: unknown;
  companyName?: unknown;
  jobTitle?: unknown;
  yearsExperience?: unknown;
  paymentPreference?: unknown;
  copilotLicence?: unknown;
  joiningReadiness?: unknown;
  seats?: unknown;
  enrollmentType?: unknown;
  submitterIsParticipant?: unknown;
  diplomaSlug?: unknown;
};

export type NormalizedCopilotLead = {
  fullName: string;
  name: string;
  email: string;
  mobile: string;
  linkedinUrl: string;
  companyName: string;
  jobTitle: string;
  yearsExperience: Experience | null;
  paymentPreference: "full" | "installments" | "enterprise" | "";
  copilotLicence: "yes" | "no" | "unsure" | "all" | "some" | "none" | "";
  joiningReadiness: "upcoming" | "later" | "discuss_upcoming" | "";
  seats: number;
  enrollmentType: EnrollmentType;
  submitterIsParticipant: boolean;
  diplomaSlug: "online";
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normalizeHumanText(value: unknown) {
  return stringValue(value).trim().replace(/\s+/g, " ");
}

export function validateFullName(value: unknown) {
  const name = normalizeHumanText(value);
  const nameLetterCount = (name.match(/\p{L}/gu) ?? []).length;
  if (!name) return "Full name is required.";
  if (
    nameLetterCount < 3 ||
    name.length > 120 ||
    !/\p{L}/u.test(name) ||
    /^\d+$/u.test(name) ||
    /[^\p{L}\p{M}\s.'’-]/u.test(name) ||
    looksLikeGarbageName(name)
  ) {
    return "Please enter your real full name.";
  }
  return "";
}

export function validateEmailAddress(
  value: unknown,
  options: { requireWorkDomain?: boolean } = {},
) {
  const email = stringValue(value).trim().toLowerCase();
  if (!email) return "Email address is required.";
  const emailMatch = email.match(
    /^([^\s@]+)@([a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)+)$/i,
  );
  if (!emailMatch || email.length > 254) {
    return "Please enter a valid email address you actively use.";
  }
  const [local, domain] = [emailMatch[1], emailMatch[2]];
  const domainLabels = domain.split(".");
  const tld = domainLabels.at(-1) ?? "";
  if (
    local.length > 64 ||
    !/^[a-z\d!#$%&'*+/=?^_`{|}~.-]+$/i.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..") ||
    domainLabels.some((label) => label.length > 63) ||
    !/^(?:[a-z]{2,63}|xn--[a-z\d-]{2,59})$/i.test(tld) ||
    /^(\d)\1{4,}$/.test(local) ||
    looksLikeGarbageEmailLocal(local, domain) ||
    disposableDomains.has(domain)
  ) {
    return "Please enter a valid email address you actively use.";
  }
  if (
    options.requireWorkDomain &&
    (PERSONAL_EMAIL_DOMAINS.has(domain) ||
      PERSONAL_EMAIL_PATTERNS.some((pattern) => pattern.test(domain)))
  ) {
    return WORK_EMAIL_ERROR;
  }
  return "";
}

export function validateMobile(value: unknown) {
  const raw = stringValue(value);
  const mobile = normalizePhone(raw);
  const digits = mobile.replace(/\D/g, "");
  const egyptianValid = /^\+201[0125]\d{8}$/.test(mobile);
  const internationalValid = /^\+[1-9]\d{7,14}$/.test(mobile);
  if (!raw.trim()) return "Mobile number is required.";
  if (
    (!egyptianValid && !internationalValid) ||
    repeatedOrSequentialDigits(mobile) ||
    digits.length < 8 ||
    digits.length > 15
  ) {
    return "Enter a valid mobile number, including country code if outside Egypt.";
  }
  return "";
}

export function validateLinkedIn(value: unknown) {
  const raw = stringValue(value);
  if (!raw.trim()) return "LinkedIn profile is required.";
  try {
    const url = new URL(normalizeLinkedIn(raw));
    if (
      url.protocol === "https:" &&
      url.hostname === "www.linkedin.com" &&
      /^\/in\/[a-z\d%_-]{2,}\/?$/i.test(url.pathname)
    ) {
      return "";
    }
  } catch {
    // Fall through to the structural error.
  }
  return "Enter your LinkedIn profile URL, e.g. linkedin.com/in/your-name.";
}

function validateOrganization(value: unknown, kind: "company" | "job") {
  const normalized = normalizeHumanText(value);
  const required = kind === "company" ? "Company name is required." : "Job title is required.";
  const invalid = kind === "company"
    ? "Please enter your real company name."
    : "Please enter your real job title.";
  const maxLength = kind === "company" ? 120 : 80;
  if (!normalized) return required;
  const tokens = normalized
    .toLowerCase()
    .split(/[\s&.,'’()\/+\-]+/u)
    .filter(Boolean);
  if (
    normalized.length < 2 ||
    normalized.length > maxLength ||
    !/\p{L}/u.test(normalized) ||
    /^\d+$/u.test(normalized) ||
    /[^\p{L}\p{M}\d\s&.,'’()\/+\-]/u.test(normalized) ||
    tokens.some((token) => placeholderWords.has(token)) ||
    tokens.some((token) => /^[a-z]+$/i.test(token) && asciiGarbageSignals(token) >= 4)
  ) {
    return invalid;
  }
  return "";
}

export function validateCompanyName(value: unknown) {
  return validateOrganization(value, "company");
}

export function validateJobTitle(value: unknown) {
  return validateOrganization(value, "job");
}

export function validateCopilotLead(
  input: CopilotLeadInput,
  options: { mode?: EnrollmentType; legacy?: boolean } = {},
) {
  const mode = options.mode ??
    (input.enrollmentType === "team" ? "team" : "individual");
  const legacy = options.legacy ?? false;
  const errors: Record<string, string> = {};
  const fullName = normalizeHumanText(input.fullName);
  const email = stringValue(input.email).trim().toLowerCase();
  const mobile = normalizePhone(stringValue(input.mobile));
  const linkedinUrl = normalizeLinkedIn(stringValue(input.linkedinUrl));
  const companyName = normalizeHumanText(input.companyName);
  const jobTitle = normalizeHumanText(input.jobTitle);
  const yearsExperience = stringValue(input.yearsExperience);
  const paymentPreference = stringValue(input.paymentPreference);
  const copilotLicence = stringValue(input.copilotLicence);
  const joiningReadiness = stringValue(input.joiningReadiness);
  const rawSeats = Number(input.seats);
  const seats = mode === "team" && Number.isInteger(rawSeats) ? rawSeats : 1;

  const nameError = validateFullName(fullName);
  if (nameError) errors.fullName = nameError;
  const emailError = validateEmailAddress(email, { requireWorkDomain: true });
  if (emailError) errors.email = emailError;
  const mobileError = validateMobile(mobile);
  if (mobileError) errors.mobile = mobileError;
  const linkedinError = validateLinkedIn(linkedinUrl);
  if (linkedinError) errors.linkedinUrl = linkedinError;

  if (!legacy) {
    const companyError = validateCompanyName(companyName);
    if (companyError) errors.companyName = companyError;
    const jobError = validateJobTitle(jobTitle);
    if (jobError) errors.jobTitle = jobError;
  }

  if (
    mode === "individual" &&
    !experienceOptions.includes(yearsExperience as Experience)
  ) {
    errors.yearsExperience = "Select your years of experience.";
  }
  const allowedPayments = mode === "team"
    ? ["full", "installments", "enterprise"]
    : ["full", "installments"];
  if (!allowedPayments.includes(paymentPreference)) {
    errors.paymentPreference = "Select your preferred payment option.";
  }
  if (!copilotReadinessOptions.includes(joiningReadiness as never)) {
    errors.joiningReadiness = "Select when you would like to join.";
  }
  if (!legacy) {
    const allowedLicences = mode === "team"
      ? teamLicenceOptions
      : individualLicenceOptions;
    if (!allowedLicences.includes(copilotLicence as never)) {
      errors.copilotLicence = mode === "team"
        ? "Tell us about your company's Copilot licences."
        : "Tell us whether you have a Copilot licence.";
    }
  }
  if (mode === "team" && (!Number.isInteger(rawSeats) || rawSeats < 2 || rawSeats > 20)) {
    errors.seats = "Teams are 2 to 20 seats. For more, talk to an advisor.";
  }
  if (input.diplomaSlug !== undefined && input.diplomaSlug !== "online") {
    errors.diploma = "Select a course format.";
  }

  return {
    errors,
    normalized: {
      fullName,
      name: fullName,
      email,
      mobile,
      linkedinUrl,
      companyName,
      jobTitle,
      yearsExperience: mode === "team" ? null : yearsExperience as Experience,
      paymentPreference: paymentPreference as NormalizedCopilotLead["paymentPreference"],
      copilotLicence: copilotLicence as NormalizedCopilotLead["copilotLicence"],
      joiningReadiness: joiningReadiness as NormalizedCopilotLead["joiningReadiness"],
      seats,
      enrollmentType: mode,
      submitterIsParticipant:
        mode === "team" ? input.submitterIsParticipant !== false : true,
      diplomaSlug: "online",
    } satisfies NormalizedCopilotLead,
    valid: Object.keys(errors).length === 0,
  };
}

export type ParticipantInput = { fullName?: unknown; email?: unknown };

export function validateParticipant(input: ParticipantInput) {
  const errors: Record<string, string> = {};
  const fullName = normalizeHumanText(input.fullName);
  const email = stringValue(input.email).trim().toLowerCase();
  const nameError = validateFullName(fullName);
  if (nameError) errors.fullName = nameError;
  const emailError = validateEmailAddress(email, { requireWorkDomain: true });
  if (emailError) errors.email = emailError;
  return {
    errors,
    normalized: { fullName, email },
    valid: Object.keys(errors).length === 0,
  };
}

export function validatePayerEmail(value: unknown) {
  return validateEmailAddress(value, { requireWorkDomain: false });
}
