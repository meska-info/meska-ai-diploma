import type { EnrollmentType } from "./leadValidation";

export const COPILOT_ENROLLMENT_SESSION_KEY = "copilot_enrollment";

export type CopilotEnrollmentSession = {
  leadId: string;
  requestId: string;
  editToken: string;
  enrollmentType: EnrollmentType;
  seats: number;
  firstName: string;
  companyName: string;
  email: string;
  paymentPreference: "full" | "installments" | "enterprise";
  joiningReadiness: "upcoming" | "later" | "discuss_upcoming";
  copilotLicence: "yes" | "no" | "unsure" | "all" | "some" | "none";
  submitterIsParticipant: boolean;
  fullName: string;
};

export function writeEnrollmentSession(session: CopilotEnrollmentSession) {
  try {
    window.sessionStorage.setItem(COPILOT_ENROLLMENT_SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function readEnrollmentSession() {
  try {
    const value = window.sessionStorage.getItem(COPILOT_ENROLLMENT_SESSION_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<CopilotEnrollmentSession>;
    if (
      typeof parsed.leadId !== "string" ||
      typeof parsed.editToken !== "string" ||
      (parsed.enrollmentType !== "individual" && parsed.enrollmentType !== "team")
    ) {
      return null;
    }
    return parsed as CopilotEnrollmentSession;
  } catch {
    return null;
  }
}

export function updateEnrollmentSession(
  changes: Partial<CopilotEnrollmentSession>,
) {
  const current = readEnrollmentSession();
  if (!current) return null;
  const next = { ...current, ...changes };
  writeEnrollmentSession(next);
  return next;
}

export function clearEnrollmentSession() {
  try {
    window.sessionStorage.removeItem(COPILOT_ENROLLMENT_SESSION_KEY);
  } catch {
    // Storage may be disabled in private contexts.
  }
}
