import type { Metadata } from "next";
import { ThankYouPage } from "../components/ThankYouPage";
import { clampSeats } from "../lib/teamPricing";

export const metadata: Metadata = {
  title: "Microsoft Copilot Course Enrollment",
  description:
    "Your details are with the Meska AI team. Explore the diploma experience and choose the learning format that fits you.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ThankYou({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const rawSeats = Array.isArray(query.seats) ? query.seats[0] : query.seats;
  const rawLead = Array.isArray(query.lead) ? query.lead[0] : query.lead;
  return <ThankYouPage initialSeats={clampSeats(rawSeats)} leadId={rawLead} />;
}
