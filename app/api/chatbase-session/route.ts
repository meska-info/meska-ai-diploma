import { NextResponse } from "next/server";
import {
  createChatbaseVerificationToken,
  resolveDiplomaSessionFromRequest,
} from "../../lib/diplomaSession";

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Vary: "Cookie",
};

export async function GET(request: Request) {
  const session = resolveDiplomaSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Verified Diploma session required" },
      { status: 401, headers: RESPONSE_HEADERS },
    );
  }

  const verificationSecret = process.env.CHATBASE_VERIFICATION_SECRET;
  if (!verificationSecret) {
    return NextResponse.json(
      { error: "Advisor identity unavailable" },
      { status: 503, headers: RESPONSE_HEADERS },
    );
  }

  try {
    const token = createChatbaseVerificationToken(
      session,
      verificationSecret,
    );
    return NextResponse.json(
      {
        token,
        firstName: session.firstName,
        diplomaSlug: session.diplomaSlug,
      },
      { headers: RESPONSE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { error: "Advisor identity unavailable" },
      { status: 503, headers: RESPONSE_HEADERS },
    );
  }
}
