/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is
 * set on the project. Until it is set (29 Oct 2026: not set on this project),
 * only Vercel's cron user agent is checked, which anyone can imitate: a spoofed
 * call can trigger the retry job early and read the health counts (no lead
 * data). Set CRON_SECRET in Vercel (Production) to close this.
 */
export function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    return request.headers.get("authorization") === `Bearer ${secret}`;
  }
  return (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/");
}
