import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Co-Pilot Diploma | Meska AI",
    template: "%s | Meska AI",
  },
  description:
    "A hands-on AI diploma for professionals and managers who want to automate work, improve decisions, and lead smarter.",
  metadataBase: new URL("https://meska.ai"),
  openGraph: {
    type: "website",
    siteName: "Meska AI",
    title: "AI Co-Pilot Diploma | Meska AI",
    description:
      "Learn AI for business through hands-on sessions, practical workflows, and a graduation project.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
