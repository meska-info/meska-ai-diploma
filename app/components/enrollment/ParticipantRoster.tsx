"use client";

import { useEffect, useMemo, useState } from "react";
import type { CopilotEnrollmentSession } from "../../lib/enrollmentSession";
import { patchEnrollment, EnrollmentRequestError } from "../../lib/enrollmentApi";
import { validateParticipant } from "../../lib/leadValidation";
import { safeTrackEvent } from "../../lib/tracking";

type Participant = {
  fullName: string;
  email: string;
  locked?: boolean;
};

export function ParticipantRoster({
  seats,
  session,
  onSessionExpired,
}: {
  seats: number;
  session: CopilotEnrollmentSession;
  onSessionExpired: () => void;
}) {
  const initial = useMemo<Participant[]>(() => {
    if (!session.submitterIsParticipant) return [];
    return [{ fullName: session.fullName, email: session.email, locked: true }];
  }, [session.email, session.fullName, session.submitterIsParticipant]);
  const [rows, setRows] = useState<Participant[]>(initial);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRows((current) => {
        const next = [...current];
        while (next.length < seats) next.push({ fullName: "", email: "" });
        return next;
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [seats]);

  const filled = rows.slice(0, seats).filter((row) => row.fullName && row.email).length;

  function update(index: number, key: "fullName" | "email", value: string) {
    setRows((current) => current.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [key]: value } : row));
    setErrors((current) => ({ ...current, [`${index}.${key}`]: "" }));
    setSaved(false);
  }

  async function save() {
    const nextErrors: Record<string, string> = {};
    const seen = new Set<string>();
    const valid: Participant[] = [];
    rows.slice(0, seats).forEach((row, index) => {
      if (!row.fullName && !row.email) return;
      const result = validateParticipant(row);
      Object.entries(result.errors).forEach(([field, message]) => {
        nextErrors[`${index}.${field}`] = message;
      });
      if (!result.valid) return;
      if (seen.has(result.normalized.email)) {
        nextErrors[`${index}.email`] = "This email is already on the list.";
        return;
      }
      seen.add(result.normalized.email);
      valid.push({ ...result.normalized, locked: row.locked });
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await patchEnrollment(session.leadId, {
        editToken: session.editToken,
        participants: valid.map(({ fullName, email }) => ({ fullName, email })),
      }, { retries: 3 });
      setSaved(true);
      safeTrackEvent("ParticipantsSaved", {
        seats,
        participants_count: valid.length,
      });
    } catch (error) {
      if (error instanceof EnrollmentRequestError && error.status === 401) {
        onSessionExpired();
      } else if (error instanceof EnrollmentRequestError && error.errors) {
        const mapped = Object.fromEntries(
          Object.entries(error.errors).map(([key, value]) => [
            key.replace(/^participants\./, ""),
            value,
          ]),
        );
        setErrors(mapped);
      } else {
        setErrors({ form: "We couldn't save the participant list. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="participant-roster" aria-labelledby="participant-title">
      <div className="participant-heading">
        <div>
          <h3 id="participant-title">Participants</h3>
          <div className="participant-dots" aria-hidden="true">
            {Array.from({ length: seats }, (_, index) => (
              <i className={index < filled ? "is-filled" : ""} key={index} />
            ))}
          </div>
          <p>{filled} of {seats} participants added</p>
        </div>
        <button className="button button-secondary" onClick={() => setOpen((value) => !value)} type="button">
          {filled ? "Edit participants" : "Add participants"}
        </button>
      </div>
      {open ? (
        <div className="participant-editor">
          {rows.map((row, index) => (
            <div className={`participant-row ${index >= seats ? "is-over-limit" : ""}`} key={index}>
              <span>{row.locked ? "You" : index + 1}</span>
              <div className={errors[`${index}.fullName`] ? "field-error" : ""}>
                <label htmlFor={`participant-${index}-name`}>Full name</label>
                <input
                  aria-invalid={Boolean(errors[`${index}.fullName`])}
                  id={`participant-${index}-name`}
                  onChange={(event) => update(index, "fullName", event.target.value)}
                  placeholder="Full name"
                  readOnly={row.locked}
                  value={row.fullName}
                />
                {errors[`${index}.fullName`] ? <p className="error-message">{errors[`${index}.fullName`]}</p> : null}
              </div>
              <div className={errors[`${index}.email`] ? "field-error" : ""}>
                <label htmlFor={`participant-${index}-email`}>Work email</label>
                <input
                  aria-invalid={Boolean(errors[`${index}.email`])}
                  id={`participant-${index}-email`}
                  onChange={(event) => update(index, "email", event.target.value)}
                  placeholder="name@company.com"
                  readOnly={row.locked}
                  type="email"
                  value={row.email}
                />
                {errors[`${index}.email`] ? <p className="error-message">{errors[`${index}.email`]}</p> : null}
              </div>
              {index >= seats ? <p className="participant-over-limit">Over seat limit</p> : null}
            </div>
          ))}
          <p className="participant-helper">Optional now. You can send the list after payment too.</p>
          {errors.form ? <p className="error-message" role="alert">{errors.form}</p> : null}
          {saved ? <p className="save-status" role="status">Participants saved</p> : null}
          <button className="button button-secondary" disabled={saving} onClick={save} type="button">
            {saving ? "Saving…" : "Save participants"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
