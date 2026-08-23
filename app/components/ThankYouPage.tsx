"use client";

import {
  CheckoutSection,
  FAQSection,
  GraduationStory,
  InstructorSection,
  SiteFooter,
  SiteHeader,
  SkillsBusinessValueSection,
  SnippetsCarousel,
  ThankYouLeadTracker,
} from "./sections";

export function ThankYouPage() {
  return (
    <main id="top" className="thank-you-page">
      <ThankYouLeadTracker />
      <SiteHeader ctaHref="#checkout" ctaLabel="Choose Diploma" />

      <section className="thank-confirmation shell">
        <div className="thank-confirmation-copy">
          <p className="eyebrow">
            <span aria-hidden="true" /> Application received
          </p>
          <h1>Thank you — we’ve got your details.</h1>
          <p>A Meska advisor will contact you soon.</p>
        </div>
      </section>

      <GraduationStory />
      <CheckoutSection />
      <SnippetsCarousel />
      <SkillsBusinessValueSection />
      <InstructorSection />
      <FAQSection />
      <SiteFooter light />
    </main>
  );
}
