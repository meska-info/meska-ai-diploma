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
  ["Egyptian +20 mobile", { mobile: "+20 101 234 5678" }, "+201012345678"],
  ["international mobile", { mobile: "+44 7700 900123" }, "+447700900123"],
  ["Arabic name", { fullName: "أحمد زكي" }, "+201012345678"],
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
  ["letters in phone", { mobile: "+20phone" }, "mobile"],
  ["impossible phone length", { mobile: "+20123" }, "mobile"],
  ["repeated phone", { mobile: "+201111111111" }, "mobile"],
  ["garbage name", { fullName: "!!!!!!" }, "fullName"],
  ["numeric name", { fullName: "123456" }, "fullName"],
  ["malformed LinkedIn", { linkedinUrl: "linkedin.com" }, "linkedinUrl"],
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
