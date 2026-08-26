export type PersistedLead = {
  id: string;
  request_id: string;
  created_at: string;
  name: string;
  email: string;
  mobile: string;
  diploma_slug: "offline" | "online";
  lead_source: string;
  source_context: string;
  attribution: Record<string, string>;
};

export type LeadAutomationPayload = {
  event: "meska.lead.created";
  leadId: string;
  requestId: string;
  createdAt: string;
  name: string;
  email: string;
  mobile: string;
  diplomaSlug: "offline" | "online";
  source: string;
  sourceContext: string;
  attribution: Record<string, string>;
};

export function normalizeMobile(value: string) {
  let digits = value.replace(/\D/g, "");

  // Egyptian international prefix: 002010... -> 2010...
  if (digits.startsWith("0020")) digits = digits.slice(2);

  // Egyptian local mobile: 010... -> 2010...
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `20${digits.slice(1)}`;
  }

  return digits;
}

export function buildLeadAutomationPayload(
  lead: PersistedLead,
): LeadAutomationPayload {
  return {
    event: "meska.lead.created",
    leadId: lead.id,
    requestId: lead.request_id,
    createdAt: lead.created_at,
    name: lead.name,
    email: lead.email,
    mobile: lead.mobile,
    diplomaSlug: lead.diploma_slug,
    source: lead.lead_source,
    sourceContext: lead.source_context,
    attribution: lead.attribution ?? {},
  };
}

export async function triggerLeadAutomation(
  lead: PersistedLead,
  fetchImplementation: typeof fetch = fetch,
) {
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_LEAD_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    throw new Error("n8n_webhook_config_missing");
  }

  const response = await fetchImplementation(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Meska-Webhook-Secret": webhookSecret,
    },
    body: JSON.stringify(buildLeadAutomationPayload(lead)),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`n8n_webhook_${response.status}`);
  }
}
