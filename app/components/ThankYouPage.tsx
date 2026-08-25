"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "../lib/tracking";

import {
  CheckoutSection,
  FAQSection,
  FreeGuideSection,
  GraduationStory,
  InstructorSection,
  SiteFooter,
  SiteHeader,
  SkillsBusinessValueSection,
  SnippetsCarousel,
  SyllabusSection,
  ThankYouLeadTracker,
  VideoTestimonialsSection,
} from "./sections";

function FloatingCheckoutCTA() {
  const [headerCtaVisible, setHeaderCtaVisible] = useState(true);
  const [checkoutCardVisible, setCheckoutCardVisible] = useState(false);

  useEffect(() => {
    const headerCta = document.querySelector<HTMLElement>(
      '[data-track-id="header_choose_diploma"]',
    );
    const checkoutCard = document.querySelector<HTMLElement>(
      "#checkout .checkout-card",
    );
    if (!headerCta || !checkoutCard) return;

    const observeVisibility = (
      node: HTMLElement,
      update: (visible: boolean) => void,
    ) => {
      const observer = new IntersectionObserver(
        ([entry]) => update(entry.isIntersecting && entry.intersectionRatio >= 0.15),
        { threshold: [0, 0.15, 0.5] },
      );
      observer.observe(node);
      return observer;
    };

    const headerObserver = observeVisibility(headerCta, setHeaderCtaVisible);
    const checkoutObserver = observeVisibility(checkoutCard, setCheckoutCardVisible);
    return () => {
      headerObserver.disconnect();
      checkoutObserver.disconnect();
    };
  }, []);

  if (headerCtaVisible || checkoutCardVisible) return null;

  return (
    <div className="floating-checkout-cta">
      <button
        aria-controls="checkout"
        className="button"
        data-track-id="floating_choose_diploma"
        onClick={() => {
          trackEvent("PricingView", {
            tracking_id: "floating_choose_diploma",
            cta_location: "floating",
          });
          document.getElementById("checkout")?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
            block: "start",
          });
        }}
        type="button"
      >
        Choose Diploma <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}

export function ThankYouPage() {
  return (
    <main id="top" className="thank-you-page">
      <ThankYouLeadTracker />
      <SiteHeader ctaHref="#checkout" ctaLabel="Choose Diploma" />

      <FreeGuideSection />
      <GraduationStory />
      <SyllabusSection description="Each session supports the next stage of an eight-week journey from practical AI foundations to a working, real-world build." />
      <CheckoutSection />
      <SnippetsCarousel />
      <SkillsBusinessValueSection />
      <InstructorSection />
      <VideoTestimonialsSection context="thank_you" />
      <FAQSection />
      <SiteFooter light />
      <FloatingCheckoutCTA />
    </main>
  );
}
