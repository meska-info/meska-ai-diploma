"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { siteContent } from "../../content";
import {
  experienceOptions,
  normalizeLinkedIn,
  normalizePhone,
  validateCopilotLead,
} from "../../lib/leadValidation";
import { writeEnrollmentSession } from "../../lib/enrollmentSession";
import { formatEGP, pricePerSeat, tierFor, totalFor } from "../../lib/teamPricing";
import {
  captureAttribution,
  createEventId,
  safeTrackEvent,
  writeSessionValue,
} from "../../lib/tracking";
import { EnrollmentTypeToggle } from "./EnrollmentTypeToggle";
import { useEnrollment } from "./EnrollmentProvider";
import { SeatCalculator } from "./SeatCalculator";
import { SeatStepper } from "./SeatStepper";

type Values = {
  fullName: string;
  mobile: string;
  email: string;
  companyName: string;
  jobTitle: string;
  linkedinUrl: string;
  yearsExperience: string;
  paymentPreference: string;
  copilotLicence: string;
  joiningReadiness: string;
  submitterIsParticipant: boolean;
};

const initialValues: Values = {
  fullName: "",
  mobile: "",
  email: "",
  companyName: "",
  jobTitle: "",
  linkedinUrl: "",
  yearsExperience: "",
  paymentPreference: "",
  copilotLicence: "",
  joiningReadiness: "",
  submitterIsParticipant: true,
};

const licenceToTeam: Record<string, string> = {
  yes: "all",
  no: "none",
  unsure: "unsure",
};

const licenceToIndividual: Record<string, string> = {
  all: "yes",
  some: "yes",
  none: "no",
  unsure: "unsure",
};

function Field({
  label,
  name,
  error,
  helper,
  children,
  full = false,
}: {
  label: string;
  name: string;
  error?: string;
  helper?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`field enrollment-field ${full ? "is-full" : ""} ${error ? "field-error" : ""}`}>
      <label htmlFor={(children as { props?: { id?: string } }).props?.id}>
        {label} <span aria-hidden="true">*</span>
      </label>
      {children}
      {helper ? <p className="field-helper">{helper}</p> : null}
      {error ? <p className="error-message" id={`${name}-error`} role="alert">{error}</p> : null}
    </div>
  );
}

