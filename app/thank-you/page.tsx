import type { Metadata } from "next";
import { ThankYouPage } from "../components/ThankYouPage";

export const metadata: Metadata = {
  title: "Your AI Co-Pilot Diploma Options",
  description:
    "Compare the Meska AI online and offline diploma options and continue to the appropriate checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYou() {
  return <ThankYouPage />;
}
