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
  linkedinUrlRaw: string;
  linkedinKind: LinkedInKind | null;
  suspectedSpam: boolean;
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
  // Egyptian mobile typed without its leading 0 (common on mobile keyboards).
  if (/^1[0125]\d{8}$/.test(compact)) return `+20${compact}`;
  if (/^0020/.test(compact)) return `+${compact.slice(2)}`;
  return compact;
}

export type LinkedInKind = "profile" | "pub" | "short";
export type LinkedInFailure = "empty" | "not_linkedin" | "not_profile";
export type LinkedInResult =
  | { ok: true; kind: LinkedInKind; url: string; raw: string }
  | { ok: false; reason: LinkedInFailure; raw: string };

export const linkedInErrorMessages: Record<LinkedInFailure, string> = {
  empty: "Paste your LinkedIn profile link, e.g. linkedin.com/in/your-name",
  not_linkedin: "Paste your LinkedIn profile link, e.g. linkedin.com/in/your-name",
  not_profile: "This looks like a company page or a post. Please paste your personal profile link.",
};

/**
 * Accepts every real LinkedIn personal-profile link format (www., m., any
 * two-letter country subdomain, lnkd.in short links and legacy /pub/ links)
 * and rejects non-LinkedIn sites, lookalikes and non-profile LinkedIn pages.
 * Shared by the form (client) and the lead API (server, authoritative).
 */
export function parseLinkedIn(input: string): LinkedInResult {
  const raw = String(input ?? "").trim();
  if (!raw) return { ok: false, reason: "empty", raw };

  let candidate = raw.replace(/\s+/g, "");
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, reason: "not_linkedin", raw };
  }

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "lnkd.in" || host === "www.lnkd.in") {
    const code = parts[0];
    if (code && /^[A-Za-z0-9_-]{3,}$/.test(code)) {
      return { ok: true, kind: "short", url: `https://lnkd.in/${code}`, raw };
    }
    return { ok: false, reason: "not_profile", raw };
  }

  if (!/^(?:(?:www|m|[a-z]{2})\.)?linkedin\.com$/.test(host)) {
    return { ok: false, reason: "not_linkedin", raw };
  }

  const section = (parts[0] || "").toLowerCase();
  let slug: string;
  try {
    slug = parts[1] ? decodeURIComponent(parts[1]) : "";
  } catch {
    slug = parts[1] || "";
  }

  if (section === "in" && slug.length >= 3 && slug.length <= 100) {
    return {
      ok: true,
      kind: "profile",
      url: `https://www.linkedin.com/in/${encodeURIComponent(slug.toLowerCase())}`,
      raw,
    };
  }

  if (section === "pub" && slug && slug.toLowerCase() !== "dir") {
    const rest = parts.slice(1).map((part) => part.toLowerCase()).join("/");
    return { ok: true, kind: "pub", url: `https://www.linkedin.com/pub/${rest}`, raw };
  }

  return { ok: false, reason: "not_profile", raw };
}

export function normalizeLinkedIn(value: string) {
  const result = parseLinkedIn(value);
  return result.ok ? result.url : result.raw;
}

export function validateLead(input: LeadInput) {
  const errors: Record<string, string> = {};
  const name = input.fullName.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  const mobile = normalizePhone(input.mobile);
  const linkedin = parseLinkedIn(input.linkedinUrl);
  const linkedinUrl = linkedin.ok ? linkedin.url : linkedin.raw;
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
  // Repeated or sequential digits are flagged for sales review, not blocked.
  const suspectedSpam = repeatedOrSequentialDigits(mobile);
  if (!input.mobile.trim()) errors.mobile = "Mobile number is required.";
  else if (!egyptianValid && !internationalValid) {
    errors.mobile = "Enter a valid mobile number with its country code.";
  } else if (digits.length < 8 || digits.length > 15) {
    errors.mobile = "Enter a valid mobile number with its country code.";
  }

  if (!linkedin.ok) errors.linkedinUrl = linkedInErrorMessages[linkedin.reason];

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
      linkedinUrlRaw: linkedin.raw,
      linkedinKind: linkedin.ok ? linkedin.kind : null,
      suspectedSpam,
      yearsExperience: input.yearsExperience as Experience,
      paymentPreference: input.paymentPreference as PaymentKind,
      startTiming: input.startTiming as StartTiming,
      diplomaSlug: input.diplomaSlug as DiplomaId,
    } satisfies NormalizedLead,
    valid: Object.keys(errors).length === 0,
  };
}
