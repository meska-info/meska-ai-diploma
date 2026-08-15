"use client";

import { useEffect, useState } from "react";
import { siteContent } from "../content";
import { captureAttribution, trackEvent } from "../lib/tracking";
import {
  ClientLogoGrid,
  CourseDetailsBar,
  LeadCapture,
  LeadModal,
  MidPageCTA,
  OutcomesSection,
  SiteFooter,
  SiteHeader,
  StatsStrip,
  StickyMobileCTA,
  SyllabusSection,
  TestimonialCarousel,
  VideoPlaceholder,
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
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  function scrollToApplication(trackingId: string, location: string) {
    trackEvent("CTAOpenForm", {
      tracking_id: trackingId,
      cta_location: location,
    });
    document.querySelector("#apply")?.scrollIntoView({ behavior: "smooth" });
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
          <p className="hero-accent">{siteContent.hero.accent}</p>
          <p className="hero-subtitle">{siteContent.hero.subtitle}</p>
          <div className="hero-actions">
            <button
              className="button"
              type="button"
              onClick={() =>
                scrollToApplication(siteContent.trackingNames.heroCta, "hero")
              }
              data-track-id={siteContent.trackingNames.heroCta}
            >
              {siteContent.hero.primaryCta} <span aria-hidden="true">↗</span>
            </button>
            <a className="text-link" href="#curriculum">
              Explore the curriculum <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-core">AI</div>
          <span className="orbit-label orbit-label-one">Automate</span>
          <span className="orbit-label orbit-label-two">Decide</span>
          <span className="orbit-label orbit-label-three">Build</span>
        </div>
      </section>

      <section className="main-media shell" aria-labelledby="main-video-heading">
        <div className="media-heading">
          <p id="main-video-heading">See the AI Co-Pilot Diploma in action</p>
          <span>01:30 · Video pending</span>
        </div>
        <VideoPlaceholder
          label="Main diploma video"
          trackingId="main_diploma_video"
        />
      </section>

      <CourseDetailsBar />

      <section className="section shell" id="apply">
        <LeadCapture location="primary" />
      </section>

      <StatsStrip />
      <OutcomesSection />
      <ClientLogoGrid />
      <MidPageCTA onOpen={() => setModalOpen(true)} />
      <SyllabusSection />
      <TestimonialCarousel />

      <section className="section final-application shell" id="final-application">
        <div className="final-application-heading">
          <p className="eyebrow">
            <span aria-hidden="true" /> Applications now open
          </p>
          <h2>Choose your format. Start with one clear step.</h2>
        </div>
        <LeadCapture location="final" />
      </section>

      <SiteFooter />
      {showSticky ? <StickyMobileCTA onOpen={() => setModalOpen(true)} /> : null}
      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
