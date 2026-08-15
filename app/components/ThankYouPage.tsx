"use client";

import {
  CheckoutSection,
  FAQSection,
  InstructorSection,
  SiteFooter,
  SiteHeader,
  SnippetsCarousel,
  ThankYouLeadTracker,
  VideoPlaceholder,
} from "./sections";

export function ThankYouPage() {
  return (
    <main id="top" className="thank-you-page">
      <ThankYouLeadTracker />
      <SiteHeader ctaHref="#checkout" ctaLabel="Choose Diploma" />

      <section className="thank-hero shell">
        <div className="thank-hero-copy">
          <p className="eyebrow">
            <span aria-hidden="true" /> What they said about the diploma
          </p>
          <h1>See the experience through the people who lived it.</h1>
          <p>
            This space is reserved for an approved participant story and its
            final video. No testimonial language has been invented for this
            prototype.
          </p>
        </div>
        <VideoPlaceholder
          label="Participant testimonial video"
          trackingId="thank_you_testimonial_video"
        />
      </section>

      <CheckoutSection />
      <SnippetsCarousel />
      <InstructorSection />
      <FAQSection />
      <SiteFooter light />
    </main>
  );
}
