import { after, NextResponse } from "next/server";
import { createCopilotLead, CopilotApiError } from "../../lib/copilotLeadsServer";
import { syncLeadToGoogleSheets } from "../../lib/googleSheets";

function serverOptions() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return { supabaseUrl, serviceRoleKey };
}

export async function POST(request: Request) {
  const options = serverOptions();
  if (!options) return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  let input: Record<string, unknown>;
  try {
    input = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const result = await createCopilotLead(input, options);
    const oidcToken = request.headers.get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;
    after(async () => {
      try {
        await syncLeadToGoogleSheets(result.lead, oidcToken);
      } catch (error) {
        console.error("Copilot lead Google Sheets sync failed", JSON.stringify({
          step: "google_sheets",
          code: error instanceof Error ? error.message : "unknown",
          leadId: result.lead.id,
        }));
      }
    });
    return NextResponse.json(result.response);
  } catch (error) {
    if (error instanceof CopilotApiError) return NextResponse.json(error.body, { status: error.status });
    console.error("Copilot lead POST failed", JSON.stringify({ step: "unknown" }));
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  }
}
