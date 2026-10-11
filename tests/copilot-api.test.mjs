import assert from "node:assert/strict";
import test from "node:test";
import {
  CopilotApiError,
  createCopilotLead,
  hashEditToken,
  readCopilotLeadReceipt,
  updateCopilotLead,
} from "../app/lib/copilotLeadsServer.ts";

const options = {
  supabaseUrl: "https://example.supabase.co",
  serviceRoleKey: "test-service-key",
  now: () => new Date("2026-10-11T18:00:00.000Z"),
};

const individual = {
  requestId: "lead-test-individual-0001",
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
  sourceContext: "primary",
  companyWebsite: "",
  attribution: { utm_source: "meta" },
};

function createFetch({ repeat = [], insert = null, existing = null } = {}) {
  const calls = [];
  const fetchImplementation = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const method = init.method ?? "GET";
    if (String(url).includes("email=eq.")) return Response.json(repeat);
    if (method === "POST") {
      const body = JSON.parse(init.body);
      return Response.json(insert ?? [{
        ...body,
        created_at: "2026-10-11T18:00:00.000Z",
      }]);
    }
    if (method === "GET" && String(url).includes("request_id=eq.")) {
      return Response.json(existing ? [existing] : []);
    }
    if (method === "PATCH") {
      const body = JSON.parse(init.body);
      return Response.json(existing ? [{ ...existing, ...body }] : []);
    }
    return Response.json([]);
  };
  return { calls, fetchImplementation };
}

test("POST creates an individual lead and computes price server-side", async () => {
  const mock = createFetch();
  const result = await createCopilotLead(
    { ...individual, quotedTotal: 1, pricePerSeat: 1 },
    { ...options, fetchImplementation: mock.fetchImplementation },
  );
  assert.equal(result.response.seats, 1);
  assert.equal(result.response.quotedTotal, 30_000);
  assert.match(result.response.editToken, /^[0-9a-f-]{36}$/i);
  const insert = mock.calls.find((call) => call.init.method === "POST");
  const body = JSON.parse(insert.init.body);
  assert.equal(body.enrollment_type, "individual");
  assert.equal(body.quoted_total, 30_000);
  assert.equal(body.price_per_seat, 30_000);
  assert.equal(body.repeat_submission, false);
});

test("POST creates a six-seat team and marks a repeat submission", async () => {
  const mock = createFetch({ repeat: [{ id: "older" }] });
  const result = await createCopilotLead(
    {
      ...individual,
      requestId: "lead-test-team-0001",
      enrollmentType: "team",
      seats: 6,
      yearsExperience: null,
      paymentPreference: "enterprise",
      copilotLicence: "some",
      submitterIsParticipant: true,
    },
    { ...options, fetchImplementation: mock.fetchImplementation },
  );
  assert.equal(result.response.quotedTotal, 135_000);
  assert.equal(result.lead.tier_rate, 0.25);
  assert.equal(result.lead.participants_count, 1);
  assert.equal(result.lead.repeat_submission, true);
});

test("POST accepts the cached legacy payload", async () => {
  const mock = createFetch();
  const result = await createCopilotLead(
    {
      requestId: "lead-test-legacy-0001",
      name: "Mona Adel",
      email: "mona.adel@meska.ai",
      mobile: "+201012345678",
      linkedinUrl: "linkedin.com/in/mona-adel",
      yearsExperience: "3–6 years",
      paymentPreference: "full",
      startTiming: "discuss_upcoming",
      diplomaSlug: "online",
      sourceContext: "primary",
    },
    { ...options, fetchImplementation: mock.fetchImplementation },
  );
  assert.equal(result.lead.enrollment_type, "individual");
  assert.equal(result.lead.company_name, null);
});

test("POST returns shared validation errors and does not insert", async () => {
  const mock = createFetch();
  await assert.rejects(
    createCopilotLead(
      { ...individual, email: "mona@gmail.com", companyName: "123" },
      { ...options, fetchImplementation: mock.fetchImplementation },
    ),
    (error) => {
      assert.ok(error instanceof CopilotApiError);
      assert.equal(error.status, 400);
      assert.ok(error.body.errors.email);
      assert.ok(error.body.errors.companyName);
      return true;
    },
  );
  assert.equal(mock.calls.length, 0);
});

test("POST preserves the current fail-open honeypot behavior", async () => {
  const mock = createFetch();
  const result = await createCopilotLead(
    { ...individual, requestId: "lead-test-honeypot-0001", companyWebsite: "autofilled.example" },
    { ...options, fetchImplementation: mock.fetchImplementation },
  );
  assert.ok(result.response.leadId);
});

