import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { DiplomaId } from "../content";

export const DIPLOMA_SESSION_COOKIE = "meska_diploma_session_v1";
export const DIPLOMA_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;
export const CHATBASE_IDENTITY_MAX_AGE_SECONDS = 60 * 60;

const REQUEST_ID_PATTERN = /^lead-[A-Za-z0-9][A-Za-z0-9-]{7,94}$/;
const CLOCK_SKEW_SECONDS = 5 * 60;

export type VerifiedDiplomaSession = {
  version: 1;
  requestId: string;
  firstName?: string;
  diplomaSlug: DiplomaId;
  issuedAt: number;
  expiresAt: number;
  sessionId: string;
};

type StoredDiplomaSession = {
  v: 1;
  rid: string;
  fn?: string;
  diploma: DiplomaId;
  iat: number;
  exp: number;
  sid: string;
};

function cleanFirstName(value: unknown) {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .split(/\s+/u)[0]
    ?.slice(0, 60);
  return cleaned || undefined;
}

function requireSecret(secret: string | undefined, minimumLength: number) {
  if (!secret || secret.length < minimumLength) {
    throw new Error("bridge_secret_unavailable");
  }
  return secret;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function isValidDiplomaRequestId(value: unknown): value is string {
  return typeof value === "string" && REQUEST_ID_PATTERN.test(value);
}

export function createDiplomaSessionToken(
  input: {
    requestId: string;
    firstName?: string;
    diplomaSlug: DiplomaId;
  },
  secret: string,
  now = Date.now(),
) {
  requireSecret(secret, 32);
  if (!isValidDiplomaRequestId(input.requestId)) {
    throw new Error("invalid_diploma_request_id");
  }
  if (input.diplomaSlug !== "offline" && input.diplomaSlug !== "online") {
    throw new Error("invalid_diploma_slug");
  }

  const issuedAt = Math.floor(now / 1000);
  const payload: StoredDiplomaSession = {
    v: 1,
    rid: input.requestId,
    fn: cleanFirstName(input.firstName),
    diploma: input.diplomaSlug,
    iat: issuedAt,
    exp: issuedAt + DIPLOMA_SESSION_MAX_AGE_SECONDS,
    sid: randomUUID(),
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyDiplomaSessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): VerifiedDiplomaSession | null {
  try {
    requireSecret(secret, 32);
    if (!token || token.length > 1024) return null;
    const segments = token.split(".");
    if (segments.length !== 2) return null;
    const [encodedPayload, suppliedSignature] = segments;
    if (!encodedPayload || !suppliedSignature) return null;
    if (!safeEqual(suppliedSignature, sign(encodedPayload, secret))) return null;

    const decoded = Buffer.from(encodedPayload, "base64url").toString("utf8");
    if (encode(decoded) !== encodedPayload) return null;
    const parsed = JSON.parse(decoded) as Partial<StoredDiplomaSession>;
    const nowSeconds = Math.floor(now / 1000);
    const validTimes =
      Number.isInteger(parsed.iat) &&
      Number.isInteger(parsed.exp) &&
      (parsed.iat as number) <= nowSeconds + CLOCK_SKEW_SECONDS &&
      (parsed.exp as number) > nowSeconds &&
      (parsed.exp as number) - (parsed.iat as number) ===
        DIPLOMA_SESSION_MAX_AGE_SECONDS;
    if (
      parsed.v !== 1 ||
      !isValidDiplomaRequestId(parsed.rid) ||
      (parsed.diploma !== "offline" && parsed.diploma !== "online") ||
      typeof parsed.sid !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(parsed.sid) ||
      !validTimes
    ) {
      return null;
    }

    return {
      version: 1,
      requestId: parsed.rid,
      firstName: cleanFirstName(parsed.fn),
      diplomaSlug: parsed.diploma,
      issuedAt: parsed.iat as number,
      expiresAt: parsed.exp as number,
      sessionId: parsed.sid,
    };
  } catch {
    return null;
  }
}

export function createChatbaseVerificationToken(
  session: VerifiedDiplomaSession,
  secret: string,
  now = Date.now(),
) {
  requireSecret(secret, 16);
  if (!isValidDiplomaRequestId(session.requestId)) {
    throw new Error("invalid_diploma_request_id");
  }
  const issuedAt = Math.floor(now / 1000);
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encode(
    JSON.stringify({
      user_id: session.requestId,
      iat: issuedAt,
      exp: Math.min(
        issuedAt + CHATBASE_IDENTITY_MAX_AGE_SECONDS,
        session.expiresAt,
      ),
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  return `${unsignedToken}.${sign(unsignedToken, secret)}`;
}

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    const value = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function resolveDiplomaSessionFromRequest(
  request: Request,
  secret = process.env.MESKA_CHATBASE_SESSION_SECRET,
  now = Date.now(),
) {
  if (!secret) return null;
  const token = readCookie(
    request.headers.get("cookie"),
    DIPLOMA_SESSION_COOKIE,
  );
  return verifyDiplomaSessionToken(token, secret, now);
}
