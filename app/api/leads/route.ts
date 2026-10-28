import { after, NextResponse } from "next/server";
import { leadMagnets, siteContent } from "../../content";
import { validateLead } from "../../lib/leadValidation";
import {
  insertLead,
  recordPipelineEvent,
  selectLeadByRequestId,
} from "../../lib/leadStore";
import {
  runAutomation,
  runConversion,
  runSheetSync,
  type PipelineLead,
} from "../../lib/leadPipeline";
import { resolveProgrammeContext } from "../../lib/programmeContext";
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

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("=")).slice(0, 300);
  }
  return undefined;
}

/** Browser context Meta needs to match the server Lead (Conversions API). */
function conversionContext(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const ip =
    forwardedFor.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined;
  const referer = request.headers.get("referer") ?? "";
  let eventSourceUrl: string | undefined;
  try {
    const url = new URL(referer);
    if (url.hostname.endsWith("meska.ai") || url.hostname.endsWith("vercel.app")) {
      eventSourceUrl = url.toString().slice(0, 1000);
    }
  } catch {
    eventSourceUrl = undefined;
  }
  return Object.fromEntries(
    Object.entries({
      fbp: readCookie(request, "_fbp"),
      fbc: readCookie(request, "_fbc"),
      client_ip_address: ip?.slice(0, 64),
      client_user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? undefined,
      event_source_url: eventSourceUrl,
    }).filter(([, value]) => Boolean(value)),
  );
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vercelOidcToken =
    request.headers.get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  }
  const supabase = { url: supabaseUrl.replace(/\/$/, ""), key: serviceRoleKey };

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
  const programme = resolveProgrammeContext(
    siteContent.diplomas,
    diplomaSlug,
    {
      programmePrice,
      programmePriceValue,
      currentWave,
      currentWaveStartDate,
      leadMagnet,
    },
    leadMagnets,
  );

  if (
    !requestId ||
    !leadValidation.valid ||
    !allowedDiplomas.has(diplomaSlug) ||
    !programme ||
    !["primary", "modal"].includes(sourceContext)
  ) {
    const invalidFields = Object.keys(leadValidation.errors);
    console.warn(
      "Lead request rejected",
      JSON.stringify({
        step: "validation",
        code: "invalid_lead_data",
        sourceContext: sourceContext || "missing",
        diplomaSlug: diplomaSlug || "missing",
        invalidFields,
      }),
    );
    after(() =>
      recordPipelineEvent(supabase, "lead_rejected", "invalid_lead_data", {
        sourceContext: sourceContext || "missing",
        diplomaSlug: diplomaSlug || "missing",
        invalidFields,
        missingRequestId: !requestId,
      }),
    );
    return NextResponse.json({ error: "Invalid lead data" }, { status: 422 });
  }

  // The price/wave/date stored with the lead always come from app/content.ts.
  // A page/API mismatch (e.g. a tab opened before a wave change) never rejects
  // the lead; it is logged as content_drift for the pipeline-health check.
  if (programme.drift.length) {
    console.warn(
      "Lead content drift",
      JSON.stringify({
        step: "validation",
        code: "content_drift",
        diplomaSlug,
        drift: programme.drift,
      }),
    );
    after(() =>
      recordPipelineEvent(supabase, "content_drift", "content_drift", {
        diplomaSlug,
        drift: programme.drift,
      }),
    );
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

  const capiContext = conversionContext(request);
  const { response } = await insertLead(supabase, {
    request_id: requestId,
    name: leadValidation.normalized.name,
    email: leadValidation.normalized.email,
    mobile: leadValidation.normalized.mobile,
    linkedin_url: leadValidation.normalized.linkedinUrl,
    linkedin_url_raw: leadValidation.normalized.linkedinUrlRaw,
    linkedin_kind: leadValidation.normalized.linkedinKind,
    suspected_spam: leadValidation.normalized.suspectedSpam,
    years_experience: leadValidation.normalized.yearsExperience,
    payment_preference: leadValidation.normalized.paymentPreference,
    programme_price: programme.facts.price,
    programme_price_value: programme.facts.priceValue,
    current_wave: programme.facts.wave,
    current_wave_start_date: programme.facts.startDate,
    start_timing: leadValidation.normalized.startTiming,
    diploma_slug: diplomaSlug,
    lead_source: programme.leadMagnet,
    source_context: sourceContext,
    attribution,
    capi_context: capiContext,
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

  let persistedLeads = (await response.json()) as PipelineLead[];
  if (!persistedLeads.length) {
    persistedLeads = (await selectLeadByRequestId(
      supabase,
      requestId,
    )) as unknown as PipelineLead[];
  }

  const persistedRow = persistedLeads[0];
  if (!persistedRow) {
    return NextResponse.json(
      { error: "Lead persistence could not be confirmed", code: "persistence_unconfirmed" },
      { status: 502 },
    );
  }

  // Keeps the Meta match data even if the status migration is not applied yet.
  const persistedLead: PipelineLead = {
    ...persistedRow,
    capi_context: persistedRow.capi_context ?? capiContext,
  };

  // First delivery attempt right after the lead is saved. Failures are stored
  // on the lead and retried by /api/cron/lead-sync (Sheets + Meta), and n8n
  // failures are counted by /api/cron/pipeline-health.
  after(async () => {
    const jobs = [
      {
        name: "google_sheets",
        run: () => runSheetSync(supabase, persistedLead, vercelOidcToken),
      },
      {
        name: "n8n",
        run: () => runAutomation(supabase, persistedLead),
      },
      {
        name: "meta_capi",
        run: () => runConversion(supabase, persistedLead),
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
