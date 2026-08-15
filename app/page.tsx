import type { Metadata } from "next";
import { LandingPage } from "./components/LandingPage";

export const metadata: Metadata = {
  title: "AI Co-Pilot Diploma",
  description:
    "A hands-on AI diploma for professionals and managers who want to automate work, improve decisions, and lead smarter.",
};

export default function Home() {
  return <LandingPage />;
}
