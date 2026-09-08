import type { Metadata } from "next";
import Script from "next/script";
import { ChatbaseWidget } from "./components/ChatbaseWidget";
import { MetaPixel } from "./components/MetaPixel";
import "./globals.css";

const chatbaseEmbedScript = `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="lui2mOdc0S4TJNx3RrGqi";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`;

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
        <script dangerouslySetInnerHTML={{ __html: chatbaseEmbedScript }} />
      </body>
    </html>
  );
}
