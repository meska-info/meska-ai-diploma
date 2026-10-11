"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearEnrollmentSession,
  type CopilotEnrollmentSession,
  readEnrollmentSession,
  updateEnrollmentSession,
} from "../../lib/enrollmentSession";
import { EnrollmentRequestError, patchEnrollment } from "../../lib/enrollmentApi";
import { validateCompanyName } from "../../lib/leadValidation";
import {
  BASE_PRICE,
  formatEGP,
  nextTier,
  pricePerSeat,
  savingsFor,
  tierFor,
  totalFor,
} from "../../lib/teamPricing";
import { safeTrackEvent } from "../../lib/tracking";
import { useEnrollment } from "./EnrollmentProvider";
import { ParticipantRoster } from "./ParticipantRoster";
import { PaymentPathPicker } from "./PaymentPathPicker";
import { SeatStepper } from "./SeatStepper";

export function EnrollmentPanel({ leadId }: { leadId?: string }) {
  const { seats, enrollmentType, setSeats } = useEnrollment();
  const [session, setSession] = useState<CopilotEnrollmentSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [companyNeeded, setCompanyNeeded] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [summaryVisible, setSummaryVisible] = useState(true);
  const summaryRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);
  const trackingTimer = useRef<number | null>(null);
  const previousTier = useRef(tierFor(seats).key);

  const personal = Boolean(session && leadId && session.leadId === leadId);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readEnrollmentSession();
      if (stored && leadId && stored.leadId === leadId) {
        setSession(stored);
        setCompanyName(stored.companyName);
      }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [leadId]);

  useEffect(() => {
    if (!hydrated) return;
    safeTrackEvent("EnrollmentPageView", {
      mode: personal ? "personal" : "generic",
      seats,
      value: totalFor(seats),
      enrollment_type: seats > 1 ? "team" : "individual",
      joining_readiness: personal ? session?.joiningReadiness : undefined,
    });
  // Once per page load; personal changes after hydration are intentionally included.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    const node = summaryRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSummaryVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function expireSession() {
    clearEnrollmentSession();
    setSession(null);
    setSaveStatus("");
  }

  function scheduleSave(nextSeats: number, nextCompany?: string) {
    if (!personal || !session) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setSaveStatus("Saving…");
    saveTimer.current = window.setTimeout(async () => {
      try {
        const result = await patchEnrollment(session.leadId, {
          editToken: session.editToken,
          seats: nextSeats,
          companyName: nextCompany ?? session.companyName,
        }, { retries: 3 });
        const updated = updateEnrollmentSession({
          seats: result.seats,
          enrollmentType: result.enrollmentType,
          companyName: nextCompany ?? session.companyName,
        });
        if (updated) setSession(updated);
        setSaveStatus("Saved");
      } catch (error) {
        if (error instanceof EnrollmentRequestError && error.status === 401) {
          expireSession();
        } else {
          setSaveStatus("Couldn't save. Retrying…");
        }
      }
    }, 600);
  }

  function changeSeats(next: number) {
    if (personal && enrollmentType === "team" && seats === 2 && next === 1) {
      const confirmed = window.confirm(
        "Switch to an individual enrollment? Team pricing no longer applies.",
      );
      if (!confirmed) return;
    }
    if (personal && seats === 1 && next > 1 && !session?.companyName) {
      setCompanyNeeded(true);
    }
    setSeats(next);
    if (!(seats === 1 && next > 1 && !session?.companyName)) scheduleSave(next);
    if (trackingTimer.current) window.clearTimeout(trackingTimer.current);
    trackingTimer.current = window.setTimeout(() => {
      safeTrackEvent(
        "SeatCalculatorChange",
        { seats: next, tier: tierFor(next).key, value: totalFor(next), location: "enroll" },
        { onceKey: `seats-enroll-${next}` },
      );
    }, 800);
    const tier = tierFor(next).key;
    if (tier !== "individual" && tier !== previousTier.current) {
      safeTrackEvent("TierUnlocked", { tier, seats: next, location: "enroll" }, { onceKey: `tier-${tier}` });
    }
    previousTier.current = tier;
  }

  function saveCompany() {
    const trimmed = companyName.trim().replace(/\s+/g, " ");
    const error = validateCompanyName(trimmed);
    if (error) {
      setCompanyError(error);
      return;
    }
    setCompanyNeeded(false);
    setCompanyError("");
    scheduleSave(seats, trimmed);
  }

  async function switchCohort() {
    if (!session) return;
    try {
      await patchEnrollment(session.leadId, {
        editToken: session.editToken,
        joiningReadiness: "upcoming",
      }, { retries: 3 });
      const updated = updateEnrollmentSession({ joiningReadiness: "upcoming" });
      if (updated) setSession(updated);
      safeTrackEvent("CohortSwitched", {
        seats,
        enrollment_type: enrollmentType,
      }, { onceKey: `cohort-${session.leadId}` });
    } catch (error) {
      if (error instanceof EnrollmentRequestError && error.status === 401) expireSession();
      else setSaveStatus("Couldn't save. Retrying…");
    }
  }

  const team = seats > 1;
  const later = personal && session?.joiningReadiness === "later";
  const noLicence = personal && ["no", "none"].includes(session?.copilotLicence ?? "");
  const next = nextTier(seats);
  const hint = seats === 1 ? "1 more seat unlocks 20% team pricing."
    : next ? `${next.seatsNeeded} more seat${next.seatsNeeded === 1 ? "" : "s"} unlocks 25% off every seat.`
      : seats >= 20 ? "Larger group? Talk to an advisor for a custom quote." : "Best rate unlocked: 25% off every seat.";

  return (
    <section className="enrollment-panel shell" id="enrollment" aria-labelledby="enrollment-title">
      <div className="enrollment-panel-grid">
        <div className="enrollment-summary-column">
          <header className="enrollment-panel-heading">
            <p className="eyebrow"><span aria-hidden="true" /> Your enrollment · Cohort 01 starts Wed 4 Nov</p>
            <h1 id="enrollment-title">
              {personal && session
                ? team
                  ? `${session.firstName}, here's the plan for ${session.companyName || "your"} team of ${seats}`
                  : `${session.firstName}, your seat is ready`
                : "Your enrollment"}
            </h1>
            <p>
              {team
                ? "You can change the number of seats. The total below is exactly what you'll pay at checkout."
                : "Coming with colleagues? Add seats and the team rate applies automatically."}
            </p>
          </header>

          <div className="enrollment-callouts">
            {later ? (
              <div className="enrollment-callout is-info">
                <p>You chose the next cohort. We’ve saved your details and an advisor will contact you when dates are confirmed. Want to join Cohort 01 instead?</p>
                <button className="button button-secondary" onClick={switchCohort} type="button">Switch to Cohort 01</button>
              </div>
            ) : null}
            {noLicence ? (
              <div className="enrollment-callout is-warning">
                <b>Copilot licence needed.</b> The course builds run inside Microsoft 365 Copilot, so a licence is needed by the first session (Mon 9 Nov). An advisor will contact you to help. You can still reserve now.
              </div>
            ) : null}
            {personal && session?.copilotLicence === "some" ? (
              <div className="enrollment-callout is-info">Participants without a licence will need one by Mon 9 Nov. An advisor will help you plan this.</div>
            ) : null}
            {personal && session?.copilotLicence === "unsure" ? (
              <div className="enrollment-callout is-info">Not sure about licences? An advisor will check with you before the cohort starts.</div>
            ) : null}
          </div>

          <div className="enrollment-seat-editor">
            <SeatStepper onChange={changeSeats} seats={seats} />
            <div><b>{seats} seat{seats === 1 ? "" : "s"}</b><span>{hint}</span></div>
          </div>
          {companyNeeded ? (
            <div className="inline-company-field">
              <label htmlFor="enrollment-company">Company name</label>
              <div>
                <input id="enrollment-company" onChange={(event) => setCompanyName(event.target.value)} value={companyName} />
                <button className="button button-secondary" onClick={saveCompany} type="button">Save team</button>
              </div>
              {companyError ? <p className="error-message">{companyError}</p> : null}
            </div>
          ) : null}
          <p className="save-status" aria-live="polite">{saveStatus}</p>

          <div className="enrollment-order-summary" ref={summaryRef}>
            <h2>Order summary</h2>
            {team ? (
              <>
                <div><span>{seats} × {formatEGP(BASE_PRICE)}</span><s>{formatEGP(BASE_PRICE * seats)}</s></div>
                <div className="discount-row"><span>Team pricing · {Math.round(tierFor(seats).rate * 100)}% off every seat</span><b>−{formatEGP(savingsFor(seats))}</b></div>
                <div><span>Per seat</span><span>{formatEGP(pricePerSeat(seats))}</span></div>
              </>
            ) : (
              <div><span>1 × Microsoft Copilot Course</span><span>{formatEGP(BASE_PRICE)}</span></div>
            )}
            <div className="order-total"><b>Total</b><strong>{formatEGP(totalFor(seats))}</strong></div>
          </div>

          {personal && session && team ? (
            <ParticipantRoster onSessionExpired={expireSession} seats={seats} session={session} />
          ) : null}
        </div>

        <div className="enrollment-payment-column">
          {later ? (
            <div className="payment-path-panel enrollment-advisor-only">
              <h2>Next step</h2>
              <p>An advisor will contact you about the next cohort. No payment is needed now.</p>
              <a className="button button-submit" href="#meska-diploma-advisor">Talk to an advisor</a>
            </div>
          ) : (
            <PaymentPathPicker
              key={personal ? "personal" : "generic"}
              licenceRequired={Boolean(noLicence)}
              onSessionExpired={expireSession}
              personal={personal}
              seats={seats}
              session={session}
              showSticky={!summaryVisible}
            />
          )}
        </div>
      </div>
    </section>
  );
}
