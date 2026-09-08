import type { Metadata } from "next";
import Script from "next/script";
import { ChatbaseWidget } from "./components/ChatbaseWidget";
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
        <Script
          id="cloudflare-stream-player-sdk"
          src="https://embed.cloudflarestream.com/embed/sdk.latest.js"
          strategy="afterInteractive"
        />
        <MetaPixel />
        <ChatbaseWidget />
        {children}
      </body>
    </html>
  );
}
