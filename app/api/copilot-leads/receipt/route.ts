import { NextResponse } from "next/server";
import { CopilotApiError, readCopilotLeadReceipt } from "../../../lib/copilotLeadsServer";

export async function POST(request: Request) {
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
    const leadId = typeof input.leadId === "string" ? input.leadId : "";
    const editToken = typeof input.editToken === "string" ? input.editToken : "";
    return NextResponse.json(
      await readCopilotLeadReceipt(leadId, editToken, { supabaseUrl, serviceRoleKey }),
    );
  } catch (error) {
    if (error instanceof CopilotApiError) return NextResponse.json(error.body, { status: error.status });
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  }
}
