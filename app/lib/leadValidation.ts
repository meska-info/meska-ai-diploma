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

const keyboardRuns = [
  "qwerty",
  "asdfgh",
  "zxcvbn",
  "qazwsx",
  "poiuyt",
  "lkjhg",
  "mnbvc",
];

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
  if (
    keyboardRuns.some(
      (run) => compact.includes(run) || (run.includes(compact) && compact.length >= 5),
    )
  ) score += 4;
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
  if (
    tokens.some((token) =>
      /^(test|testing|synthetic|dummy|fake|example|placeholder)$/u.test(token),
    )
  ) return true;
  return tokens.some((token) => /^[a-z]+$/i.test(token) && asciiGarbageSignals(token) >= 4);
}

function looksLikeGarbageEmailLocal(local: string, domain: string) {
  const atoms = local.split(/[._+-]+/).filter(Boolean);
  if (
    /^(?:test(?:ing)?|fake|example|demo|sample|placeholder|no-?reply)(?:\d+)?$/i.test(local)
  ) return true;
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

  if (!name) errors.fullName = "Full name is required.";
  else if (
    name.length < 2 ||
    name.length > 120 ||
    !/\p{L}/u.test(name) ||
    /^\d+$/u.test(name) ||
    /[^\p{L}\p{M}\s.'’-]/u.test(name) ||
    looksLikeGarbageName(name)
  ) errors.fullName = "Enter your real name; random or repeated text isn’t accepted.";

  const emailMatch = email.match(/^([^\s@]+)@([a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)+)$/i);
  if (!email) errors.email = "Email address is required.";
  else if (!emailMatch || email.length > 254) errors.email = "Enter a valid email address.";
  else {
    const [local, domain] = [emailMatch[1], emailMatch[2]];
    if (
      /^(\d)\1{4,}$/.test(local) ||
      looksLikeGarbageEmailLocal(local, domain) ||
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
