"use client";

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
    </main>
  );
}
