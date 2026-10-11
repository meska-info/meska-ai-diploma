"use client";

import { useEffect, useRef } from "react";
import { safeTrackEvent } from "../../lib/tracking";
import {
  formatEGP,
  nextTier,
  pricePerSeat,
  savingsFor,
  tierFor,
  totalFor,
} from "../../lib/teamPricing";
import { useEnrollment } from "./EnrollmentProvider";
import { SeatStepper } from "./SeatStepper";

export function SeatCalculator({
  location,
  onEnroll,
}: {
  location: "price" | "closing" | "modal";
  onEnroll?: () => void;
}) {
  const { seats, setSeats } = useEnrollment();
  const previousTier = useRef(tierFor(seats).key);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      safeTrackEvent(
        "SeatCalculatorChange",
        { seats, tier: tierFor(seats).key, value: totalFor(seats), location },
        { onceKey: `seats-${location}-${seats}` },
      );
    }, 800);
    return () => window.clearTimeout(timer);
  }, [location, seats]);

  useEffect(() => {
    const tier = tierFor(seats).key;
    if (tier !== "individual" && tier !== previousTier.current) {
      safeTrackEvent(
        "TierUnlocked",
        { tier, seats, location },
        { onceKey: `tier-${tier}` },
      );
    }
    previousTier.current = tier;
  }, [location, seats]);

  const next = nextTier(seats);
  const nudge = seats === 1
    ? "Bringing a colleague? 2 seats drop to EGP 24,000 each."
    : next
      ? `Add ${next.seatsNeeded} more seat${next.seatsNeeded === 1 ? "" : "s"} and every seat drops to EGP 22,500 (saves another ${formatEGP(next.extraSavingOnCurrentSeats)} on your current seats).`
      : seats >= 20
        ? "Larger group? Talk to an advisor for a custom quote."
        : "Best rate unlocked: 25% off every seat.";

  function enroll() {
    if (onEnroll) onEnroll();
    else {
      document.querySelector<HTMLElement>("#apply")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
      window.setTimeout(() => {
        const form = document.querySelector<HTMLFormElement>("#apply form");
        form?.querySelector<HTMLElement>("input:not([type=hidden]), select")?.focus();
      }, 0);
    }
  }

  return (
    <div className="seat-calculator" data-location={location}>
      <p className="eyebrow"><span aria-hidden="true" /> Cohort 01 · Price your enrollment</p>
      <div className="seat-calculator-total">
        <div>
          <strong>{formatEGP(totalFor(seats))}</strong>
          <span>
            {seats === 1
              ? "1 seat · individual price"
              : `${seats} seats × ${formatEGP(pricePerSeat(seats))} · you save ${formatEGP(savingsFor(seats))}`}
          </span>
        </div>
        <SeatStepper seats={seats} onChange={setSeats} />
      </div>
      <p className="sr-only" aria-live="polite">{seats} seats, total {formatEGP(totalFor(seats))}</p>
      <input
        aria-label="Number of seats"
        className="seat-range"
        max="20"
        min="1"
        onChange={(event) => setSeats(Number(event.target.value))}
        type="range"
        value={seats}
      />
      <div className="pricing-tier-chips" aria-label="Seat pricing tiers">
        {[
          ["individual", "1 seat", "EGP 30,000"],
          ["team20", "2–4 seats", "EGP 24,000 / seat"],
          ["team25", "5+ seats", "EGP 22,500 / seat"],
        ].map(([key, label, price]) => (
          <span className={tierFor(seats).key === key ? "is-active" : ""} key={key}>
            <b>{label}</b>{price}
          </span>
        ))}
      </div>
      <p className="seat-nudge">{nudge}</p>
      {seats >= 20 ? (
        <button
          className="button button-secondary seat-calculator-cta"
          onClick={() => window.dispatchEvent(new CustomEvent("meska:open-enrollment-modal"))}
          type="button"
        >
          Talk to an advisor ↗
        </button>
      ) : (
        <button
          className="button seat-calculator-cta"
          data-track-id="copilot_seat_calculator_cta"
          onClick={enroll}
          type="button"
        >
          {seats === 1 ? "Enroll ↘" : `Enroll my team of ${seats} ↘`}
        </button>
      )}
    </div>
  );
}
