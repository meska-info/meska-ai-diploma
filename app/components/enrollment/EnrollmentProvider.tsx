"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { EnrollmentType } from "../../lib/leadValidation";
import { clampSeats } from "../../lib/teamPricing";

type EnrollmentContextValue = {
  seats: number;
  enrollmentType: EnrollmentType;
  setSeats: (value: number) => void;
  setEnrollmentType: (value: EnrollmentType) => void;
};

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null);

export function EnrollmentProvider({
  children,
  initialSeats = 1,
}: {
  children: ReactNode;
  initialSeats?: number;
}) {
  const startingSeats = clampSeats(initialSeats);
  const [seats, setSeatState] = useState(startingSeats);
  const [enrollmentType, setTypeState] = useState<EnrollmentType>(
    startingSeats > 1 ? "team" : "individual",
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("seats", String(seats));
    window.history.replaceState(window.history.state, "", url);
  }, [seats]);

  const setSeats = useCallback((value: number) => {
    const next = clampSeats(value);
    setSeatState(next);
    setTypeState(next > 1 ? "team" : "individual");
  }, []);

  const setEnrollmentType = useCallback((value: EnrollmentType) => {
    setTypeState(value);
    setSeatState((current) => value === "team" ? Math.max(2, current) : 1);
  }, []);

  const context = useMemo(() => ({
    seats,
    enrollmentType,
    setSeats,
    setEnrollmentType,
  }), [enrollmentType, seats, setEnrollmentType, setSeats]);

  return <EnrollmentContext.Provider value={context}>{children}</EnrollmentContext.Provider>;
}

export function useEnrollment() {
  const value = useContext(EnrollmentContext);
  if (!value) throw new Error("useEnrollment must be used inside EnrollmentProvider");
  return value;
}
