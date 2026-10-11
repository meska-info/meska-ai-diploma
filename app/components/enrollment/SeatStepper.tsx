"use client";

export function SeatStepper({
  seats,
  onChange,
  minimum = 1,
  id,
}: {
  seats: number;
  onChange: (seats: number) => void;
  minimum?: number;
  id?: string;
}) {
  return (
    <div className="seat-stepper" data-testid={id}>
      <button
        aria-label="Remove a seat"
        disabled={seats <= minimum}
        onClick={() => onChange(seats - 1)}
        type="button"
      >
        −
      </button>
      <output aria-live="polite">{seats}</output>
      <button
        aria-label="Add a seat"
        disabled={seats >= 20}
        onClick={() => onChange(seats + 1)}
        type="button"
      >
        +
      </button>
    </div>
  );
}
