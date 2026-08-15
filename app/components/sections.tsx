"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { diplomaList, DiplomaId, siteContent } from "../content";
import {
  captureAttribution,
  createEventId,
  trackEvent,
} from "../lib/tracking";

export function BrandMark() {
  return (
    <Link className="brand-mark" href="/" aria-label="Meska AI home">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>Meska AI</span>
    </Link>
  );
}

export function SiteHeader({
  ctaHref = "#apply",
  ctaLabel = "Start Application",
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const trackingId =
    ctaHref === "#checkout"
      ? "header_choose_diploma"
      : "header_start_application";

  return (
    <header className="site-header shell">
      <BrandMark />
      <a
        className="button button-small"
        href={ctaHref}
        data-track-id={trackingId}
        onClick={() =>
          trackEvent(
            ctaHref === "#checkout" ? "PricingView" : "CTAOpenForm",
            {
              tracking_id: trackingId,
              cta_location: "header",
            },
          )
        }
      >
        {ctaLabel} <span aria-hidden="true">↘</span>
      </a>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  inverted = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  inverted?: boolean;
}) {
  return (
    <div className={`section-heading ${inverted ? "is-inverted" : ""}`}>
      <p className="eyebrow">
        <span aria-hidden="true" /> {eyebrow}
      </p>
      <h2>{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  );
}

export function VideoPlaceholder({
  label,
  orientation = "landscape",
  trackingId,
}: {
  label: string;
  orientation?: "landscape" | "portrait";
  trackingId: string;
}) {
  const [noted, setNoted] = useState(false);

  return (
    <div
      className={`video-placeholder video-${orientation}`}
      role="img"
      aria-label={`${label}. Final video asset is pending.`}
    >
      <div className="video-grid" aria-hidden="true" />
      <div className="video-content">
        <span className="media-tag">Media placeholder</span>
        <button
          className="play-button"
          type="button"
          aria-label={`Preview status for ${label}`}
          data-track-id={trackingId}
          onClick={() => {
            setNoted(true);
            trackEvent("MediaPlaceholderClick", {
              tracking_id: trackingId,
              media_type: "video_placeholder",
            });
          }}
        >
          <span aria-hidden="true">▶</span>
        </button>
        <p>{noted ? "Video asset will be added in Framer." : label}</p>
      </div>
    </div>
  );
}

export function DiplomaVideo() {
  const video = siteContent.media.mainVideo;

  return (
    <video
      className="diploma-video"
      controls
      height={video.height}
      playsInline
      poster={video.poster}
      preload="metadata"
      width={video.width}
      aria-label={video.title}
    >
      <source src={video.src} type="video/mp4" />
      Your browser does not support embedded video.
    </video>
  );
}

const fieldLabels: Record<string, string> = {
  fullName: "Full name",
  email: "Email address",
  mobile: "Mobile number",
  diploma: "Diploma format",
  job: "Job title",
  company: "Company",
  website: "Company website",
};

export function LeadCapture({
  location,
  compact = false,
  media,
}: {
  location: "primary" | "modal";
  compact?: boolean;
  media?: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<DiplomaId>("offline");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const started = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const selected = siteContent.diplomas[selectedId];
  const trackingId =
    location === "primary"
      ? siteContent.trackingNames.primaryForm
      : siteContent.trackingNames.modalForm;

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (!sectionRef.current || location === "modal") return;
    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          trackEvent(
            "PricingView",
            {
              tracking_id: `${trackingId}_pricing_view`,
              form_location: location,
              variant: selectedId,
            },
            { onceKey: `${trackingId}-pricing` },
          );
          observer.disconnect();
        }
      },
      { threshold: [0.35] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [location, selectedId, trackingId]);

  function handleStart() {
    if (started.current) return;
    started.current = true;
    trackEvent("FormStart", {
      tracking_id: trackingId,
      form_location: location,
      variant: selectedId,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const invalid = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        "input[required], select[required]",
      ),
    ).filter((field) => !field.checkValidity());

    if (invalid.length) {
      const nextErrors = Object.fromEntries(
        invalid.map((field) => [
          field.name,
          field.validity.valueMissing
            ? `${fieldLabels[field.name]} is required.`
            : `Enter a valid ${fieldLabels[field.name].toLowerCase()}.`,
        ]),
      );
      setErrors(nextErrors);
      invalid[0].focus();
      trackEvent("FormError", {
        tracking_id: trackingId,
        form_location: location,
        error_type: "validation",
        invalid_field_count: invalid.length,
      });
      return;
    }

    setErrors({});
    setSubmitting(true);
    const eventId = createEventId("lead");
    const attribution = captureAttribution();
    sessionStorage.setItem(
      "meska-pending-lead",
      JSON.stringify({
        eventId,
        variant: selectedId,
        wave: selected.wave,
        formLocation: location,
        attribution,
      }),
    );

    const query = new URLSearchParams({ diploma: selectedId });
    Object.entries(attribution).forEach(([key, value]) => query.set(key, value));
    window.location.assign(`/thank-you?${query.toString()}`);
  }

  return (
    <div
      className={`lead-capture ${media ? "lead-capture-with-media" : ""} ${compact ? "lead-capture-compact" : ""}`}
      ref={sectionRef}
      data-component="LeadCapture"
      data-form-location={location}
    >
      {media}
      <div className="price-panel">
        <div>
          <p className="eyebrow">
            <span aria-hidden="true" /> {selected.wave} · {selected.label}
          </p>
          <p className="price-label">Full diploma + community fee</p>
          <p className="price">{selected.price}</p>
          <p className="price-meta">Flexible payment plans available</p>
        </div>
        <dl className="price-details">
          <div>
            <dt>Starts</dt>
            <dd>{selected.startDate}</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>{selected.format}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{selected.location}</dd>
          </div>
        </dl>
      </div>

      <form
        className="application-form"
        onFocusCapture={handleStart}
        onSubmit={handleSubmit}
        noValidate
        data-track-id={trackingId}
      >
        <div className="form-heading">
          <p className="form-step">Interest form · no payment</p>
          <h3>{siteContent.form.title}</h3>
          <p>{siteContent.form.disclosure}</p>
        </div>

        <FormField label="Full name" name="fullName" error={errors.fullName}>
          <input
            id={`${trackingId}-fullName`}
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Your full name"
          />
        </FormField>

        <div className="field-row">
          <FormField label="Email address" name="email" error={errors.email}>
            <input
              id={`${trackingId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </FormField>
          <FormField label="Mobile number" name="mobile" error={errors.mobile}>
            <input
              id={`${trackingId}-mobile`}
              name="mobile"
              type="tel"
              autoComplete="tel"
              required
              placeholder="+20 1XX XXX XXXX"
            />
          </FormField>
        </div>

        <FormField
          label="Online or offline diploma"
          name="diploma"
          error={errors.diploma}
        >
          <select
            id={`${trackingId}-diploma`}
            name="diploma"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value as DiplomaId)}
            required
          >
            {diplomaList.map((diploma) => (
              <option key={diploma.id} value={diploma.id}>
                {diploma.label} · {diploma.price}
              </option>
            ))}
          </select>
        </FormField>

        <div className="field-row">
          <FormField label="Job title" name="job" error={errors.job}>
            <input
              id={`${trackingId}-job`}
              name="job"
              type="text"
              autoComplete="organization-title"
              required
              placeholder="Your role"
            />
          </FormField>
          <FormField label="Company" name="company" error={errors.company}>
            <input
              id={`${trackingId}-company`}
              name="company"
              type="text"
              autoComplete="organization"
              required
              placeholder="Company name"
            />
          </FormField>
        </div>

        <FormField
          label="Company website"
          name="website"
          error={errors.website}
        >
          <input
            id={`${trackingId}-website`}
            name="website"
            type="url"
            autoComplete="url"
            required
            placeholder="https://company.com"
          />
        </FormField>

        <button
          className="button button-submit"
          type="submit"
          disabled={submitting}
          data-track-id={`${trackingId}_submit`}
        >
          {submitting ? "Redirecting…" : siteContent.form.submitLabel}
          <span aria-hidden="true">↗</span>
        </button>
        <p className="prototype-note">{siteContent.form.prototypeNote}</p>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      <label htmlFor={(children as { props?: { id?: string } }).props?.id}>
        {label} <span aria-hidden="true">*</span>
      </label>
      {children}
      {error ? (
        <p className="error-message" id={`${name}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function StatsStrip() {
  return (
    <section className="stats-section" aria-label="Meska AI impact">
      <div className="stats-copy">
        <p className="eyebrow eyebrow-light">
          <span aria-hidden="true" /> Our impact
        </p>
      </div>
      <div className="stats-grid">
        {siteContent.stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OutcomesSection() {
  return (
    <section className="section shell" id="outcomes">
      <SectionHeading
        eyebrow="What changes after the diploma"
        title="Move from experimenting with AI to applying it at work."
      />
      <div className="outcome-grid">
        {siteContent.outcomes.map((outcome) => (
          <details className="outcome-card" key={outcome.number}>
            <summary>
              <span>{outcome.number}</span>
              <h3>{outcome.title}</h3>
              <i aria-hidden="true">+</i>
            </summary>
            <p>{outcome.description}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function OrganizationLogoRail() {
  const logos = siteContent.media.organizationLogos;
  const heading = siteContent.media.organizationSection;
  const logoPages = Array.from(
    { length: Math.ceil(logos.length / 4) },
    (_, index) => logos.slice(index * 4, index * 4 + 4),
  );

  return (
    <section className="logo-section shell" aria-labelledby="organization-logo-title">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description}
      />
      <div
        className="logo-rail"
        id="organization-logo-title"
        role="region"
        aria-label="Organizations represented by Meska AI learners"
        tabIndex={0}
      >
        <div className="logo-rail-track">
          {logoPages.map((page, pageIndex) => (
            <div className="logo-page" key={`logo-page-${pageIndex + 1}`}>
              {page.map((logo) => (
                <div className="organization-logo" key={logo.id}>
                  {/* Pre-optimized local assets are kept as plain images for direct Framer recreation. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={logo.name}
                    decoding="async"
                    height={logo.height}
                    loading="lazy"
                    src={logo.src}
                    width={logo.width}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SyllabusSection() {
  return (
    <section className="section syllabus-section" id="curriculum">
      <div className="shell">
        <SectionHeading
          eyebrow="Curriculum"
          title="Nine sessions engineered for real-world application."
        />
        <details className="curriculum-disclosure">
          <summary>
            <span>View all nine sessions</span>
            <i aria-hidden="true">+</i>
          </summary>
          <div className="syllabus-list">
            {siteContent.syllabus.map((session) => (
              <article
                className={`session-row ${session.number === "09" ? "session-row-graduation" : ""}`}
                key={session.number}
              >
                <span className="session-number">{session.number}</span>
                <h3>{session.title}</h3>
                <p>{session.outcome}</p>
                {session.number === "09" ? (
                  <span className="session-badge">Graduation project</span>
                ) : null}
              </article>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}

export function TestimonialCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const testimonials = siteContent.media.testimonials;

  function scrollToCard(index: number) {
    const track = trackRef.current;
    const card = track?.children.item(index) as HTMLElement | null;
    const firstCard = track?.children.item(0) as HTMLElement | null;
    if (!track || !card || !firstCard) return;

    track.scrollTo({
      left: card.offsetLeft - firstCard.offsetLeft,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }

  function move(direction: 1 | -1) {
    scrollToCard(
      Math.max(0, Math.min(testimonials.length - 1, activeIndex + direction)),
    );
  }

  function updateActiveIndex() {
    const track = trackRef.current;
    const firstCard = track?.children.item(0) as HTMLElement | null;
    if (!track || !firstCard) return;

    const nextIndex = Array.from(track.children).reduce(
      (nearest, child, index) => {
        const element = child as HTMLElement;
        const distance = Math.abs(
          element.offsetLeft - firstCard.offsetLeft - track.scrollLeft,
        );
        return distance < nearest.distance ? { index, distance } : nearest;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    ).index;

    setActiveIndex(nextIndex);
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - 2);
  }

  return (
    <section className="section testimonial-section shell">
      <div className="carousel-heading">
        <SectionHeading
          eyebrow="Previous diploma"
          title="The proof should feel human, not generic."
        />
        <div className="carousel-controls" aria-label="Testimonial controls">
          <span aria-live="polite">
            {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous testimonial"
            disabled={atStart}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next testimonial"
            disabled={atEnd}
          >
            →
          </button>
        </div>
      </div>
      <div
        className="testimonial-track"
        ref={trackRef}
        onScroll={updateActiveIndex}
        aria-label="AI Copilot Diploma graduate testimonials"
      >
        {testimonials.map((testimonial) => (
          <article className="testimonial-card" key={testimonial.id}>
            <div className="testimonial-media">
              {/* Pre-optimized local assets are kept as plain images for direct Framer recreation. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={testimonial.alt}
                decoding="async"
                height={testimonial.height}
                loading="lazy"
                src={testimonial.src}
                width={testimonial.width}
              />
            </div>
            <div className="testimonial-caption">
              <h3>{testimonial.name}</h3>
              <p>{testimonial.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function LeadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      className="lead-dialog"
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="modal-title"
    >
      <div className="dialog-toolbar">
        <div>
          <span>Meska AI</span>
          <strong id="modal-title">Start Application</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close application form">
          ×
        </button>
      </div>
      <LeadCapture location="modal" compact />
    </dialog>
  );
}

export function StickyMobileCTA({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="sticky-mobile-cta">
      <button
        className="button"
        type="button"
        onClick={() => {
          trackEvent("CTAOpenForm", {
            tracking_id: siteContent.trackingNames.stickyCta,
            cta_location: "sticky_mobile",
          });
          onOpen();
        }}
        data-track-id={siteContent.trackingNames.stickyCta}
      >
        Start Application <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}

export function CheckoutSection() {
  const [pendingId, setPendingId] = useState<DiplomaId | null>(null);

  return (
    <section className="section checkout-section shell" id="checkout">
      <SectionHeading
        eyebrow="Choose your format"
        title="Two routes. The same practical ambition."
        description="Checkout destinations are placeholders until the final Shopify URLs are supplied."
      />
      <div className="checkout-grid">
        {diplomaList.map((diploma) => {
          const trackingId =
            diploma.id === "offline"
              ? siteContent.trackingNames.offlineCheckout
              : siteContent.trackingNames.onlineCheckout;
          return (
            <article className="checkout-card" key={diploma.id}>
              <div className="checkout-card-top">
                <p className="eyebrow">
                  <span aria-hidden="true" /> {diploma.wave}
                </p>
                <h3>{diploma.label}</h3>
                <p className="checkout-price">{diploma.price}</p>
                <dl>
                  <div>
                    <dt>Starts</dt>
                    <dd>{diploma.startDate}</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>{diploma.format}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{diploma.location}</dd>
                  </div>
                </dl>
              </div>
              <div className="included-list">
                <p>What’s included</p>
                <ul>
                  {diploma.included.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="button button-submit"
                type="button"
                data-track-id={trackingId}
                onClick={() => {
                  if (diploma.checkoutUrl) {
                    const eventId = createEventId("checkout");
                    trackEvent("InitiateCheckout", {
                      tracking_id: trackingId,
                      variant: diploma.id,
                      value: diploma.priceValue,
                      currency: diploma.currency,
                      event_id: eventId,
                    });
                    window.location.assign(diploma.checkoutUrl);
                    return;
                  }
                  setPendingId(diploma.id);
                  trackEvent("CheckoutLinkPending", {
                    tracking_id: trackingId,
                    variant: diploma.id,
                  });
                }}
              >
                {pendingId === diploma.id
                  ? "Shopify link pending"
                  : `Continue to ${diploma.label} checkout`}
                <span aria-hidden="true">↗</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function SnippetsCarousel() {
  const snippets = ["Prompting lab", "Automation build", "Graduation showcase"];
  const [index, setIndex] = useState(0);
  const current = snippets[index];

  return (
    <section className="section snippets-section">
      <div className="shell snippets-layout">
        <SectionHeading
          eyebrow="Inside the sessions"
          title="A vertical look at how the work comes together."
          description="Final session clips will replace the portrait video placeholders."
          inverted
        />
        <div className="snippet-player">
          <VideoPlaceholder
            label={current}
            orientation="portrait"
            trackingId={`session_snippet_${index + 1}`}
          />
          <div className="snippet-controls">
            <span>
              {String(index + 1).padStart(2, "0")} / {String(snippets.length).padStart(2, "0")}
            </span>
            <div>
              <button
                type="button"
                aria-label="Previous session snippet"
                onClick={() => setIndex((index - 1 + snippets.length) % snippets.length)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Next session snippet"
                onClick={() => setIndex((index + 1) % snippets.length)}
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InstructorSection() {
  return (
    <section className="section instructor-section shell">
      <SectionHeading
        eyebrow="Your instructors"
        title="Learn from people actually doing this work."
        description="Instructor information is based on the current Meska AI diploma pages. Final photography is pending."
      />
      <div className="instructor-grid">
        {siteContent.instructors.map((instructor, index) => (
          <article className="instructor-card" key={instructor.name}>
            <div className="instructor-photo" role="img" aria-label={`Photo of ${instructor.name} pending`}>
              <span>{instructor.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span>
              <small>Photo pending</small>
            </div>
            <div className="instructor-index">{String(index + 1).padStart(2, "0")}</div>
            <h3>{instructor.name}</h3>
            <p className="instructor-title">{instructor.title}</p>
            <p className="instructor-secondary">{instructor.secondaryTitle}</p>
            <p>{instructor.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FAQSection() {
  return (
    <section className="section faq-section shell">
      <SectionHeading
        eyebrow="Frequently asked"
        title="Details to settle before checkout."
        description="Items without a published answer are visibly marked for final Meska AI copy."
      />
      <div className="faq-list">
        {siteContent.faq.map((item, index) => (
          <details key={item.question} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.question}
              <i aria-hidden="true">+</i>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function SiteFooter({ light = false }: { light?: boolean }) {
  return (
    <footer className={`site-footer ${light ? "site-footer-light" : ""}`}>
      <div className="shell footer-inner">
        <BrandMark />
        <p>AI Co-Pilot Diploma · Local approval prototype</p>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}

export function ThankYouLeadTracker() {
  useEffect(() => {
    const pendingRaw = sessionStorage.getItem("meska-pending-lead");
    if (pendingRaw) {
      const pending = JSON.parse(pendingRaw) as {
        eventId: string;
        variant: DiplomaId;
        wave: string;
        formLocation: string;
        attribution?: Record<string, string>;
      };
      trackEvent(
        "Lead",
        {
          tracking_id: `${pending.formLocation}_interest_form_submit`,
          variant: pending.variant,
          wave: pending.wave,
          form_location: pending.formLocation,
          event_id: pending.eventId,
          utm_source: pending.attribution?.utm_source,
          utm_campaign: pending.attribution?.utm_campaign,
        },
        { onceKey: pending.eventId },
      );
      sessionStorage.setItem("meska-last-lead", pendingRaw);
      sessionStorage.removeItem("meska-pending-lead");
    }

    trackEvent(
      "LeadThankYouView",
      {
        tracking_id: siteContent.trackingNames.thankYouView,
        has_submission_state: Boolean(pendingRaw),
      },
      { onceKey: siteContent.trackingNames.thankYouView },
    );
  }, []);

  return null;
}
