import { after, NextResponse } from "next/server";
import { CopilotApiError, updateCopilotLead } from "../../../lib/copilotLeadsServer";
import { syncLeadToGoogleSheets } from "../../../lib/googleSheets";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ leadId: string }> },
) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  }
  let input: Record<string, unknown>;
  try {
    input = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const { leadId } = await context.params;
    const result = await updateCopilotLead(leadId, input, { supabaseUrl, serviceRoleKey });
    const oidcToken = request.headers.get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;
    after(async () => {
      try {
        await syncLeadToGoogleSheets(result.lead, oidcToken);
      } catch (error) {
        console.error("Copilot lead update Sheets sync failed", JSON.stringify({
          step: "google_sheets",
          code: error instanceof Error ? error.message : "unknown",
          leadId,
        }));
      }
    });
    return NextResponse.json(result.response);
  } catch (error) {
    if (error instanceof CopilotApiError) return NextResponse.json(error.body, { status: error.status });
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  }
}
