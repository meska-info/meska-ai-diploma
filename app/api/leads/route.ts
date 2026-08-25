import { NextResponse } from "next/server";

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
  const email = text(input.email, 254).toLowerCase();
  const mobile = text(input.mobile, 40);
  const diplomaSlug = text(input.diplomaSlug, 40);
  const sourceContext = text(input.sourceContext, 40);
  const leadMagnet = text(input.leadMagnet, 80);
  const honeypot = text(input.companyWebsite, 200);
  const rawAttribution =
    input.attribution && typeof input.attribution === "object"
      ? (input.attribution as Record<string, unknown>)
      : {};

  if (
    !requestId ||
    !name ||
    !mobile ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !allowedDiplomas.has(diplomaSlug) ||
    !["primary", "modal"].includes(sourceContext) ||
    leadMagnet !== "free-ai-agent-guide" ||
    honeypot
  ) {
    return NextResponse.json({ error: "Invalid lead data" }, { status: 422 });
  }

  const attribution = Object.fromEntries(
    allowedAttributionKeys.flatMap((key) => {
      const value = text(rawAttribution[key], 500);
      return value ? [[key, value]] : [];
    }),
  );

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal,resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      request_id: requestId,
      name,
      email,
      mobile,
      diploma_slug: diplomaSlug,
      lead_source: leadMagnet,
      source_context: sourceContext,
      attribution,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Lead persistence failed", response.status);
    return NextResponse.json({ error: "Lead persistence failed" }, { status: 502 });
  }

  return NextResponse.json({ accepted: true }, { status: 201 });
}
