import assert from "node:assert/strict";
import test from "node:test";
import { validateLead } from "../app/lib/leadValidation.ts";

const base = {
  fullName: "Ahmed Zaki",
  email: "ahmed@example.org",
  mobile: "+201012345678",
  linkedinUrl: "linkedin.com/in/ahmed-zaki-12345",
  yearsExperience: "3–6 years",
  paymentPreference: "full",
  startTiming: "current_wave",
  diplomaSlug: "offline",
};

for (const [label, changes, expected] of [
  ["Egyptian local mobile", { mobile: "01012345678" }, "+201012345678"],
  ["Egyptian mobile without leading 0", { mobile: "1012345678" }, "+201012345678"],
  ["Egyptian mobile without leading 0, spaced", { mobile: "115 123 4567" }, "+201151234567"],
  ["Egyptian 0020 mobile", { mobile: "00201012345678" }, "+201012345678"],
  ["Egyptian +20 mobile", { mobile: "+20 101 234 5678" }, "+201012345678"],
  ["international mobile", { mobile: "+44 7700 900123" }, "+447700900123"],
  // 29 Oct 2026 (owner decision): same phone rules as the Copilot form.
  ["Arabic-Indic digits", { mobile: "٠١٠١٢٣٤٥٦٧٨" }, "+201012345678"],
  ["Persian digits", { mobile: "۰۱۰۱۲۳۴۵۶۷۸" }, "+201012345678"],
  ["Arabic digits with spaces", { mobile: "٠١٠ ١٢٣ ٤٥٦٧٨" }, "+201012345678"],
  ["12-digit Egyptian number without +", { mobile: "201012345678" }, "+201012345678"],
  ["Egyptian 20 with extra 0, no +", { mobile: "2001012345678" }, "+201012345678"],
  ["Egyptian +20 with extra 0", { mobile: "+20 0101 234 5678" }, "+201012345678"],
  ["number pasted with direction marks", { mobile: "‎+20 101 234 5678‏" }, "+201012345678"],
  ["international 00 prefix", { mobile: "0044 7700 900123" }, "+447700900123"],
  ["Arabic name", { fullName: "أحمد زكي" }, "+201012345678"],
  ["international name", { fullName: "José García" }, "+201012345678"],
  ["legitimate single-word name", { fullName: "Ari" }, "+201012345678"],
  ["hyphenated and apostrophe name", { fullName: "Anne-Marie O'Neil" }, "+201012345678"],
  ["normal Gmail address", { email: "sarah.khan@gmail.com" }, "+201012345678"],
  ["legitimate short email", { email: "li@gmail.com" }, "+201012345678"],
  ["email containing numbers", { email: "ahmed.zaki2026@gmail.com" }, "+201012345678"],
  ["business email", { email: "person@meska.ai" }, "+201012345678"],
]) {
  test(`accepts ${label}`, () => {
    const result = validateLead({ ...base, ...changes });
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.normalized.mobile, expected);
  });
}

for (const experience of ["0–2 years", "3–6 years", "7–10 years", "10+ years"]) {
  test(`accepts ${experience}`, () => {
    assert.equal(validateLead({ ...base, yearsExperience: experience }).valid, true);
  });
}

for (const diplomaSlug of ["offline", "online"]) {
  for (const paymentPreference of ["full", "installments"]) {
    for (const startTiming of ["current_wave", "later_wave"]) {
      test(`accepts ${diplomaSlug}/${paymentPreference}/${startTiming}`, () => {
        assert.equal(validateLead({ ...base, diplomaSlug, paymentPreference, startTiming }).valid, true);
      });
    }
  }
}