test("POST idempotent retry reuses the row and refreshes its edit token", async () => {
  const existing = {
    id: "9655da8d-9f24-49e0-9ee1-325d49b2dd36",
    request_id: individual.requestId,
    enrollment_type: "individual",
    seats: 1,
    quoted_total: 30_000,
  };
  const mock = createFetch({ insert: [], existing });
  const result = await createCopilotLead(individual, {
    ...options,
    fetchImplementation: mock.fetchImplementation,
  });
  assert.equal(result.response.leadId, existing.id);
  assert.ok(mock.calls.some((call) => call.init.method === "PATCH"));
});

function patchFetch(lead, { missing = false } = {}) {
  const calls = [];
  return {
    calls,
    fetchImplementation: async (url, init = {}) => {
      calls.push({ url: String(url), init });
      if ((init.method ?? "GET") === "GET") return Response.json(missing ? [] : [lead]);
      const update = JSON.parse(init.body);
      return Response.json([{ ...lead, ...update }]);
    },
  };
}

const editToken = "2f3d0f0d-78d9-476c-b0ed-568a555fce56";
const lead = {
  id: "4a829244-62c4-4800-82e7-7001ff9a123d",
  request_id: "lead-test-patch-0001",
  created_at: "2026-10-11T18:00:00.000Z",
  name: "Mona Adel",
  email: "mona.adel@meska.ai",
  mobile: "+201012345678",
  linkedin_url: "https://www.linkedin.com/in/mona-adel",
  years_experience: null,
  payment_preference: "full",
  programme_price: "EGP 72,000",
  programme_price_value: 72_000,
  current_wave: "Cohort 01",
  current_wave_start_date: "4 November 2026",
  start_timing: "current_wave",
  diploma_slug: "online",
  lead_source: "copilot-course",
  source_context: "primary",
  attribution: {},
  enrollment_type: "team",
  seats: 3,
  tier_rate: 0.2,
  price_per_seat: 24_000,
  quoted_total: 72_000,
  company_name: "Meska AI",
  edit_token_hash: hashEditToken(editToken),
  seats_history: [],
  status: "lead",
};

test("PATCH rejects missing and tampered sessions", async () => {
  const missing = patchFetch(lead, { missing: true });
  await assert.rejects(
    updateCopilotLead(lead.id, { editToken }, { ...options, fetchImplementation: missing.fetchImplementation }),
    (error) => error.status === 404,
  );
  const mock = patchFetch(lead);
  await assert.rejects(
    updateCopilotLead(lead.id, { editToken: "wrong", seats: 5 }, { ...options, fetchImplementation: mock.fetchImplementation }),
    (error) => error.status === 401,
  );
});

test("PATCH recomputes pricing and switches enrollment type", async () => {
  const mock = patchFetch(lead);
  const result = await updateCopilotLead(
    lead.id,
    { editToken, seats: 5 },
    { ...options, fetchImplementation: mock.fetchImplementation },
  );
  assert.equal(result.response.quotedTotal, 112_500);
  assert.equal(result.response.enrollmentType, "team");
  const body = JSON.parse(mock.calls.find((call) => call.init.method === "PATCH").init.body);
  assert.equal(body.price_per_seat, 22_500);
  assert.equal(body.checkout_url.includes("42776902369326:5"), true);
});

test("PATCH validates, de-duplicates and caps participants", async () => {
  const mock = patchFetch({ ...lead, seats: 2 });
  await assert.rejects(
    updateCopilotLead(
      lead.id,
      {
        editToken,
        participants: [
          { fullName: "Mona Adel", email: "mona@meska.ai" },
          { fullName: "Omar Adel", email: "mona@meska.ai" },
          { fullName: "Ignored Person", email: "ignored@meska.ai" },
        ],
      },
      { ...options, fetchImplementation: mock.fetchImplementation },
    ),
    (error) => error.status === 400 && error.body.errors["participants.1.email"] === "This email is already on the list.",
  );
});

test("PATCH records invoice and send-to-manager lifecycle states", async () => {
  const invoice = patchFetch(lead);
  const result = await updateCopilotLead(
    lead.id,
    { editToken, paymentPath: "invoice" },
    { ...options, fetchImplementation: invoice.fetchImplementation },
  );
  assert.equal(result.response.status, "invoice_requested");
  const send = patchFetch({ ...lead, status: "invoice_requested" });
  const shared = await updateCopilotLead(
    lead.id,
    { editToken, paymentPath: "send", payerEmail: "finance@gmail.com" },
    { ...options, fetchImplementation: send.fetchImplementation },
  );
  assert.equal(shared.response.status, "payment_link_shared");
});

test("receipt authenticates the session without exposing the edit token", async () => {
  const mock = patchFetch(lead);
  const receipt = await readCopilotLeadReceipt(
    lead.id,
    editToken,
    { ...options, fetchImplementation: mock.fetchImplementation },
  );
  assert.equal(receipt.quotedTotal, 72_000);
  assert.equal("editToken" in receipt, false);
});
