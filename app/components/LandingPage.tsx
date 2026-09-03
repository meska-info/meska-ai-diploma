"use client";

import { useEffect, useState } from "react";
import { DiplomaId, siteContent } from "../content";
import { captureAttribution, trackEvent } from "../lib/tracking";
import {
  DiplomaVideo,
  LeadCapture,
  LeadModal,
  OrganizationLogoRail,
  OutcomesSection,
  SiteFooter,
  SiteHeader,
  SkillsBusinessValueSection,
  StatsStrip,
  StickyMobileCTA,
  SyllabusSection,
  TestimonialCarousel,
  VideoTestimonialsSection,
} from "./sections";

export function LandingPage() {
  const [selectedId, setSelectedId] = useState<DiplomaId>("offline");
  const [showSticky, setShowSticky] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

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

  return (
    <main id="top">
      <SiteHeader />

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span aria-hidden="true" /> {siteContent.hero.eyebrow}
          </p>
          <h1>
            {siteContent.hero.titleBeforeAccent}{" "}
            <span>{siteContent.hero.titleAccent}</span>{" "}
            {siteContent.hero.titleAfterAccent}
          </h1>
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
      <VideoTestimonialsSection />
      <SkillsBusinessValueSection />
      <TestimonialCarousel />

      <SiteFooter />
      {showSticky ? (
        <StickyMobileCTA onActivate={() => setShowLeadModal(true)} />
      ) : null}
      <LeadModal
        onClose={() => setShowLeadModal(false)}
        onSelectedIdChange={setSelectedId}
        open={showLeadModal}
        selectedId={selectedId}
      />
    </main>
  );
}
