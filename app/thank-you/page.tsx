import type { Metadata } from "next";
import { ThankYouPage } from "../components/ThankYouPage";

export const metadata: Metadata = {
  title: "Free AI Agent Guide",
  description:
    "Your details are with the Meska AI team. Explore the diploma experience and choose the learning format that fits you.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYou() {
  return <ThankYouPage />;
}
