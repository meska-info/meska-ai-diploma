import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import type { SheetLead, SheetParticipant } from "./googleSheets.ts";
import {
  normalizeHumanText,
  validateCompanyName,
  validateCopilotLead,
  validateParticipant,
  validatePayerEmail,
} from "./leadValidation.ts";
import {
  cartPermalink,
  formatEGP,
  pricePerSeat,
  tierFor,
  totalFor,
} from "./teamPricing.ts";

export type CopilotLeadRow = SheetLead & {
  edit_token_hash?: string | null;
  seats_history?: Array<{ seats: number; at: string }> | null;
};

export class CopilotApiError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>) {
    super(typeof body.error === "string" ? body.error : "Copilot API error");
    this.status = status;
    this.body = body;
  }
}

type ServerOptions = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImplementation?: typeof fetch;
  now?: () => Date;
};

const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
] as const;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function hashEditToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function tokensMatch(supplied: string, storedHash: string | null | undefined) {
  if (!supplied || !storedHash) return false;
  const suppliedHash = Buffer.from(hashEditToken(supplied), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return suppliedHash.length === stored.length && timingSafeEqual(suppliedHash, stored);
}

function endpoint(options: ServerOptions) {
  return `${options.supabaseUrl.replace(/\/$/, "")}/rest/v1/leads`;
}

function headers(options: ServerOptions, prefer?: string) {
  return {
    apikey: options.serviceRoleKey,
    Authorization: `Bearer ${options.serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function cleanAttribution(value: unknown) {
  const raw = value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
  return Object.fromEntries(
    attributionKeys.flatMap((key) => {
      const cleaned = text(raw[key], 500);
      return cleaned ? [[key, cleaned]] : [];
    }),
  );
}

function startTimingFor(readiness: string) {
  return readiness === "later" ? "later_wave" : "current_wave";
}

async function parseRows(response: Response) {
  try {
    return await response.json() as CopilotLeadRow[];
  } catch {
    return [];
  }
}

async function fetchLeadById(leadId: string, options: ServerOptions) {
  const fetcher = options.fetchImplementation ?? fetch;
  const response = await fetcher(
    `${endpoint(options)}?id=eq.${encodeURIComponent(leadId)}&select=*`,
    { headers: headers(options), cache: "no-store" },
  );
  if (!response.ok) throw new CopilotApiError(503, { error: "Lead service unavailable" });
  return (await parseRows(response))[0] ?? null;
}

export async function createCopilotLead(
  input: Record<string, unknown>,
  options: ServerOptions,
) {
  const legacy = !("enrollmentType" in input);
  const mode = input.enrollmentType === "team" ? "team" : "individual";
  const joiningReadiness = text(
    input.joiningReadiness ?? (
      input.startTiming === "later_wave" ? "later" :
        input.startTiming === "current_wave" ? "upcoming" : input.startTiming
    ),
    30,
  );
  const validation = validateCopilotLead(
    {
      fullName: input.fullName ?? input.name,
      email: input.email,
      mobile: input.mobile,
      linkedinUrl: input.linkedinUrl,
      companyName: input.companyName,
      jobTitle: input.jobTitle,
      yearsExperience: input.yearsExperience,
      paymentPreference: input.paymentPreference,
      copilotLicence: input.copilotLicence,
      joiningReadiness,
      seats: input.seats,
      enrollmentType: input.enrollmentType,
      submitterIsParticipant: input.submitterIsParticipant,
      diplomaSlug: input.diplomaSlug ?? "online",
    },
    { mode, legacy },
  );
  if (!validation.valid) {
    console.warn("Copilot lead request rejected", JSON.stringify({
      step: "validation",
      fields: Object.keys(validation.errors),
      mode,
    }));
    throw new CopilotApiError(400, { errors: validation.errors });
  }

  const requestId = text(input.requestId, 100) || `copilot-${randomUUID()}`;
  const sourceContext = ["primary", "modal"].includes(text(input.sourceContext, 20))
    ? text(input.sourceContext, 20)
    : "primary";
  if (text(input.companyWebsite, 200)) {
    console.warn("Copilot lead honeypot populated", JSON.stringify({
      step: "validation",
      code: "honeypot_autofill_ignored",
      sourceContext,
    }));
  }

  const fetcher = options.fetchImplementation ?? fetch;
  const now = (options.now ?? (() => new Date()))();
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1_000).toISOString();
  const repeatResponse = await fetcher(
    `${endpoint(options)}?email=eq.${encodeURIComponent(validation.normalized.email)}&created_at=gte.${encodeURIComponent(since)}&request_id=neq.${encodeURIComponent(requestId)}&select=id&limit=1`,
    { headers: headers(options), cache: "no-store" },
  );
  const repeatSubmission = repeatResponse.ok && (await parseRows(repeatResponse)).length > 0;
  const leadId = randomUUID();
  const editToken = randomUUID();
  const tier = tierFor(validation.normalized.seats);
  const quotedTotal = totalFor(validation.normalized.seats);
  const initialParticipants: SheetParticipant[] =
    validation.normalized.enrollmentType === "team" &&
    validation.normalized.submitterIsParticipant
      ? [{ fullName: validation.normalized.fullName, email: validation.normalized.email }]
      : [];
  const attribution = cleanAttribution(input.attribution);
  const row = {
    id: leadId,
    request_id: requestId,
    name: validation.normalized.fullName,
    email: validation.normalized.email,
    mobile: validation.normalized.mobile,
    linkedin_url: validation.normalized.linkedinUrl,
    years_experience: validation.normalized.yearsExperience,
    payment_preference: validation.normalized.paymentPreference,
    programme_price: formatEGP(quotedTotal),
    programme_price_value: quotedTotal,
    current_wave: "Cohort 01",
    current_wave_start_date: "4 November 2026",
    start_timing: startTimingFor(validation.normalized.joiningReadiness),
    diploma_slug: "online",
    lead_source: "copilot-course",
    source_context: sourceContext,
    attribution,
    enrollment_type: validation.normalized.enrollmentType,
    seats: validation.normalized.seats,
    tier_rate: tier.rate,
    price_per_seat: pricePerSeat(validation.normalized.seats),
    quoted_total: quotedTotal,
    company_name: validation.normalized.companyName || null,
    job_title: validation.normalized.jobTitle || null,
    copilot_licence: validation.normalized.copilotLicence || null,
    joining_readiness: validation.normalized.joiningReadiness,
    submitter_is_participant: validation.normalized.submitterIsParticipant,
    participants: initialParticipants,
    participants_count: initialParticipants.length,
    seats_history: [{ seats: validation.normalized.seats, at: now.toISOString() }],
    payment_path: null,
    checkout_url: cartPermalink(validation.normalized.seats, { leadId }),
    status: "lead",
    repeat_submission: repeatSubmission,
    edit_token_hash: hashEditToken(editToken),
    updated_at: now.toISOString(),
  };
  const insertResponse = await fetcher(`${endpoint(options)}?on_conflict=request_id&select=*`, {
    method: "POST",
    headers: headers(options, "return=representation,resolution=ignore-duplicates"),
    body: JSON.stringify(row),
    cache: "no-store",
  });
  if (!insertResponse.ok) {
    throw new CopilotApiError(insertResponse.status >= 500 ? 503 : 400, {
      error: insertResponse.status >= 500 ? "Lead service unavailable" : "Lead persistence failed",
    });
  }
  let persisted = (await parseRows(insertResponse))[0];
  if (!persisted) {
    const retryResponse = await fetcher(
      `${endpoint(options)}?request_id=eq.${encodeURIComponent(requestId)}&select=*`,
      { headers: headers(options), cache: "no-store" },
    );
    persisted = (await parseRows(retryResponse))[0];
    if (persisted) {
      const tokenRefresh = await fetcher(
        `${endpoint(options)}?id=eq.${encodeURIComponent(persisted.id)}&select=*`,
        {
          method: "PATCH",
          headers: headers(options, "return=representation"),
          body: JSON.stringify({ edit_token_hash: hashEditToken(editToken), updated_at: now.toISOString() }),
          cache: "no-store",
        },
      );
      persisted = (await parseRows(tokenRefresh))[0] ?? persisted;
    }
  }
  if (!persisted) throw new CopilotApiError(503, { error: "Lead persistence could not be confirmed" });
  return {
    lead: persisted,
    response: {
      leadId: persisted.id,
      requestId: persisted.request_id,
      editToken,
      seats: persisted.seats ?? validation.normalized.seats,
      quotedTotal: persisted.quoted_total ?? quotedTotal,
    },
  };
}

const patchWindows = new Map<string, number[]>();

function enforcePatchRateLimit(leadId: string, now: number) {
  const recent = (patchWindows.get(leadId) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 30) throw new CopilotApiError(429, { error: "Too many updates" });
  recent.push(now);
  patchWindows.set(leadId, recent);
}

export async function updateCopilotLead(
  leadId: string,
  input: Record<string, unknown>,
  options: ServerOptions,
) {
  const fetcher = options.fetchImplementation ?? fetch;
  const now = (options.now ?? (() => new Date()))();
  enforcePatchRateLimit(leadId, now.getTime());
  const lead = await fetchLeadById(leadId, options);
  if (!lead) throw new CopilotApiError(404, { error: "Lead not found" });
  if (!tokensMatch(text(input.editToken, 100), lead.edit_token_hash)) {
    throw new CopilotApiError(401, { error: "Enrollment session expired" });
  }

  const errors: Record<string, string> = {};
  const update: Record<string, unknown> = {};
  let seats = lead.seats ?? 1;
  if ("seats" in input) {
    const supplied = Number(input.seats);
    if (!Number.isInteger(supplied) || supplied < 1 || supplied > 20) {
      errors.seats = "Seats must be between 1 and 20.";
    } else {
      seats = supplied;
      const tier = tierFor(seats);
      update.seats = seats;
      update.enrollment_type = seats > 1 ? "team" : "individual";
      update.tier_rate = tier.rate;
      update.price_per_seat = pricePerSeat(seats);
      update.quoted_total = totalFor(seats);
      update.programme_price = formatEGP(totalFor(seats));
      update.programme_price_value = totalFor(seats);
      update.seats_history = [
        ...(Array.isArray(lead.seats_history) ? lead.seats_history : []),
        { seats, at: now.toISOString() },
      ].slice(-50);
    }
  }
  if (seats > 1 && "companyName" in input) {
    const companyName = normalizeHumanText(input.companyName);
    const error = validateCompanyName(companyName);
    if (error) errors.companyName = error;
    else update.company_name = companyName;
  }
  if ("joiningReadiness" in input) {
    const readiness = text(input.joiningReadiness, 30);
    if (!["upcoming", "later", "discuss_upcoming"].includes(readiness)) {
      errors.joiningReadiness = "Select when you would like to join.";
    } else {
      update.joining_readiness = readiness;
      update.start_timing = startTimingFor(readiness);
    }
  }
  if ("participants" in input) {
    if (!Array.isArray(input.participants)) {
      errors.participants = "Participants must be a list.";
    } else {
      const seen = new Set<string>();
      const participants: SheetParticipant[] = [];
      input.participants.slice(0, seats).forEach((value, index) => {
        const participant = value && typeof value === "object"
          ? value as Record<string, unknown>
          : {};
        const result = validateParticipant({
          fullName: participant.fullName ?? participant.name,
          email: participant.email,
        });
        if (!result.valid) {
          Object.entries(result.errors).forEach(([field, message]) => {
            errors[`participants.${index}.${field}`] = message;
          });
        } else if (seen.has(result.normalized.email)) {
          errors[`participants.${index}.email`] = "This email is already on the list.";
        } else {
          seen.add(result.normalized.email);
          participants.push(result.normalized);
        }
      });
      if (!Object.keys(errors).some((key) => key.startsWith("participants"))) {
        update.participants = participants;
        update.participants_count = participants.length;
      }
    }
  }
  if ("payerEmail" in input) {
    const payerEmail = text(input.payerEmail, 254).toLowerCase();
    const error = payerEmail ? validatePayerEmail(payerEmail) : "";
    if (error) errors.payerEmail = error;
    else update.payer_email = payerEmail || null;
  }
  if ("licenceAcknowledged" in input) {
    if (typeof input.licenceAcknowledged !== "boolean") errors.licenceAcknowledged = "Invalid acknowledgement.";
    else update.licence_acknowledged = input.licenceAcknowledged;
  }
  if ("paymentPath" in input) {
    const paymentPath = text(input.paymentPath, 20);
    if (!["now", "invoice", "send"].includes(paymentPath)) {
      errors.paymentPath = "Select a payment path.";
    } else {
      update.payment_path = paymentPath;
      update.status = paymentPath === "now" ? "checkout_started"
        : paymentPath === "invoice" ? "invoice_requested" : "payment_link_shared";
      if (paymentPath === "now") update.checkout_started_at = now.toISOString();
      if (paymentPath === "invoice") update.invoice_requested_at = now.toISOString();
    }
  }
  if (Object.keys(errors).length) throw new CopilotApiError(400, { errors });
  update.checkout_url = cartPermalink(seats, { leadId });
  update.updated_at = now.toISOString();
  const response = await fetcher(
    `${endpoint(options)}?id=eq.${encodeURIComponent(leadId)}&select=*`,
    {
      method: "PATCH",
      headers: headers(options, "return=representation"),
      body: JSON.stringify(update),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new CopilotApiError(503, { error: "Lead service unavailable" });
  const persisted = (await parseRows(response))[0];
  if (!persisted) throw new CopilotApiError(404, { error: "Lead not found" });
  return {
    lead: persisted,
    response: {
      seats: persisted.seats ?? seats,
      quotedTotal: persisted.quoted_total ?? totalFor(seats),
      enrollmentType: persisted.enrollment_type ?? (seats > 1 ? "team" : "individual"),
      participantsCount: persisted.participants_count ?? 0,
      status: persisted.status ?? "lead",
    },
  };
}

export async function readCopilotLeadReceipt(
  leadId: string,
  editToken: string,
  options: ServerOptions,
) {
  const lead = await fetchLeadById(leadId, options);
  if (!lead) throw new CopilotApiError(404, { error: "Lead not found" });
  if (!tokensMatch(editToken, lead.edit_token_hash)) {
    throw new CopilotApiError(401, { error: "Enrollment session expired" });
  }
  return {
    leadId: lead.id,
    enrollmentType: lead.enrollment_type ?? "individual",
    seats: lead.seats ?? 1,
    quotedTotal: lead.quoted_total ?? 30_000,
    participantsCount: lead.participants_count ?? 0,
    status: lead.status ?? "lead",
    joiningReadiness: lead.joining_readiness ?? "upcoming",
  };
}
