"use client";

import { useEffect, useMemo, useState } from "react";
import type { CopilotEnrollmentSession } from "../../lib/enrollmentSession";
import { EnrollmentRequestError, patchEnrollment } from "../../lib/enrollmentApi";
import { cartPermalink, formatEGP, tierFor, totalFor, COPILOT_VARIANT_ID } from "../../lib/teamPricing";
import { captureAttribution, createEventId, safeTrackEvent } from "../../lib/tracking";

type PaymentPath = "now" | "invoice" | "send";

export function PaymentPathPicker({
  seats,
  session,
  personal,
  licenceRequired,
  showSticky,
  onSessionExpired,
}: {
  seats: number;
  session: CopilotEnrollmentSession | null;
  personal: boolean;
  licenceRequired: boolean;
  showSticky: boolean;
  onSessionExpired: () => void;
}) {
  const [path, setPath] = useState<PaymentPath>(
    personal && session?.paymentPreference === "enterprise" ? "invoice" : "now",
  );
  const [acknowledged, setAcknowledged] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");
  const [error, setError] = useState("");
  const [invoiceDone, setInvoiceDone] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const total = totalFor(seats);
  const baseCheckoutUrl = useMemo(() => cartPermalink(seats, {
    leadId: personal ? session?.leadId : undefined,
  }), [personal, seats, session?.leadId]);
  const [checkoutUrl, setCheckoutUrl] = useState(baseCheckoutUrl);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCheckoutUrl(cartPermalink(seats, {
        leadId: personal ? session?.leadId : undefined,
        attribution: captureAttribution(),
      }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [baseCheckoutUrl, personal, seats, session?.leadId]);

  function select(next: PaymentPath) {
    setPath(next);
    setError("");
    safeTrackEvent("PaymentPathSelected", {
      payment_path: next,
      seats,
      value: total,
    });
  }

  async function persist(input: Record<string, unknown>, keepalive = false) {
    if (!personal || !session) return null;
    try {
      return await patchEnrollment(session.leadId, {
        editToken: session.editToken,
        ...input,
      }, { retries: 3, keepalive });
    } catch (requestError) {
      if (requestError instanceof EnrollmentRequestError && requestError.status === 401) {
        onSessionExpired();
        return null;
      }
      throw requestError;
    }
  }

  async function pay(event: React.MouseEvent<HTMLAnchorElement>) {
    if (licenceRequired && !acknowledged) {
      event.preventDefault();
      setError("Confirm that you understand the Copilot licence requirement before continuing.");
      return;
    }
    event.preventDefault();
    try {
      await persist({ paymentPath: "now", checkoutStartedAt: new Date().toISOString() }, true);
    } catch {
      // Checkout remains available even if lifecycle persistence is temporarily unavailable.
    }
    const eventId = createEventId("checkout");
    safeTrackEvent("InitiateCheckout", {
      tracking_id: "copilot_enrollment",
      value: total,
      currency: "EGP",
      event_id: eventId,
      num_items: seats,
      content_ids: [COPILOT_VARIANT_ID],
      content_type: "product",
      enrollment_type: seats > 1 ? "team" : "individual",
      tier: tierFor(seats).key,
      payment_path: "now",
      lead_id: session?.leadId,
    });
    window.location.assign(checkoutUrl);
  }

  async function requestInvoice() {
    if (!session) return;
    setError("");
    try {
      await persist({ paymentPath: "invoice", invoiceRequestedAt: new Date().toISOString() });
      setInvoiceDone(true);
      safeTrackEvent("InvoiceRequested", {
        seats,
        value: total,
        currency: "EGP",
      }, { onceKey: `invoice-${session.leadId}` });
    } catch {
      setError("We couldn't request the invoice. Please try again.");
    }
  }

  async function share() {
    if (!session) return;
    setError("");
    try {
      await persist({ paymentPath: "send", payerEmail });
      const shareData = {
        title: `Microsoft Copilot Course · ${seats} seat${seats === 1 ? "" : "s"} · ${formatEGP(total)}`,
        url: checkoutUrl,
      };
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Payment link shared.");
        safeTrackEvent("PaymentLinkShared", { seats, value: total, method: "share" });
      } else {
        await navigator.clipboard.writeText(checkoutUrl);
        setShareMessage("Link copied. Paste it in an email or WhatsApp to your manager.");
        safeTrackEvent("PaymentLinkShared", { seats, value: total, method: "copy" });
      }
    } catch (shareError) {
      if (shareError instanceof EnrollmentRequestError && shareError.errors?.payerEmail) {
        setError(shareError.errors.payerEmail);
      } else {
        setError("We couldn't share the payment link. Copy it below instead.");
      }
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setShareMessage("Link copied. Paste it in an email or WhatsApp to your manager.");
      safeTrackEvent("PaymentLinkShared", { seats, value: total, method: "copy" });
    } catch {
      setShareMessage("Select and copy the payment link above.");
    }
  }

  const primary = path === "now" ? (
    <a
      aria-disabled={licenceRequired && !acknowledged}
      className="button button-submit enrollment-pay-button"
      data-copilot-track-id="copilot_pay_now"
      data-track-id="copilot_enrollment"
      href={checkoutUrl}
      onClick={pay}
    >
      Pay {formatEGP(total)} securely ↗
    </a>
  ) : path === "invoice" ? (
    <button className="button button-submit" data-track-id="copilot_invoice_request" onClick={requestInvoice} type="button">
      Request invoice for {formatEGP(total)}
    </button>
  ) : (
    <button className="button button-submit" data-track-id="copilot_share_payment_link" onClick={share} type="button">
      Share payment link
    </button>
  );

  return (
    <section className="payment-path-panel" aria-labelledby="payment-path-title">
      <h2 id="payment-path-title">How would you like to pay?</h2>
      <div className="payment-paths" role="radiogroup" aria-label="Payment path">
        <button aria-checked={path === "now"} onClick={() => select("now")} role="radio" type="button">
          <i aria-hidden="true" /><span><b>Pay online now</b>Card, Sympl 0% interest installments, Geidea or Instapay. Your seat{seats === 1 ? " is" : "s are"} confirmed right away.</span>
        </button>
        {personal ? (
          <>
            <button aria-checked={path === "invoice"} onClick={() => select("invoice")} role="radio" type="button">
              <i aria-hidden="true" /><span><b>Company invoice</b>{session?.paymentPreference === "enterprise" ? "Enterprise arrangement: we'll prepare an invoice or work with your purchase order and terms." : "Our team sends an invoice in your company's name with the rate locked in, usually within 1 working day. Purchase orders and custom terms welcome."}</span>
            </button>
            <button aria-checked={path === "send"} onClick={() => select("send")} role="radio" type="button">
              <i aria-hidden="true" /><span><b>Send to my manager to pay</b>Share this exact order and payment link with whoever approves it.</span>
            </button>
          </>
        ) : null}
      </div>
      {session?.paymentPreference === "installments" && path === "now" ? (
        <div className="enrollment-callout is-info">Choose <b>Sympl</b> at checkout to split the payment with 0% interest.</div>
      ) : null}
      {path === "send" ? (
        <div className="manager-payment-fields">
          <label htmlFor="payer-email">Manager or finance email (optional)</label>
          <input id="payer-email" onChange={(event) => setPayerEmail(event.target.value)} placeholder="finance@yourcompany.com" type="email" value={payerEmail} />
          <div className="share-link-field">
            <input aria-label="Payment link" readOnly value={checkoutUrl} />
            <button className="button button-secondary" onClick={copyLink} type="button">Copy</button>
          </div>
          {shareMessage ? <p className="save-status" role="status">{shareMessage}</p> : null}
        </div>
      ) : null}
      {licenceRequired && path === "now" ? (
        <label className="licence-acknowledgement">
          <input
            checked={acknowledged}
            onChange={async (event) => {
              setAcknowledged(event.target.checked);
              setError("");
              try { await persist({ licenceAcknowledged: event.target.checked }); } catch { /* fail open */ }
            }}
            type="checkbox"
          />
          <span>I understand a Microsoft 365 Copilot licence is required.</span>
        </label>
      ) : null}
      {invoiceDone && session ? (
        <div className="enrollment-success">Request received. We’ll email {session.email} within 1 working day.</div>
      ) : primary}
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      <p className="checkout-supporting-note">You will be able to review your order before completing payment through Meska’s secure checkout.</p>
      {showSticky ? (
        <div className="sticky-checkout-bar">
          <strong>{formatEGP(total)}</strong>
          {path === "now" ? (
            <a href={checkoutUrl} onClick={pay}>Pay securely ↗</a>
          ) : (
            <button onClick={path === "invoice" ? requestInvoice : share} type="button">
              {path === "invoice" ? "Request invoice" : "Share link"}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}
