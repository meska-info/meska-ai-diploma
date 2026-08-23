import type { Metadata } from "next";
import { MetaPixel } from "./components/MetaPixel";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Co-Pilot Diploma | Meska AI",
    template: "%s | Meska AI",
  },
  description:
    "Solve real business challenges alongside managers, CEOs, founders, mentors, trainers, and subject-matter experts.",
  metadataBase: new URL("https://diploma.meska.ai"),
  openGraph: {
    type: "website",
    siteName: "Meska AI",
    url: "https://diploma.meska.ai",
    title: "AI Co-Pilot Diploma | Meska AI",
    description:
      "Learn AI and apply it to real business alongside experienced business professionals and AI practitioners.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
