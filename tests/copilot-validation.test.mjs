import assert from "node:assert/strict";
import test from "node:test";
import {
  WORK_EMAIL_ERROR,
  validateCopilotLead,
  validateParticipant,
  validatePayerEmail,
} from "../app/lib/leadValidation.ts";

const individual = {
  enrollmentType: "individual",
  seats: 1,
  fullName: "Mona Adel",
  mobile: "01012345678",
  email: "mona.adel@meska.ai",
  companyName: "Meska AI",
  jobTitle: "Operations Manager",
  linkedinUrl: "linkedin.com/in/mona-adel",
  yearsExperience: "3–6 years",
  paymentPreference: "full",
  copilotLicence: "yes",
  joiningReadiness: "upcoming",
  diplomaSlug: "online",
};

const team = {
  ...individual,
  enrollmentType: "team",
  seats: 6,
  yearsExperience: null,
  paymentPreference: "enterprise",
  copilotLicence: "some",
  submitterIsParticipant: false,
};

test("validates and normalizes the individual payload", () => {
  const result = validateCopilotLead(individual, { mode: "individual" });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.normalized.mobile, "+201012345678");
  assert.equal(result.normalized.linkedinUrl, "https://www.linkedin.com/in/mona-adel");
  assert.equal(result.normalized.seats, 1);
});

test("validates a team payload and clears experience", () => {
  const result = validateCopilotLead(team, { mode: "team" });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.normalized.yearsExperience, null);
  assert.equal(result.normalized.submitterIsParticipant, false);
});

for (const domain of [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "hotmail.co.uk",
  "yahoo.com.eg",
]) {
  test(`rejects personal work email domain ${domain}`, () => {
    const result = validateCopilotLead(
      { ...individual, email: `mona@${domain}` },
      { mode: "individual" },
    );
    assert.equal(result.errors.email, WORK_EMAIL_ERROR);
  });
}

test("retains disposable, name, mobile and LinkedIn protections", () => {
  assert.match(
    validateCopilotLead({ ...individual, email: "mona@mailinator.com" }).errors.email,
    /valid email address/i,
  );
  assert.equal(
    validateCopilotLead({ ...individual, fullName: "Test User" }).errors.fullName,
    "Please enter your real full name.",
  );
  assert.equal(
    validateCopilotLead({ ...individual, mobile: "0000000000" }).valid,
    false,
  );
  assert.equal(
    validateCopilotLead({ ...individual, mobile: "+966534378723" }).valid,
    true,
  );
  assert.equal(
    validateCopilotLead({ ...individual, linkedinUrl: "linkedin.com/company/meska" }).valid,
    false,
  );
});

test("validates company and role details", () => {
  assert.equal(
    validateCopilotLead({ ...individual, companyName: "123" }).errors.companyName,
    "Please enter your real company name.",
  );
  assert.equal(
    validateCopilotLead({ ...individual, companyName: "test" }).errors.companyName,
    "Please enter your real company name.",
  );
  assert.equal(
    validateCopilotLead({ ...individual, jobTitle: "asdfgh" }).errors.jobTitle,
    "Please enter your real job title.",
  );
});

test("accepts the cached readiness value and legacy missing new fields", () => {
  const result = validateCopilotLead(
    {
      ...individual,
      enrollmentType: undefined,
      companyName: undefined,
      jobTitle: undefined,
      copilotLicence: undefined,
      joiningReadiness: "discuss_upcoming",
    },
    { mode: "individual", legacy: true },
  );
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("applies work email validation to participants but not payer email", () => {
  assert.equal(
    validateParticipant({ fullName: "Mona Adel", email: "mona@gmail.com" }).errors.email,
    WORK_EMAIL_ERROR,
  );
  assert.equal(validatePayerEmail("finance@gmail.com"), "");
});
