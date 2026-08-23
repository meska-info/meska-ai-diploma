"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  initializeMetaPixel,
  META_PIXEL_ID,
  trackMetaPageView,
} from "../lib/tracking";

if (typeof window !== "undefined") initializeMetaPixel();

export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    initializeMetaPixel();
    trackMetaPageView(pathname);
  }, [pathname]);

  return (
    <>
      <Script
        id="meska-meta-pixel"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="1"
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          style={{ display: "none" }}
          width="1"
        />
      </noscript>
    </>
  );
}
