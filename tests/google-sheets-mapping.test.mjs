import assert from "node:assert/strict";
import test from "node:test";
import {
  ENROLLMENT_SHEET_HEADERS,
  enrollmentSheetValues,
  sheetRowForLead,
} from "../app/lib/googleSheets.ts";

const lead = {
  id: "6c09bb9c-08ad-4bf1-9cff-7fa1e2fe8e52",
  request_id: "lead-sheet-team-0001",
  created_at: "2026-10-11T18:00:00.000Z",
  name: "Mona Adel",
  email: "mona@meska.ai",
  mobile: "+201012345678",
  linkedin_url: "https://www.linkedin.com/in/mona-adel",
  years_experience: null,
  payment_preference: "enterprise",
  programme_price: "EGP 135,000",
  programme_price_value: 135000,
  current_wave: "Cohort 01",
  current_wave_start_date: "4 November 2026",
  start_timing: "current_wave",
  diploma_slug: "online",
  lead_source: "copilot-course",
  source_context: "primary",
  attribution: { utm_source: "meta" },
  enrollment_type: "team",
  seats: 6,
  tier_rate: 0.25,
  price_per_seat: 22500,
  quoted_total: 135000,
  company_name: "Meska AI",
  job_title: "L&D Manager",
  copilot_licence: "some",
  licence_acknowledged: false,
  submitter_is_participant: true,
  participants: [{ fullName: "Mona Adel", email: "mona@meska.ai" }],
  participants_count: 1,
  payment_path: "invoice",
  payer_email: "",
  status: "invoice_requested",
  checkout_url: "https://aionline.meska.ai/cart/42776902369326:6",
  invoice_requested_at: "2026-10-11T18:00:00.000Z",
  repeat_submission: true,
  updated_at: "2026-10-11T18:00:00.000Z",
};

test("keeps the exact twenty appended headers", () => {
  assert.equal(ENROLLMENT_SHEET_HEADERS.length, 20);
  assert.deepEqual(ENROLLMENT_SHEET_HEADERS.slice(0, 5), [
    "Enrollment Type",
    "Seats",
    "Discount %",
    "Price per Seat (EGP)",
    "Total (EGP)",
  ]);
  assert.equal(ENROLLMENT_SHEET_HEADERS.at(-1), "Last Updated");
});

test("maps a team lead after the existing A:W columns", () => {
  const row = sheetRowForLead(lead);
  assert.equal(row.length, 43);
  assert.equal(row[0], lead.id);
  assert.equal(row[15], lead.linkedin_url);
  assert.equal(row[16], "");
  assert.equal(row[17], "Enterprise arrangement");
  assert.deepEqual(row.slice(23), enrollmentSheetValues(lead));
  assert.equal(row[23], "Team");
  assert.equal(row[24], 6);
  assert.equal(row[25], 25);
  assert.equal(row[34], "Mona Adel <mona@meska.ai>");
  assert.equal(row[37], "Invoice requested");
});
