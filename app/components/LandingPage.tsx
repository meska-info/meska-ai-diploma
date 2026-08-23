"use client";

import { useEffect, useState } from "react";
import { DiplomaId, siteContent } from "../content";
import { captureAttribution, trackEvent } from "../lib/tracking";
import {
  DiplomaVideo,
  LeadCapture,
  OrganizationLogoRail,
  OutcomesSection,
  SiteFooter,
  SiteHeader,
  StatsStrip,
  StickyMobileCTA,
  SyllabusSection,
  TestimonialCarousel,
} from "./sections";

export function LandingPage() {
  const [selectedId, setSelectedId] = useState<DiplomaId>("offline");
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    captureAttribution();
    trackEvent(
      "ViewContent",
      {
        tracking_id: siteContent.trackingNames.landingView,
        content_name: siteContent.brand.diplomaName,
        content_category: "professional_diploma",
      },
      { onceKey: siteContent.trackingNames.landingView },
    );
  }, []);

  useEffect(() => {
    const querySelection = new URLSearchParams(window.location.search).get(
      "diploma",
    );
    if (querySelection === "online" || querySelection === "offline") {
      const frame = window.requestAnimationFrame(() =>
        setSelectedId(querySelection),
      );
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    let heroVisible = true;
    const syncSticky = () => setShowSticky(!heroVisible);
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        syncSticky();
      },
      { threshold: 0.05 },
    );
    heroObserver.observe(hero);
    return () => {
      heroObserver.disconnect();
    };
  }, []);

  function returnToLeadForm() {
    const form = document.getElementById(
      siteContent.trackingNames.primaryForm,
    );
    const firstControl = document.getElementById(
      `${siteContent.trackingNames.primaryForm}-fullName`,
    );
    if (!form || !(firstControl instanceof HTMLElement)) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    form.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(
      () => firstControl.focus({ preventScroll: true }),
      reducedMotion ? 0 : 420,
    );
  }

  return (
    <main id="top">
      <SiteHeader />

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span aria-hidden="true" /> {siteContent.hero.eyebrow}
          </p>
          <h1>{siteContent.hero.title}</h1>
          <p className="hero-subtitle">{siteContent.hero.subtitle}</p>
        </div>

        <div className="primary-conversion" id="apply">
          <LeadCapture
            location="primary"
            onSelectedIdChange={setSelectedId}
            selectedId={selectedId}
            media={
              <div className="primary-media" aria-labelledby="main-video-heading">
                <div className="media-intro">
                  <h2 id="main-video-heading">{siteContent.landingVideoHeading}</h2>
                </div>
                <DiplomaVideo />
              </div>
            }
          />
        </div>
      </section>

      <StatsStrip />
      <OutcomesSection />
      <OrganizationLogoRail />
      <SyllabusSection />
      <TestimonialCarousel />

      <SiteFooter />
      {showSticky ? <StickyMobileCTA onActivate={returnToLeadForm} /> : null}
    </main>
  );
}
