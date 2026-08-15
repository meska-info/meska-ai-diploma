"use client";

import { useEffect, useState } from "react";
import { siteContent } from "../content";
import { captureAttribution, trackEvent } from "../lib/tracking";
import {
  DiplomaVideo,
  LeadCapture,
  LeadModal,
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
  const [modalOpen, setModalOpen] = useState(false);
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
    const hero = document.querySelector(".hero");
    const footer = document.querySelector(".site-footer");
    if (!hero || !footer) return;

    let heroVisible = true;
    let footerVisible = false;
    const syncSticky = () => setShowSticky(!heroVisible && !footerVisible);
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        syncSticky();
      },
      { threshold: 0.05 },
    );
    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        footerVisible = entry.isIntersecting;
        syncSticky();
      },
      { threshold: 0.01 },
    );
    heroObserver.observe(hero);
    footerObserver.observe(footer);
    return () => {
      heroObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  return (
    <main id="top">
      <SiteHeader />

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span aria-hidden="true" /> {siteContent.hero.eyebrow}
          </p>
          <h1>{siteContent.hero.title}</h1>
          <p className="hero-accent">{siteContent.hero.accent}</p>
          <p className="hero-subtitle">{siteContent.hero.subtitle}</p>
        </div>

        <div className="primary-conversion" id="apply">
          <LeadCapture
            location="primary"
            media={
              <div className="primary-media" aria-labelledby="main-video-heading">
                <div className="media-heading">
                  <p id="main-video-heading">See the diploma in action</p>
                  <span>{siteContent.media.mainVideo.durationLabel}</span>
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
      {showSticky ? <StickyMobileCTA onOpen={() => setModalOpen(true)} /> : null}
      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
