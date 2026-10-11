"use client";

import type { EnrollmentType } from "../../lib/leadValidation";
import { formatEGP, totalFor } from "../../lib/teamPricing";
import { safeTrackEvent } from "../../lib/tracking";

export function EnrollmentTypeToggle({
  value,
  seats,
  location,
  onChange,
}: {
  value: EnrollmentType;
  seats: number;
  location: "primary" | "modal";
  onChange: (type: EnrollmentType) => void;
}) {
  function select(type: EnrollmentType) {
    if (type === value) return;
    onChange(type);
    safeTrackEvent("EnrollmentTypeSelected", {
      enrollment_type: type,
      seats: type === "team" ? Math.max(2, seats) : 1,
      form_location: location,
    });
  }

  return (
    <div className="enrollment-type-toggle" role="radiogroup" aria-label="Who's enrolling?">
      <button
        aria-checked={value === "individual"}
        onClick={() => select("individual")}
        role="radio"
        type="button"
      >
        <b>Just me</b>
        <span>EGP 30,000</span>
      </button>
      <button
        aria-checked={value === "team"}
        onClick={() => select("team")}
        role="radio"
        type="button"
      >
        <b>My team</b>
        <span>{value === "team" ? `${seats} seats · ${formatEGP(totalFor(seats))}` : "From EGP 24,000 / seat"}</span>
      </button>
    </div>
  );
}
