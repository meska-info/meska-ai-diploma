export class EnrollmentRequestError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function responseError(response: Response) {
  let body: { error?: unknown; errors?: unknown } = {};
  try {
    body = await response.json() as typeof body;
  } catch {
    body = {};
  }
  return new EnrollmentRequestError(
    response.status,
    typeof body.error === "string" ? body.error : "Enrollment request failed",
    body.errors && typeof body.errors === "object"
      ? body.errors as Record<string, string>
      : undefined,
  );
}

export async function patchEnrollment(
  leadId: string,
  input: Record<string, unknown>,
  options: { retries?: number; keepalive?: boolean } = {},
) {
  const retries = options.retries ?? 0;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`/api/copilot-leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        keepalive: options.keepalive,
      });
      if (!response.ok) throw await responseError(response);
      return await response.json() as {
        seats: number;
        quotedTotal: number;
        enrollmentType: "individual" | "team";
        participantsCount: number;
        status: string;
      };
    } catch (error) {
      lastError = error;
      if (error instanceof EnrollmentRequestError && error.status < 500) throw error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
      }
    }
  }
  throw lastError;
}