export function EnrollmentLeadCapture({
  location,
  compact = false,
  media,
}: {
  location: "primary" | "modal";
  compact?: boolean;
  media?: ReactNode;
}) {
  const { seats, enrollmentType, setEnrollmentType, setSeats } = useEnrollment();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const startedRef = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackingId = location === "primary"
    ? siteContent.trackingNames.primaryForm
    : siteContent.trackingNames.modalForm;

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (!sectionRef.current || location === "modal") return;
    const node = sectionRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
        safeTrackEvent("PricingView", {
          tracking_id: `${trackingId}_pricing_view`,
          form_location: location,
          variant: "online",
        }, { onceKey: `${trackingId}-pricing` });
        observer.disconnect();
      }
    }, { threshold: [0.35] });
    observer.observe(node);
    return () => observer.disconnect();
  }, [location, trackingId]);

  function validationFor(nextValues: Values = values) {
    return validateCopilotLead({
      ...nextValues,
      seats,
      enrollmentType,
      diplomaSlug: "online",
    }, { mode: enrollmentType });
  }

  function setValue(name: keyof Values, value: string | boolean) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (errors[name]) {
      const nextError = validationFor(next).errors[name];
      setErrors((current) => ({ ...current, [name]: nextError ?? "" }));
    }
  }

  function normalizeField(name: "mobile" | "linkedinUrl") {
    const normalized = name === "mobile"
      ? normalizePhone(values.mobile)
      : normalizeLinkedIn(values.linkedinUrl);
    const next = { ...values, [name]: normalized };
    const error = validationFor(next).errors[name];
    if (!error) setValues(next);
    if (errors[name]) setErrors((current) => ({ ...current, [name]: error ?? "" }));
  }

  function changeType(type: "individual" | "team") {
    setEnrollmentType(type);
    setValues((current) => ({
      ...current,
      paymentPreference:
        type === "individual" && current.paymentPreference === "enterprise"
          ? ""
          : current.paymentPreference,
      copilotLicence: type === "team"
        ? licenceToTeam[current.copilotLicence] ?? current.copilotLicence
        : licenceToIndividual[current.copilotLicence] ?? current.copilotLicence,
    }));
    setErrors({});
    window.requestAnimationFrame(() => {
      sectionRef.current
        ?.querySelector<HTMLFormElement>("form")
        ?.querySelector<HTMLElement>("input:not([type=hidden]), select")
        ?.focus();
    });
  }

  function startForm() {
    if (startedRef.current) return;
    startedRef.current = true;
    safeTrackEvent("FormStart", {
      tracking_id: trackingId,
      form_location: location,
      variant: "online",
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const form = event.currentTarget;
    const validation = validationFor();
    if (!validation.valid) {
      setErrors(validation.errors);
      const fields = Object.keys(validation.errors);
      const first = form.elements.namedItem(fields[0]) as HTMLElement | null;
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus({ preventScroll: true });
      safeTrackEvent("FormError", {
        tracking_id: trackingId,
        form_location: location,
        error_type: "validation",
        invalid_field_count: fields.length,
        variant: "online",
        enrollment_type: enrollmentType,
        seats,
        error_fields: fields.join(","),
      });
      return;
    }

    const eventId = createEventId("lead");
    const attribution = captureAttribution();
    submittingRef.current = true;
    setSubmitting(true);
    setErrors({});
    safeTrackEvent("FormSubmit", {
      tracking_id: `${trackingId}_submit`,
      variant: "online",
      wave: "Cohort 01",
      form_location: location,
      lead_destination_status: "supabase",
      event_id: eventId,
      enrollment_type: enrollmentType,
      seats,
      value: totalFor(seats),
      currency: "EGP",
      tier: tierFor(seats).key,
      payment_preference: validation.normalized.paymentPreference,
      joining_readiness: validation.normalized.joiningReadiness,
      copilot_licence: validation.normalized.copilotLicence,
    }, { onceKey: `${eventId}-form-submit` });

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/copilot-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: eventId,
          ...validation.normalized,
          sourceContext: location,
          companyWebsite: formData.get("companyWebsite"),
          attribution,
        }),
      });
      const responseBody = await response.json().catch(() => ({})) as {
        leadId?: string;
        requestId?: string;
        editToken?: string;
        seats?: number;
        quotedTotal?: number;
        errors?: Record<string, string>;
      };
      if (!response.ok) {
        if (response.status === 400 && responseBody.errors) {
          setErrors(responseBody.errors);
          const fields = Object.keys(responseBody.errors);
          const first = form.elements.namedItem(fields[0]) as HTMLElement | null;
          first?.focus();
        } else {
          setErrors({ form: "We couldn't save your details. Please try again." });
        }
        throw new Error(`copilot_lead_${response.status}`);
      }
      if (!responseBody.leadId || !responseBody.editToken) {
        throw new Error("copilot_lead_response_invalid");
      }

      const session = {
        leadId: responseBody.leadId,
        requestId: responseBody.requestId ?? eventId,
        editToken: responseBody.editToken,
        enrollmentType,
        seats: responseBody.seats ?? seats,
        firstName: validation.normalized.fullName.split(/\s+/u)[0] ?? "",
        companyName: validation.normalized.companyName,
        email: validation.normalized.email,
        paymentPreference: validation.normalized.paymentPreference as "full" | "installments" | "enterprise",
        joiningReadiness: validation.normalized.joiningReadiness as "upcoming" | "later" | "discuss_upcoming",
        copilotLicence: validation.normalized.copilotLicence as "yes" | "no" | "unsure" | "all" | "some" | "none",
        submitterIsParticipant: validation.normalized.submitterIsParticipant,
        fullName: validation.normalized.fullName,
      };
      writeEnrollmentSession(session);
      const pendingLead = JSON.stringify({
        eventId,
        variant: "online",
        wave: "Cohort 01",
        formLocation: location,
        leadDestinationStatus: "persisted",
        attribution,
      });
      if (!writeSessionValue("meska-pending-lead", pendingLead)) {
        window.name = `meska-pending-lead:${pendingLead}`;
      }
      const query = new URLSearchParams({
        diploma: "online",
        seats: String(responseBody.seats ?? seats),
        lead: responseBody.leadId,
      });
      Object.entries(attribution).forEach(([key, value]) => query.set(key, value));
      window.location.assign(`/thank-you?${query.toString()}`);
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith("copilot_lead_400"))) {
        setErrors((current) => ({
          ...current,
          form: current.form ?? "We couldn't save your details. Please try again.",
        }));
      }
      safeTrackEvent("FormError", {
        tracking_id: trackingId,
        form_location: location,
        error_type: "persistence",
        variant: "online",
        enrollment_type: enrollmentType,
        seats,
        error_fields: "form",
      });
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const sharedInput = (
    name: keyof Values,
    type: "text" | "email" | "tel" | "url",
    placeholder: string,
    autoComplete?: string,
  ) => (
    <input
      aria-describedby={errors[name] ? `${name}-error` : undefined}
      aria-invalid={Boolean(errors[name])}
      autoComplete={autoComplete}
      id={`${trackingId}-${name}`}
      name={name}
      onBlur={() => {
        if (name === "mobile" || name === "linkedinUrl") normalizeField(name);
        else if (errors[name]) setErrors((current) => ({
          ...current,
          [name]: validationFor().errors[name] ?? "",
        }));
      }}
      onChange={(event) => setValue(name, event.target.value)}
      placeholder={placeholder}
      required
      type={type}
      value={String(values[name])}
    />
  );

  const readiness = (label: string) => (
    <Field label={label} name="joiningReadiness" error={errors.joiningReadiness} full={enrollmentType === "individual"}>
      <select
        aria-describedby={errors.joiningReadiness ? "joiningReadiness-error" : undefined}
        aria-invalid={Boolean(errors.joiningReadiness)}
        id={`${trackingId}-joiningReadiness`}
        name="joiningReadiness"
        onChange={(event) => setValue("joiningReadiness", event.target.value)}
        required
        value={values.joiningReadiness}
      >
        <option disabled value="">Select a cohort</option>
        <option value="upcoming">Upcoming cohort · Cohort 01, starts Wed 4 Nov 2026</option>
        <option value="later">The next cohort</option>
      </select>
    </Field>
  );

  return (
    <div
      className={`lead-capture enrollment-lead-capture ${media ? "lead-capture-with-media" : ""} ${compact ? "lead-capture-compact" : ""}`}
      data-component="LeadCapture"
      data-form-location={location}
      ref={sectionRef}
    >
      {media}
      <div className="price-panel enrollment-price-panel">
        <SeatCalculator location={location === "modal" ? "modal" : "price"} />
      </div>
      <form
        aria-busy={submitting}
        className="application-form enrollment-application-form"
        data-lead-destination="supabase"
        data-selected-format="online"
        data-track-id={trackingId}
        id={trackingId}
        noValidate
        onFocusCapture={startForm}
        onSubmit={submit}
      >
        <div className="form-heading">
          <p className="form-step">INTERESTED IN JOINING?</p>
          <h3>Talk to a Meska Advisor</h3>
        </div>
        <p className="enrollment-question">Who’s enrolling?</p>
        <EnrollmentTypeToggle
          location={location}
          onChange={changeType}
          seats={seats}
          value={enrollmentType}
        />
        <p className="enrollment-intro">
          {enrollmentType === "individual"
            ? "Tell us about yourself so an advisor can confirm your Copilot access and hold your seat in the cohort. It takes about a minute."
            : "Tell us about your company and team. We use this to confirm Copilot access, apply team pricing and prepare onboarding for everyone."}
        </p>
        <input name="diploma" type="hidden" value="online" />
        <input aria-hidden="true" autoComplete="off" name="companyWebsite" readOnly tabIndex={-1} type="hidden" value="" />

        <div className="enrollment-fields" data-enrollment-type={enrollmentType}>
          {enrollmentType === "individual" ? (
            <>
              <Field label="Full name" name="fullName" error={errors.fullName}>{sharedInput("fullName", "text", "Your full name", "name")}</Field>
              <Field label="Mobile number" name="mobile" error={errors.mobile}>{sharedInput("mobile", "tel", "+20 1XX XXX XXXX", "tel")}</Field>
              <Field label="Work email" name="email" error={errors.email} helper="Use your company email address.">{sharedInput("email", "email", "you@yourcompany.com", "email")}</Field>
              <Field label="Company" name="companyName" error={errors.companyName}>{sharedInput("companyName", "text", "Company you work for", "organization")}</Field>
              <Field label="Job title" name="jobTitle" error={errors.jobTitle}>{sharedInput("jobTitle", "text", "e.g. Operations Manager", "organization-title")}</Field>
              <Field label="LinkedIn profile" name="linkedinUrl" error={errors.linkedinUrl}>{sharedInput("linkedinUrl", "url", "linkedin.com/in/your-name", "url")}</Field>
              <Field label="Years of experience" name="yearsExperience" error={errors.yearsExperience}>
                <select id={`${trackingId}-yearsExperience`} name="yearsExperience" onChange={(event) => setValue("yearsExperience", event.target.value)} required value={values.yearsExperience}>
                  <option disabled value="">Select experience</option>
                  {experienceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>
              <Field label="How would you like to pay?" name="paymentPreference" error={errors.paymentPreference}>
                <select id={`${trackingId}-paymentPreference`} name="paymentPreference" onChange={(event) => setValue("paymentPreference", event.target.value)} required value={values.paymentPreference}>
                  <option disabled value="">Select payment option</option>
                  <option value="full">Pay in full</option>
                  <option value="installments">0% interest installments via Sympl</option>
                </select>
              </Field>
              <Field label="Do you have a Microsoft 365 Copilot licence?" name="copilotLicence" error={errors.copilotLicence}>
                <select id={`${trackingId}-copilotLicence`} name="copilotLicence" onChange={(event) => setValue("copilotLicence", event.target.value)} required value={values.copilotLicence}>
                  <option disabled value="">Select an answer</option>
                  <option value="yes">Yes, through my company</option>
                  <option value="no">No, not yet</option>
                  <option value="unsure">I’m not sure</option>
                </select>
              </Field>
              {readiness("When would you like to join?")}
            </>
          ) : (
            <>
              <Field label="Company" name="companyName" error={errors.companyName}>{sharedInput("companyName", "text", "Company name", "organization")}</Field>
              <Field label="Your job title" name="jobTitle" error={errors.jobTitle}>{sharedInput("jobTitle", "text", "e.g. L&D Manager", "organization-title")}</Field>
              <Field label="Your full name" name="fullName" error={errors.fullName}>{sharedInput("fullName", "text", "Your full name", "name")}</Field>
              <Field label="Work email" name="email" error={errors.email}>{sharedInput("email", "email", "you@yourcompany.com", "email")}</Field>
              <Field label="Mobile number" name="mobile" error={errors.mobile}>{sharedInput("mobile", "tel", "+20 1XX XXX XXXX", "tel")}</Field>
              <Field label="LinkedIn profile" name="linkedinUrl" error={errors.linkedinUrl}>{sharedInput("linkedinUrl", "url", "linkedin.com/in/your-name", "url")}</Field>
              <Field label="Number of seats" name="seats" error={errors.seats} full>
                <div className="form-seat-control">
                  <SeatStepper minimum={2} onChange={setSeats} seats={seats} />
                  <span>{seats} × {formatEGP(pricePerSeat(seats))} = {formatEGP(totalFor(seats))}</span>
                </div>
                <input name="seats" type="hidden" value={seats} />
              </Field>
              <Field label="How would your company like to pay?" name="paymentPreference" error={errors.paymentPreference} full>
                <select id={`${trackingId}-paymentPreference`} name="paymentPreference" onChange={(event) => setValue("paymentPreference", event.target.value)} required value={values.paymentPreference}>
                  <option disabled value="">Select payment option</option>
                  <option value="full">Pay in full</option>
                  <option value="installments">0% interest installments via Sympl</option>
                  <option value="enterprise">Enterprise arrangement (invoice, purchase order or custom payment terms)</option>
                </select>
              </Field>
              {readiness("When would your team like to join?")}
              <Field label="Does your company have Microsoft 365 Copilot licences?" name="copilotLicence" error={errors.copilotLicence}>
                <select id={`${trackingId}-copilotLicence`} name="copilotLicence" onChange={(event) => setValue("copilotLicence", event.target.value)} required value={values.copilotLicence}>
                  <option disabled value="">Select an answer</option>
                  <option value="all">Yes, for everyone joining</option>
                  <option value="some">Yes, for some of the team</option>
                  <option value="none">No, not yet</option>
                  <option value="unsure">We’re not sure</option>
                </select>
              </Field>
              <div className="field enrollment-field is-full enrollment-checkbox-field">
                <label className="enrollment-checkbox">
                  <input checked={values.submitterIsParticipant} name="submitterIsParticipant" onChange={(event) => setValue("submitterIsParticipant", event.target.checked)} type="checkbox" />
                  <span>I’m one of the participants</span>
                </label>
                <p className="field-helper">Untick if you’re enrolling your team but not attending yourself.</p>
              </div>
            </>
          )}
        </div>

        <p className="accuracy-note">
          {enrollmentType === "individual"
            ? "Please use your real details. We use them for your enrollment, certificate and onboarding messages."
            : "Please use your real work details. The company name appears on your invoice and certificates."}
        </p>
        {errors.form ? <p className="error-message form-error" role="alert">{errors.form}</p> : null}
        <button
          className="button button-submit"
          data-track-id={enrollmentType === "team" ? "copilot_form_team_continue" : `${trackingId}_submit`}
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Saving…" : enrollmentType === "team" ? `Continue with ${seats} seats →` : "Submit my interest ↗"}
        </button>
        <p className="enrollment-next-step">
          <b>Next:</b> {enrollmentType === "individual"
            ? "you'll see your enrollment summary and can pay online or talk to an advisor first. Nothing is charged yet."
            : "confirm seats, add participants (optional) and choose how to pay. Nothing is charged yet."}
        </p>
      </form>
    </div>
  );
}
