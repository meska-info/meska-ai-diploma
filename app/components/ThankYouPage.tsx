"use client";

import { DiplomaAdvisor } from "./DiplomaAdvisor";
import { EnrollmentPanel } from "./enrollment/EnrollmentPanel";
import { EnrollmentProvider } from "./enrollment/EnrollmentProvider";
import {
  FAQSection,
  FreeGuideSection,
  GraduationStory,
  InstructorSection,
  SiteFooter,
  SiteHeader,
  SnippetsCarousel,
  SyllabusSection,
  ThankYouLeadTracker,
  VideoTestimonialsSection,
} from "./sections";

export function ThankYouPage({
  initialSeats = 1,
  leadId,
}: {
  initialSeats?: number;
  leadId?: string;
}) {
  return (
    <EnrollmentProvider initialSeats={initialSeats}>
      <main id="top" className="thank-you-page">
        <ThankYouLeadTracker />
        <SiteHeader ctaHref="#enrollment" ctaLabel="Enroll in the Course" />
        <EnrollmentPanel leadId={leadId} />
        <section className="thank-advisor-section shell" id="meska-diploma-advisor">
          <DiplomaAdvisor />
        </section>
        <FreeGuideSection />
        <SyllabusSection description="Each session supports the next stage of an eight-week journey from practical AI foundations to a working, real-world build." />
        <GraduationStory />
        <SnippetsCarousel />
        <InstructorSection />
        <VideoTestimonialsSection context="thank_you" />
        <FAQSection />
        <SiteFooter light />
      </main>
    </EnrollmentProvider>
  );
}
