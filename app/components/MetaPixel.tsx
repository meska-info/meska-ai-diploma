"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  initializeMetaPixel,
  isProductionTrackingHost,
  trackMetaPageView,
} from "../lib/tracking";

if (typeof window !== "undefined") initializeMetaPixel();

export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    // Meta's script loads only on the live hostname; Vercel previews and local
    // builds never download it (the in-page event log still works there).
    if (!isProductionTrackingHost()) return;
    initializeMetaPixel();
    if (!document.getElementById("meska-meta-pixel")) {
      const script = document.createElement("script");
      script.id = "meska-meta-pixel";
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }
    trackMetaPageView(pathname);
  }, [pathname]);

  return null;
}