for (const [label, changes, field] of [
  ["blank fields", { fullName: "", email: "", mobile: "", linkedinUrl: "", yearsExperience: "", paymentPreference: "", startTiming: "" }, "fullName"],
  ["malformed email", { email: "person@invalid" }, "email"],
  ["placeholder email", { email: "12345@gmail.com" }, "email"],
  ["random email", { email: "jdfkjfkdkngjng@gmail.com" }, "email"],
  ["reported garbage email", { email: "dnfd@gmail.com" }, "email"],
  ["short keyboard email", { email: "asdf@gmail.com" }, "email"],
  ["keyboard email", { email: "asdfgh@gmail.com" }, "email"],
  ["qwerty email", { email: "qwerty@gmail.com" }, "email"],
  ["test email", { email: "test@gmail.com" }, "email"],
  ["testing email", { email: "testing@gmail.com" }, "email"],
  ["invalid domain", { email: "person@example.1com" }, "email"],
  ["letters in phone", { mobile: "+20phone" }, "mobile"],
  ["impossible phone length", { mobile: "+20123" }, "mobile"],
  ["garbage name", { fullName: "!!!!!!" }, "fullName"],
  ["numeric name", { fullName: "123456" }, "fullName"],
  ["two-letter name", { fullName: "ab" }, "fullName"],
  ["two repeated letters", { fullName: "aa" }, "fullName"],
  ["two numeric characters", { fullName: "12" }, "fullName"],
  ["short keyboard-row name", { fullName: "asdf" }, "fullName"],
  ["reported machine-like name", { fullName: "fdfdknfkn" }, "fullName"],
  ["keyboard-row name", { fullName: "asdfgh" }, "fullName"],
  ["qwerty name", { fullName: "qwerty" }, "fullName"],
  ["repeated-character name", { fullName: "aaaaaaa" }, "fullName"],
  ["repeated-pattern name", { fullName: "abcabcabc" }, "fullName"],
  ["placeholder name", { fullName: "test" }, "fullName"],
  ["placeholder testing name", { fullName: "testing" }, "fullName"],
  ["malformed LinkedIn", { linkedinUrl: "linkedin.com" }, "linkedinUrl"],
  ["Egyptian mobile too short without 0", { mobile: "101234567" }, "mobile"],
  ["Arabic digits too short", { mobile: "٠١٠١٢٣٤٥" }, "mobile"],
  ["foreign 12 digits without + or 00", { mobile: "971501234567" }, "mobile"],
  ["Egyptian landline without +", { mobile: "20223456789" }, "mobile"],
  ["other social URL", { linkedinUrl: "facebook.com/ahmed" }, "linkedinUrl"],
  ["fake LinkedIn domain", { linkedinUrl: "linkedin.example/in/ahmed" }, "linkedinUrl"],
]) {
  test(`rejects ${label}`, () => {
    const result = validateLead({ ...base, ...changes });
    assert.equal(result.valid, false);
    assert.ok(result.errors[field]);
  });
}

test("normalizes LinkedIn personal profiles", () => {
  const result = validateLead(base);
  assert.equal(result.normalized.linkedinUrl, "https://www.linkedin.com/in/ahmed-zaki-12345");
});

test("rejects the exact reported name and email together", () => {
  const result = validateLead({
    ...base,
    fullName: "fdfdknfkn",
    email: "dnfd@gmail.com",
  });
  assert.equal(result.valid, false);
  assert.equal(result.errors.fullName, "Please enter your real full name.");
  assert.equal(result.errors.email, "Please enter a valid email address you actively use.");
});

test("flags repeated or sequential phone digits instead of blocking", () => {
  for (const mobile of ["+201111111111", "01111111111"]) {
    const result = validateLead({ ...base, mobile });
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.normalized.suspectedSpam, true);
  }
  assert.equal(validateLead(base).normalized.suspectedSpam, false);
});

test("keeps the typed LinkedIn value and its type", () => {
  const typed = "https://m.linkedin.com/in/Ahmed-Zaki?utm_source=share";
  const result = validateLead({ ...base, linkedinUrl: typed });
  assert.equal(result.valid, true);
  assert.equal(result.normalized.linkedinUrl, "https://www.linkedin.com/in/ahmed-zaki");
  assert.equal(result.normalized.linkedinUrlRaw, typed);
  assert.equal(result.normalized.linkedinKind, "profile");
});

test("LinkedIn error messages per failure reason", () => {
  const paste = "Paste your LinkedIn profile link, e.g. linkedin.com/in/your-name";
  const notProfile = "This looks like a company page or a post. Please paste your personal profile link.";
  assert.equal(validateLead({ ...base, linkedinUrl: "" }).errors.linkedinUrl, paste);
  assert.equal(validateLead({ ...base, linkedinUrl: "ahmed-zaki" }).errors.linkedinUrl, paste);
  assert.equal(validateLead({ ...base, linkedinUrl: "https://facebook.com/ahmed" }).errors.linkedinUrl, paste);
  assert.equal(validateLead({ ...base, linkedinUrl: "https://www.linkedin.com/company/meska-ai" }).errors.linkedinUrl, notProfile);
});
