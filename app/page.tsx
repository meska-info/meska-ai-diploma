import type { Metadata } from "next";
import { LandingPage } from "./components/LandingPage";

export const metadata: Metadata = {
  title: "AI Co-Pilot Diploma",
  description:
    "Solve real business challenges alongside managers, CEOs, founders, mentors, trainers, and subject-matter experts.",
  alternates: { canonical: "/" },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawSeats = Array.isArray(params.seats) ? params.seats[0] : params.seats;
  const seats = Number.parseInt(rawSeats ?? "1", 10);
  return <LandingPage initialSeats={Number.isFinite(seats) ? seats : 1} />;
}
