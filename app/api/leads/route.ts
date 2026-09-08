import { after, NextResponse } from "next/server";
import { syncLeadToGoogleSheets, type SheetLead } from "../../lib/googleSheets";
import { validateLead } from "../../lib/leadValidation";
import { triggerLeadAutomation } from "../../lib/leadAutomation";
import {
  createDiplomaSessionToken,
  DIPLOMA_SESSION_COOKIE,
  DIPLOMA_SESSION_MAX_AGE_SECONDS,
} from "../../lib/diplomaSession";

const allowedDiplomas = new Set(["offline", "online"]);
const allowedAttributionKeys = [
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

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vercelOidcToken =
    request.headers.get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  }

  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const requestId = text(input.requestId, 100);
  const name = text(input.name, 120);
  const email = text(input.email, 254);
  const mobile = text(input.mobile, 40);
  const linkedinUrl = text(input.linkedinUrl, 300);
  const yearsExperience = text(input.yearsExperience, 30);
  const paymentPreference = text(input.paymentPreference, 30);
  const programmePrice = text(input.programmePrice, 30);
  const programmePriceValue = Number(input.programmePriceValue);
  const startTiming = text(input.startTiming, 30);
  const currentWave = text(input.currentWave, 30);
  const currentWaveStartDate = text(input.currentWaveStartDate, 40);
  const diplomaSlug = text(input.diplomaSlug, 40);
  const sourceContext = text(input.sourceContext, 40);
  const leadMagnet = text(input.leadMagnet, 80);
  const honeypot = text(input.companyWebsite, 200);
  const rawAttribution =
    input.attribution && typeof input.attribution === "object"
      ? (input.attribution as Record<string, unknown>)
      : {};

  const leadValidation = validateLead({
    fullName: name,
    email,
    mobile,
    linkedinUrl,
    yearsExperience,
    paymentPreference,
    startTiming,
    diplomaSlug,
  });
  const expectedProgramme = diplomaSlug === "offline"
    ? { price: "EGP 25,000", priceValue: 25000, wave: "Wave 15", startDate: "26 September 2026" }
    : { price: "EGP 20,000", priceValue: 20000, wave: "Wave 11", startDate: "27 September 2026" };

  if (
    !requestId ||
    !leadValidation.valid ||
    !allowedDiplomas.has(diplomaSlug) ||
    programmePrice !== expectedProgramme.price ||
    programmePriceValue !== expectedProgramme.priceValue ||
    currentWave !== expectedProgramme.wave ||
    currentWaveStartDate !== expectedProgramme.startDate ||
    !["primary", "modal"].includes(sourceContext) ||
    leadMagnet !== "free-ai-agent-guide"
  ) {
    console.warn(
      "Lead request rejected",
      JSON.stringify({
        step: "validation",
        code: "invalid_lead_data",
        sourceContext: sourceContext || "missing",
        diplomaSlug: diplomaSlug || "missing",
      }),
    );
    return NextResponse.json({ error: "Invalid lead data" }, { status: 422 });
  }

  // Browser/profile autofill can populate visually hidden text fields on Android.
  // Treat the legacy honeypot as an observability signal, never as a reason to
  // discard an otherwise valid lead.
  if (honeypot) {
    console.warn(
      "Lead honeypot populated",
      JSON.stringify({
        step: "validation",
        code: "honeypot_autofill_ignored",
        sourceContext,
        diplomaSlug,
      }),
    );
  }

  const attribution = Object.fromEntries(
    allowedAttributionKeys.flatMap((key) => {
      const value = text(rawAttribution[key], 500);
      return value ? [[key, value]] : [];
    }),
  );

  const leadsEndpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/leads`;
  const response = await fetch(`${leadsEndpoint}?select=*`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      request_id: requestId,
      name: leadValidation.normalized.name,
      email: leadValidation.normalized.email,
      mobile: leadValidation.normalized.mobile,
      linkedin_url: leadValidation.normalized.linkedinUrl,
      years_experience: leadValidation.normalized.yearsExperience,
      payment_preference: leadValidation.normalized.paymentPreference,
      programme_price: programmePrice,
      programme_price_value: programmePriceValue,
      current_wave: currentWave,
      current_wave_start_date: currentWaveStartDate,
      start_timing: leadValidation.normalized.startTiming,
      diploma_slug: diplomaSlug,
      lead_source: leadMagnet,
      source_context: sourceContext,
      attribution,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    let supabaseCode = "unknown";
    try {
      const errorBody = (await response.json()) as { code?: unknown };
      if (typeof errorBody.code === "string") supabaseCode = errorBody.code;
    } catch {
      // A non-JSON upstream response is still reported without leaking its body.
    }
    console.error(
      "Lead persistence failed",
      JSON.stringify({
        step: "supabase",
        status: response.status,
        code: supabaseCode,
        sourceContext,
        diplomaSlug,
      }),
    );
    return NextResponse.json(
      { error: "Lead persistence failed", code: "supabase_rejected" },
      { status: 502 },
    );
  }

  let persistedLeads = (await response.json()) as SheetLead[];
  if (!persistedLeads.length) {
    const existingResponse = await fetch(
      `${leadsEndpoint}?request_id=eq.${encodeURIComponent(requestId)}&select=*`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: "no-store",
      },
    );
    if (existingResponse.ok) {
      persistedLeads = (await existingResponse.json()) as SheetLead[];
    }
  }

  const persistedLead = persistedLeads[0];
  if (!persistedLead) {
    return NextResponse.json(
      { error: "Lead persistence could not be confirmed", code: "persistence_unconfirmed" },
      { status: 502 },
    );
  }

  after(async () => {
    const jobs = [
      {
        name: "google_sheets",
        run: () => syncLeadToGoogleSheets(persistedLead, vercelOidcToken),
      },
      {
        name: "n8n",
        run: () => triggerLeadAutomation(persistedLead),
      },
    ];

    const results = await Promise.allSettled(jobs.map((job) => job.run()));

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          "Lead background integration failed",
          JSON.stringify({
            step: jobs[index].name,
            code:
              result.reason instanceof Error ? result.reason.message : "unknown",
            requestId: persistedLead.request_id,
            diplomaSlug: persistedLead.diploma_slug,
          }),
        );
      }
    });
  });

  const leadResponse = NextResponse.json(
    { accepted: true, requestId: persistedLead.request_id },
    { status: 201 },
  );
  const sessionSecret = process.env.MESKA_CHATBASE_SESSION_SECRET;
  if (sessionSecret) {
    try {
      leadResponse.cookies.set({
        name: DIPLOMA_SESSION_COOKIE,
        value: createDiplomaSessionToken(
          {
            requestId: persistedLead.request_id,
            firstName: persistedLead.name,
            diplomaSlug: persistedLead.diploma_slug,
          },
          sessionSecret,
        ),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: DIPLOMA_SESSION_MAX_AGE_SECONDS,
      });
    } catch {
      console.warn(
        "Diploma advisor session unavailable",
        JSON.stringify({ step: "chatbase_session", code: "session_signing_failed" }),
      );
    }
  }

  return leadResponse;
}
