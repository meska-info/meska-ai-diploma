"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteContent } from "../content";
import {
  buildAdvisorInitialMessages,
  CHATBASE_STATUS_EVENT,
  type ChatbaseStatus,
  type DiplomaAdvisorContext,
  getAdvisorOpenState,
  getChatbaseApi,
  getChatbaseStatus,
  markAdvisorOpenState,
  resolveDiplomaAdvisorContext,
  setChatbaseStatus,
  shouldAutoOpenAdvisor,
} from "../lib/chatbase";

export function DiplomaAdvisor() {
  const [status, setStatus] = useState<ChatbaseStatus>("loading");
  const [context, setContext] = useState<DiplomaAdvisorContext | null>(null);
  const [contextResolved, setContextResolved] = useState(false);
  const openedThisMount = useRef(false);
  const preparedLeadId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setStatus(getChatbaseStatus());
      setContext(resolveDiplomaAdvisorContext());
      setContextResolved(true);
    });

    const handleStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ status?: ChatbaseStatus }>).detail;
      if (
        detail?.status === "loading" ||
        detail?.status === "ready" ||
        detail?.status === "unavailable"
      ) {
        setStatus(detail.status);
      }
    };
    window.addEventListener(CHATBASE_STATUS_EVENT, handleStatus);
    return () => {
      active = false;
      window.removeEventListener(CHATBASE_STATUS_EVENT, handleStatus);
    };
  }, []);

  const prepareWidget = useCallback(() => {
    const chatbase = getChatbaseApi();
    if (!chatbase) return undefined;
    if (context && preparedLeadId.current !== context.leadId) {
      chatbase.setOptions({
        initialMessages: buildAdvisorInitialMessages(context),
      });
      preparedLeadId.current = context.leadId;
    }
    return chatbase;
  }, [context]);

  useEffect(() => {
    if (!contextResolved || !shouldAutoOpenAdvisor({
      status,
      hasContext: Boolean(context),
      openedThisMount: openedThisMount.current,
      storedOpenState: getAdvisorOpenState(),
    })) {
      return;
    }

    try {
      const chatbase = prepareWidget();
      if (!chatbase) return;
      chatbase.open();
      openedThisMount.current = true;
      markAdvisorOpenState("automatic");
    } catch {
      setChatbaseStatus("unavailable");
    }
  }, [context, contextResolved, prepareWidget, status]);

  const openAdvisor = () => {
    if (status !== "ready") return;
    openedThisMount.current = true;
    markAdvisorOpenState("manual");
    try {
      const chatbase = prepareWidget();
      if (!chatbase) {
        setStatus("unavailable");
        return;
      }
      chatbase.open();
    } catch {
      setStatus("unavailable");
    }
  };

  const diplomaLabel = context
    ? siteContent.diplomas[context.diplomaSlug].label
    : null;
  const title = context?.firstName
    ? `${context.firstName}, let’s talk through your next step.`
    : "Talk through your next step with a Meska advisor.";
  const statusCopy =
    status === "ready"
      ? "Your advisor is ready when you are."
      : status === "unavailable"
        ? "The advisor is unavailable right now. Your confirmation and next steps are still available below."
        : "Preparing your advisor…";

  return (
    <aside
      aria-labelledby="diploma-advisor-title"
      className="diploma-advisor"
      data-chatbase-status={status}
    >
      <div className="diploma-advisor-grid" aria-hidden="true" />
      <div className="diploma-advisor-copy">
        <p className="eyebrow"><span aria-hidden="true" /> Meska advisor</p>
        <h2 id="diploma-advisor-title">{title}</h2>
        <p>
          Ask about fit, format, schedule, payment options, and what happens before
          enrollment.
        </p>
        {diplomaLabel ? (
          <p className="diploma-advisor-selection">
            <span>Selected format</span>
            <strong>{diplomaLabel}</strong>
          </p>
        ) : null}
      </div>

      <ul className="diploma-advisor-topics" aria-label="Topics your advisor can help with">
        <li><span aria-hidden="true">01</span> Compare the learning formats</li>
        <li><span aria-hidden="true">02</span> Check the schedule and commitment</li>
        <li><span aria-hidden="true">03</span> Understand enrollment and payment</li>
      </ul>

      <div className="diploma-advisor-action">
        <button
          aria-label="Open the Meska Diploma advisor"
          className="button diploma-advisor-button"
          disabled={status !== "ready"}
          onClick={openAdvisor}
          type="button"
        >
          Open advisor <span aria-hidden="true">↗</span>
        </button>
        <p aria-live="polite" role="status">{statusCopy}</p>
      </div>
    </aside>
  );
}
