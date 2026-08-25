"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { diplomaList, DiplomaId, siteContent } from "../content";
import {
  captureAttribution,
  createEventId,
  readSessionValue,
  removeSessionValue,
  trackEvent,
  writeSessionValue,
} from "../lib/tracking";
import { CloudflareStreamVideo } from "./CloudflareStreamVideo";

export function BrandMark() {
  const logo = siteContent.media.brandLogo;

  return (
    <Link className="brand-mark" href="/" aria-label="Meska AI home">
      {/* The official logo is kept as a local asset so the prototype has no Drive dependency. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={logo.alt}
        height={logo.height}
        src={logo.src}
        width={logo.width}
      />
    </Link>
  );
}

export function SiteHeader({
  ctaHref = "#apply",
  ctaLabel = "Watch Free Guide",
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
    <CloudflareStreamVideo
      autoplay
      className="diploma-video"
      loading="eager"
      title={video.title}
      videoId={video.streamId}
    />
  );
}

const fieldLabels: Record<string, string> = {
  fullName: "Full name",
  email: "Email address",
  mobile: "Mobile number",
};

type FormatSelectionSource = "pointer" | "keyboard";

function FormatToggle({
  controlsId,
  idPrefix,
  label,
  onSelect,
  selectedId,
}: {
  controlsId: string;
  idPrefix: string;
  label: string;
  onSelect: (nextId: DiplomaId, source: FormatSelectionSource) => void;
  selectedId: DiplomaId;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % diplomaList.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + diplomaList.length) % diplomaList.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = diplomaList.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    onSelect(diplomaList[nextIndex].id, "keyboard");
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="format-toggle" role="tablist" aria-label={label}>
      {diplomaList.map((diploma, index) => (
        <button
          aria-controls={controlsId}
          aria-selected={selectedId === diploma.id}
          id={`${idPrefix}-${diploma.id}`}
          key={diploma.id}
          onClick={() => onSelect(diploma.id, "pointer")}
          onKeyDown={(event) => handleTabKeyDown(event, index)}
          ref={(node) => {
            tabRefs.current[index] = node;
          }}
          role="tab"
          tabIndex={selectedId === diploma.id ? 0 : -1}
          type="button"
        >
          {diploma.id === "offline" ? "Offline" : "Online"}
        </button>
      ))}
    </div>
  );
}

export function LeadCapture({
  location,
  selectedId,
  onSelectedIdChange,
  compact = false,
  media,
}: {
  location: "primary" | "modal";
  selectedId: DiplomaId;
  onSelectedIdChange: (nextId: DiplomaId) => void;
  compact?: boolean;
  media?: ReactNode;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
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

  function handleFormatSelect(
    nextId: DiplomaId,
    source: FormatSelectionSource,
  ) {
    if (nextId === selectedId) return;
    const previousId = selectedId;
    onSelectedIdChange(nextId);
    trackEvent("FormatSelect", {
      tracking_id: siteContent.trackingNames.landingFormatToggle,
      variant: nextId,
      previous_variant: previousId,
      selection_source: source,
      form_location: location,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    form
      .querySelectorAll<HTMLInputElement>('input[type="text"], input[type="email"], input[type="tel"]')
      .forEach((field) => {
        if (field.name !== "companyWebsite") field.value = field.value.trim();
      });
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
        variant: selectedId,
      });
      return;
    }

    const submittedFormat = new FormData(form).get("diploma");
    if (submittedFormat !== selectedId) {
      trackEvent("FormError", {
        tracking_id: trackingId,
        form_location: location,
        error_type: "format_sync",
        variant: selectedId,
      });
      return;
    }

    setErrors({});
    submittingRef.current = true;
    setSubmitting(true);
    const eventId = createEventId("lead");
    const attribution = captureAttribution();
    const formData = new FormData(form);
    trackEvent(
      "FormSubmit",
      {
        tracking_id: `${trackingId}_submit`,
        variant: selectedId,
        wave: selected.wave,
        form_location: location,
        lead_destination_status: "supabase",
        event_id: eventId,
      },
      { onceKey: `${eventId}-form-submit` },
    );
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: eventId,
          name: formData.get("fullName"),
          email: formData.get("email"),
          mobile: formData.get("mobile"),
          diplomaSlug: selectedId,
          sourceContext: location,
          leadMagnet: "free-ai-agent-guide",
          companyWebsite: formData.get("companyWebsite"),
          attribution,
        }),
      });
      if (!response.ok) {
        let code = "unknown";
        try {
          const responseBody = (await response.json()) as { code?: unknown };
          if (typeof responseBody.code === "string") code = responseBody.code;
        } catch {
          // Keep diagnostics useful even when an intermediary returns non-JSON.
        }
        console.warn(
          "[Meska lead] Submission rejected",
          JSON.stringify({ step: "api", status: response.status, code, location }),
        );
        throw new Error(`Lead persistence failed: ${response.status}:${code}`);
      }
    } catch (error) {
      console.warn(
        "[Meska lead] Submission failed",
        JSON.stringify({
          step: "request",
          code: error instanceof TypeError ? "network" : "api",
          location,
        }),
      );
      submittingRef.current = false;
      setSubmitting(false);
      setErrors({ form: "We couldn’t save your details. Please try again." });
      trackEvent("FormError", {
        tracking_id: trackingId,
        form_location: location,
        error_type: "persistence",
        variant: selectedId,
      });
      return;
    }

    const pendingLead = JSON.stringify({
      eventId,
      variant: selectedId,
      wave: selected.wave,
      formLocation: location,
      leadDestinationStatus: "persisted",
      attribution,
    });
    if (!writeSessionValue("meska-pending-lead", pendingLead)) {
      window.name = `meska-pending-lead:${pendingLead}`;
    }

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
        <FormatToggle
          controlsId={`${trackingId}-price-content`}
          idPrefix={`${trackingId}-format-tab`}
          label="Diploma format"
          onSelect={handleFormatSelect}
          selectedId={selectedId}
        />
        <div
          aria-labelledby={`${trackingId}-format-tab-${selectedId}`}
          className="price-compact-content"
          data-selected-format={selectedId}
          id={`${trackingId}-price-content`}
          role="tabpanel"
        >
          <div className="price-summary">
            <div>
              <p className="eyebrow">
                <span aria-hidden="true" /> {selected.wave} · {selected.label}
              </p>
              <p className="price-label">Full diploma + community fee</p>
              <p className="price">{selected.price}</p>
            </div>
            <p className="price-meta">{selected.installmentNote}</p>
          </div>
          <dl className="price-details">
            <div>
              <dt>Starts</dt>
              <dd>
                {selected.startDate}<br /><span>{selected.schedule}</span>
              </dd>
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
      </div>

      <form
        className="application-form"
        onFocusCapture={handleStart}
        onSubmit={handleSubmit}
        noValidate
        id={trackingId}
        data-track-id={trackingId}
        data-selected-format={selectedId}
        data-lead-destination={selected.leadDestination ?? "pending"}
      >
        <div className="form-heading">
          <p className="form-step">{siteContent.form.eyebrow}</p>
          <h3>{siteContent.form.title}</h3>
          <p>{siteContent.form.disclosure}</p>
        </div>
        <input name="diploma" type="hidden" value={selectedId} />
        <input
          aria-hidden="true"
          autoComplete="off"
          name="companyWebsite"
          readOnly
          tabIndex={-1}
          type="hidden"
          value=""
        />

        <FormField label="Full name" name="fullName" error={errors.fullName}>
          <input
            id={`${trackingId}-fullName`}
            name="fullName"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
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
              autoCapitalize="none"
              autoCorrect="off"
              enterKeyHint="next"
              inputMode="email"
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
              enterKeyHint="send"
              inputMode="tel"
              required
              placeholder="+20 1XX XXX XXXX"
            />
          </FormField>
        </div>

        <button
          className="button button-submit"
          type="submit"
          disabled={submitting}
          data-track-id={`${trackingId}_submit`}
        >
          {submitting ? "Redirecting…" : selected.formSubmitLabel}
          <span aria-hidden="true">↗</span>
        </button>
        {errors.form ? <p className="error-message form-error" role="alert">{errors.form}</p> : null}
        <p className="form-reassurance">{siteContent.form.reassurance}</p>
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
        eyebrow="The shift"
        title="Work differently after the diploma."
        description="Move from experimenting with AI to using it with purpose — across your decisions, workflows, communication, and everyday responsibilities."
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

function OrganizationLogoSequence({
  duplicate = false,
}: {
  duplicate?: boolean;
}) {
  return (
    <div className="logo-sequence" aria-hidden={duplicate || undefined}>
      {siteContent.media.organizationLogos.map((logo) => (
        <div
          className="organization-logo"
          key={`${duplicate ? "duplicate-" : ""}${logo.id}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={duplicate ? "" : logo.name}
            decoding="async"
            height={logo.height}
            loading="eager"
            src={logo.src}
            width={logo.width}
          />
        </div>
      ))}
    </div>
  );
}

export function OrganizationLogoRail() {
  const heading = siteContent.media.organizationSection;
  const railRef = useRef<HTMLDivElement>(null);
  const [logosReady, setLogosReady] = useState(false);

  useEffect(() => {
    const images = Array.from(
      railRef.current?.querySelectorAll<HTMLImageElement>(
        '.logo-sequence:not([aria-hidden="true"]) img',
      ) ?? [],
    );
    if (!images.length) return;

    const pending = new Set(images.filter((image) => !image.complete));
    if (!pending.size) {
      setLogosReady(true);
      return;
    }

    const settle = (event: Event) => {
      pending.delete(event.currentTarget as HTMLImageElement);
      if (!pending.size) setLogosReady(true);
    };
    pending.forEach((image) => {
      image.addEventListener("load", settle, { once: true });
      image.addEventListener("error", settle, { once: true });
    });
    return () => {
      pending.forEach((image) => {
        image.removeEventListener("load", settle);
        image.removeEventListener("error", settle);
      });
    };
  }, []);

  return (
    <section className="logo-section shell" aria-labelledby="organization-logo-title">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description}
      />
      <div
        className={`logo-rail ${logosReady ? "logos-ready" : ""}`}
        id="organization-logo-title"
        ref={railRef}
        role="region"
        aria-label="Organizations represented by Meska AI learners"
        tabIndex={0}
      >
        <div className="logo-rail-track">
          <OrganizationLogoSequence />
          <OrganizationLogoSequence duplicate />
        </div>
      </div>
    </section>
  );
}

export function SyllabusSection({ description }: { description?: string } = {}) {
  return (
    <section className="section syllabus-section" id="curriculum">
      <div className="shell">
        {description ? (
          <SectionHeading
            eyebrow="Your eight-week building journey"
            title="A curriculum designed to move your build forward"
            description={description}
          />
        ) : null}
        <details className="curriculum-disclosure">
          <summary aria-controls="curriculum-session-list">
            <span className="curriculum-summary-copy">
              <span className="eyebrow">The full learning journey</span>
              <strong>Explore the complete curriculum</strong>
              <small>
                See how every session builds from AI foundations to practical workflows, automation, agents, and a real graduation project.
              </small>
              <span className="curriculum-action">
                <span className="curriculum-action-closed">Explore All Sessions</span>
                <span className="curriculum-action-open">Hide Full Curriculum</span>
              </span>
            </span>
            <i aria-hidden="true">↘</i>
          </summary>
          <div className="syllabus-list" id="curriculum-session-list">
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
  selectedId,
  onSelectedIdChange,
}: {
  open: boolean;
  onClose: () => void;
  selectedId: DiplomaId;
  onSelectedIdChange: (nextId: DiplomaId) => void;
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
          <strong id="modal-title">Watch the Free Guide</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close free guide form">
          ×
        </button>
      </div>
      <LeadCapture
        location="modal"
        compact
        onSelectedIdChange={onSelectedIdChange}
        selectedId={selectedId}
      />
    </dialog>
  );
}

export function StickyMobileCTA({
  onActivate,
}: {
  onActivate: () => void;
}) {
  return (
    <div className="sticky-mobile-cta">
      <button
        className="button"
        type="button"
        onClick={() => {
          trackEvent("CTAOpenForm", {
            tracking_id: siteContent.trackingNames.stickyCta,
            cta_location: "sticky",
          });
          onActivate();
        }}
        data-track-id={siteContent.trackingNames.stickyCta}
      >
        Watch Free Guide <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}

export function GraduationStory() {
  const video = siteContent.media.graduationVideo;

  return (
    <section className="section graduation-story shell">
      <div className="graduation-copy">
        <SectionHeading
          eyebrow="A moment from a previous wave"
          title="Before you decide, see what the experience meant to them."
          description="This is more than the end of a course. It is the moment professionals realise what they can now build, automate, and improve with AI. Watch a previous wave celebrate the work, confidence, and practical progress they created together."
        />
      </div>
      <div className="graduation-video-frame">
        <CloudflareStreamVideo
          className="is-portrait"
          onFirstPlay={() => {
            trackEvent(
              "VideoPlay",
              {
                tracking_id: siteContent.trackingNames.graduationVideo,
                media_location: "graduation_story",
              },
              { onceKey: siteContent.trackingNames.graduationVideo },
            );
          }}
          title={video.title}
          videoId={video.streamId}
        />
      </div>
    </section>
  );
}

export function FreeGuideSection() {
  const video = siteContent.media.freeGuideVideo;

  return (
    <section className="section free-guide-section shell">
      <div className="free-guide-copy">
        <SectionHeading
          eyebrow="Your free practical guide"
          title="Start building your first AI Agent."
          description="Your eight-week AI-app journey starts with one practical step: turning a real task into an agent you can understand, shape, and use."
        />
        <p className="free-guide-caption">
          Follow the session at your own pace and leave with a clearer path from idea to a working first build.
        </p>
      </div>
      <div className="free-guide-video-frame">
        <CloudflareStreamVideo
          onFirstPlay={() =>
            trackEvent(
              "VideoPlay",
              { tracking_id: video.id, media_location: "thank_you_free_guide" },
              { onceKey: video.id },
            )
          }
          title={video.title}
          videoId={video.streamId}
        />
      </div>
    </section>
  );
}

export function VideoTestimonialsSection({
  context = "landing",
}: {
  context?: "landing" | "thank_you";
}) {
  const videos = siteContent.media.videoTestimonials;

  return (
    <section className="section video-testimonials-section">
      <div className="shell">
        <SectionHeading
          eyebrow="Learner stories"
          title={context === "landing" ? "Hear what the diploma felt like from the people who joined it." : "See how other professionals experienced the journey."}
          description="Real learners share their experience, progress, and the practical value they took back into their work."
        />
        <div className="video-testimonial-track" aria-label="Student video testimonials">
          {videos.map((video, index) => (
            <article className="video-testimonial-card" key={video.id}>
              <CloudflareStreamVideo
                className="is-portrait"
                loading="eager"
                onFirstPlay={() =>
                  trackEvent(
                    "VideoPlay",
                    {
                      tracking_id: video.id,
                      media_location: `${context}_video_testimonials`,
                      media_index: index + 1,
                    },
                    { onceKey: `${context}_${video.id}` },
                  )
                }
                title={video.label}
                videoId={video.streamId}
              />
              <p><span>{String(index + 1).padStart(2, "0")}</span>{video.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CheckoutSection() {
  const [selectedId, setSelectedId] = useState<DiplomaId>("offline");
  const selected = siteContent.diplomas[selectedId];
  const trackingId =
    selected.id === "offline"
      ? siteContent.trackingNames.offlineCheckout
      : siteContent.trackingNames.onlineCheckout;

  useEffect(() => {
    const querySelection = new URLSearchParams(window.location.search).get(
      "diploma",
    );
    if (querySelection === "online" || querySelection === "offline") {
      const frame = window.requestAnimationFrame(() => setSelectedId(querySelection));
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  function selectFormat(
    nextId: DiplomaId,
    source: FormatSelectionSource,
  ) {
    if (nextId === selectedId) return;
    const previousId = selectedId;
    setSelectedId(nextId);
    trackEvent("FormatSelect", {
      tracking_id: siteContent.trackingNames.checkoutFormatToggle,
      variant: nextId,
      previous_variant: previousId,
      selection_source: source,
    });
  }

  function beginCheckout() {
    const eventId = createEventId("checkout");
    trackEvent("InitiateCheckout", {
      tracking_id: trackingId,
      variant: selected.id,
      value: selected.priceValue,
      currency: selected.currency,
      event_id: eventId,
    });

    const destination = new URL(selected.checkoutUrl);
    Object.entries(captureAttribution()).forEach(([key, value]) => {
      if (!destination.searchParams.has(key)) destination.searchParams.set(key, value);
    });
    window.location.assign(destination.toString());
  }

  return (
    <section className="section checkout-section shell" id="checkout">
      <SectionHeading
        eyebrow="Choose how you learn best"
        title="One outcome. Two practical ways to get there."
        description="This is not a decision between better and worse. It is a decision about the learning experience that fits your schedule, location, and preferred level of in-person interaction. Choose the format that makes the diploma easiest for you to complete and apply."
      />
      <FormatToggle
        controlsId="selected-format-card"
        idPrefix="format-tab"
        label="Diploma format"
        onSelect={selectFormat}
        selectedId={selectedId}
      />
      <article
        aria-labelledby={`format-tab-${selected.id}`}
        className="checkout-card checkout-card-unified"
        data-selected-format={selected.id}
        id="selected-format-card"
        role="tabpanel"
      >
        <div className="checkout-card-top">
          <p className="eyebrow">
            <span aria-hidden="true" /> {selected.wave}
          </p>
          <h3>{selected.label}</h3>
          <p className="checkout-price">{selected.price}</p>
          <p className="checkout-installments">{selected.installmentNote}</p>
          <dl>
            <div>
              <dt>Starts</dt>
              <dd>
                {selected.startDate}<br /><span>{selected.schedule}</span>
              </dd>
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
        <div className="included-list">
          <p>What’s included</p>
          <ul>
            {selected.included.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span> {item}
              </li>
            ))}
          </ul>
          <button
            className="button button-submit"
            data-checkout-destination={selected.checkoutUrl}
            data-track-id={trackingId}
            onClick={beginCheckout}
            type="button"
          >
            Continue with the {selected.label}
            <span aria-hidden="true">↗</span>
          </button>
          <p className="checkout-supporting-note">
            You will be able to review your order before completing payment.
          </p>
        </div>
      </article>
    </section>
  );
}

export function SnippetsCarousel() {
  const videos = siteContent.media.insideDiplomaVideos;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToVideo(index: number) {
    const safeIndex = Math.max(0, Math.min(videos.length - 1, index));
    const track = trackRef.current;
    const card = track?.children.item(safeIndex) as HTMLElement | null;
    const firstCard = track?.children.item(0) as HTMLElement | null;
    if (!track || !card || !firstCard) return;
    track.scrollTo({
      left: card.offsetLeft - firstCard.offsetLeft,
      behavior: "smooth",
    });
    setActiveIndex(safeIndex);
  }

  function updateActiveIndex() {
    const track = trackRef.current;
    const firstCard = track?.children.item(0) as HTMLElement | null;
    if (!track || !firstCard) return;
    const nextIndex = Array.from(track.children).reduce(
      (nearest, child, index) => {
        const card = child as HTMLElement;
        const distance = Math.abs(
          card.offsetLeft - firstCard.offsetLeft - track.scrollLeft,
        );
        return distance < nearest.distance ? { index, distance } : nearest;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    ).index;

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  }

  function handleCarouselKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if ((event.target as HTMLElement).tagName === "IFRAME") return;
    event.preventDefault();
    scrollToVideo(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  }

  return (
    <section
      className="section snippets-section"
      onKeyDown={handleCarouselKeyDown}
    >
      <div className="shell">
        <div className="snippets-heading-row">
        <SectionHeading
          eyebrow="Need more time to decide?"
          title="Step inside the diploma and see for yourself."
          description="Take a closer look at the energy, practice, collaboration, and real work happening across the sessions. Explore the moments below at your own pace — and remember, the Meska team will contact you very soon to answer all your questions."
          inverted
        />
          <div className="snippet-controls" aria-label="Inside the diploma controls">
            <span aria-live="polite">
              {String(activeIndex + 1).padStart(2, "0")} / {String(videos.length).padStart(2, "0")}
            </span>
            <button
              aria-label="Previous diploma video"
              disabled={activeIndex === 0}
              onClick={() => scrollToVideo(activeIndex - 1)}
              type="button"
            >
              ←
            </button>
            <button
              aria-label="Next diploma video"
              disabled={activeIndex === videos.length - 1}
              onClick={() => scrollToVideo(activeIndex + 1)}
              type="button"
            >
              →
            </button>
          </div>
        </div>
        <div
          aria-label="Videos from inside the AI Co-Pilot Diploma"
          className="snippet-track"
          onScroll={updateActiveIndex}
          ref={trackRef}
          tabIndex={0}
        >
          {videos.map((video, index) => (
            <article className="snippet-card" key={video.id}>
              <CloudflareStreamVideo
                className="is-portrait"
                onFirstPlay={() =>
                  trackEvent(
                    "VideoPlay",
                    {
                      tracking_id: video.id,
                      media_location: "inside_diploma",
                      media_index: index + 1,
                    },
                    { onceKey: video.id },
                  )
                }
                title={video.label}
                videoId={video.streamId}
              />
              <p>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {video.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SkillsBusinessValueSection() {
  const items = siteContent.skillsToValue;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = items[selectedIndex];

  function selectCapability(
    nextIndex: number,
    source: FormatSelectionSource,
  ) {
    if (nextIndex === selectedIndex) return;
    const previous = items[selectedIndex];
    setSelectedIndex(nextIndex);
    trackEvent("CapabilitySelect", {
      tracking_id: siteContent.trackingNames.skillsMatrix,
      capability_id: items[nextIndex].id,
      previous_capability_id: previous.id,
      selection_source: source,
      interaction_location: "thank_you_skills_matrix",
    });
  }

  function handleCapabilityKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectCapability(nextIndex, "keyboard");
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section className="section skills-value-section shell">
      <SectionHeading
        eyebrow="What you’ll be able to do"
        title="From AI skills to measurable business value."
        description="Explore how the technical capabilities you build throughout the diploma translate into faster work, stronger decisions, and practical solutions for your role."
      />
      <div className="skills-matrix">
        <div
          aria-label="AI capabilities"
          aria-orientation="vertical"
          className="skills-tabs"
          role="tablist"
        >
          {items.map((item, index) => (
            <button
              aria-controls={`skill-value-panel-${item.id}`}
              aria-selected={selectedIndex === index}
              id={`skill-value-tab-${item.id}`}
              key={item.id}
              onClick={() => selectCapability(index, "pointer")}
              onKeyDown={(event) => handleCapabilityKeyDown(event, index)}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              tabIndex={selectedIndex === index ? 0 : -1}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.capability}
            </button>
          ))}
        </div>
        <article
          aria-labelledby={`skill-value-tab-${selected.id}`}
          className="skills-value-panel"
          id={`skill-value-panel-${selected.id}`}
          role="tabpanel"
        >
          <p className="skills-panel-label">Capability</p>
          <h3>{selected.capability}</h3>
          <div className="skills-value-layer">
            <span>What you’ll be able to do</span>
            <p>{selected.application}</p>
          </div>
          <div className="skills-value-layer skills-value-benefit">
            <span>Professional and business benefit</span>
            <p>{selected.benefit}</p>
          </div>
          <p className="skills-session-map">
            Curriculum sessions {selected.curriculumSessions.join(" + ")}
          </p>
        </article>
      </div>
      <noscript>
        <div className="skills-noscript">
          {items.map((item) => (
            <article key={item.id}>
              <h3>{item.capability}</h3>
              <p>{item.application}</p>
              <p>{item.benefit}</p>
            </article>
          ))}
        </div>
      </noscript>
    </section>
  );
}

export function InstructorSection() {
  return (
    <section className="section instructor-section shell">
      <SectionHeading
        eyebrow="Your instructors"
        title="Learn with people who are actively doing the work."
        description="The diploma is led by practitioners who apply AI across businesses, teams, and real operational challenges — so the guidance stays practical, current, and connected to the work you actually need to do."
      />
      <div className="instructor-grid">
        {siteContent.instructors.map((instructor, index) => (
          <article className="instructor-card" key={instructor.id}>
            <div className="instructor-photo">
              {/* Official portraits are stored locally for the prototype and Framer handoff. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={instructor.imageAlt}
                decoding="async"
                height={instructor.imageHeight}
                loading="lazy"
                src={instructor.image}
                width={instructor.imageWidth}
              />
            </div>
            <div className="instructor-card-content">
              <div className="instructor-index">{String(index + 1).padStart(2, "0")}</div>
              <h3>{instructor.name}</h3>
              <p className="instructor-title">{instructor.title}</p>
              {instructor.secondaryTitle ? (
                <p className="instructor-secondary">{instructor.secondaryTitle}</p>
              ) : null}
              <p className="instructor-bio">{instructor.bio}</p>
              <a
                aria-label={`View ${instructor.name} on LinkedIn (opens in a new tab)`}
                className="linkedin-link"
                href={instructor.linkedin}
                rel="noopener noreferrer"
                target="_blank"
              >
                View LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </div>
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
        eyebrow="Clear answers before you decide"
        title="Everything you may want to ask before taking the next step."
        description="Review the practical details, compare the two formats, and see what remains for the Meska team to confirm with you personally."
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
        <p>AI Co-Pilot Diploma · Created by Meska</p>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}

export function ThankYouLeadTracker() {
  useEffect(() => {
    type PendingLead = {
      eventId: string;
      variant: DiplomaId;
      wave: string;
      formLocation: string;
      leadDestinationStatus?: string;
      attribution?: Record<string, string>;
    };
    const windowNamePrefix = "meska-pending-lead:";
    const windowNamePending = window.name.startsWith(windowNamePrefix)
      ? window.name.slice(windowNamePrefix.length)
      : null;
    const pendingRaw = readSessionValue("meska-pending-lead") ?? windowNamePending;
    if (pendingRaw) {
      let pending: PendingLead | null = null;
      try {
        pending = JSON.parse(pendingRaw) as PendingLead;
      } catch {
        pending = null;
      }
      if (pending) {
      trackEvent(
        "Lead",
        {
          tracking_id: `${pending.formLocation}_interest_form_submit`,
          variant: pending.variant,
          wave: pending.wave,
          form_location: pending.formLocation,
          lead_destination_status:
            pending.leadDestinationStatus ?? "pending",
          event_id: pending.eventId,
          utm_source: pending.attribution?.utm_source,
          utm_medium: pending.attribution?.utm_medium,
          utm_campaign: pending.attribution?.utm_campaign,
          utm_term: pending.attribution?.utm_term,
          utm_content: pending.attribution?.utm_content,
          fbclid: pending.attribution?.fbclid,
        },
        { onceKey: pending.eventId },
      );
      writeSessionValue("meska-last-lead", pendingRaw);
      }
      removeSessionValue("meska-pending-lead");
      if (windowNamePending) window.name = "";
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
