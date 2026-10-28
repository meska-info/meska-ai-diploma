/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is
 * set on the project. Until it is set, only Vercel's cron user agent is
 * accepted; both cron jobs are idempotent and only retry pending work, so a
 * spoofed call cannot create or expose data.
 */
export function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    return request.headers.get("authorization") === `Bearer ${secret}`;
  }
  return (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/");
}
