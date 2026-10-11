import type { Metadata } from "next";
import { LandingPage } from "./components/LandingPage";

export const metadata: Metadata = {
  title: "AI Co-Pilot Diploma",
  description:
    "Solve real business challenges alongside managers, CEOs, founders, mentors, trainers, and subject-matter experts.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <LandingPage />;
}
