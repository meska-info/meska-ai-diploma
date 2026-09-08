"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { siteContent } from "../content";
import {
  ADVISOR_AUTO_OPEN_DEADLINE_MS,
  AI_CLOSER_POLL_INTERVAL_MS,
  AI_CLOSER_POLL_MAX_MS,
  buildVerifiedAdvisorMessages,
  isPendingOfferState,
  parseSafeAiCloserContext,
  redactSalesText,
  type SafeAiCloserContext,
} from "../lib/aiCloser";
import {
  buildAdvisorInitialMessages,
  CHATBASE_STATUS_EVENT,
  type ChatbaseUserMessageEvent,
  type ChatbaseStatus,
  type DiplomaAdvisorContext,
  getAdvisorOpenState,
  getChatbaseApi,
  getChatbaseStatus,
  isChatbaseInitialized,
  markAdvisorOpenState,
  resolveDiplomaAdvisorContext,
  setChatbaseStatus,
  shouldAutoOpenAdvisor,
} from "../lib/chatbase";

type AdvisorIdentity = {
  token: string;
  firstName?: string;
  diplomaSlug: "offline" | "online";
};

const USER_MESSAGE_STARTED_KEY = "meska_chatbase_user_message_started_v1";
const IDENTIFY_POLL_INTERVAL_MS = 100;
const IDENTIFY_MAX_ATTEMPTS = 50;

function parseAdvisorIdentity(value: unknown): AdvisorIdentity | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (
    typeof record.token !== "string" ||
    record.token.length < 40 ||
    record.token.length > 4096 ||
    (record.diplomaSlug !== "offline" && record.diplomaSlug !== "online")
  ) {
    return null;
  }
  const firstName =
    typeof record.firstName === "string"
      ? record.firstName.trim().slice(0, 60) || undefined
      : undefined;
  return { token: record.token, firstName, diplomaSlug: record.diplomaSlug };
}

function createChatEventId() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `chat-${random}`;
}

export function DiplomaAdvisor() {
  const [status, setStatus] = useState<ChatbaseStatus>("loading");
  const [browserContext, setBrowserContext] =
    useState<DiplomaAdvisorContext | null>(null);
  const [contextResolved, setContextResolved] = useState(false);
  const [identity, setIdentity] = useState<AdvisorIdentity | null>(null);
  const [identityReady, setIdentityReady] = useState(false);
  const [verifiedContext, setVerifiedContext] =
    useState<SafeAiCloserContext | null>(null);
  // Personalization is "settled" once the verified offer is known, or once we
  // know it will never arrive. The auto-open must never wait on it forever.
  const [personalizationSettled, setPersonalizationSettled] = useState(false);
  const [autoOpenDeadlineReached, setAutoOpenDeadlineReached] = useState(false);
  const openedThisMount = useRef(false);
  const identifiedToken = useRef<string | null>(null);
  const preparedMessages = useRef<string | null>(null);
  const userMessageStarted = useRef(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setStatus(getChatbaseStatus());
      setBrowserContext(resolveDiplomaAdvisorContext());
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

  useEffect(() => {
    const timer = window.setTimeout(
      () => setAutoOpenDeadlineReached(true),
      ADVISOR_AUTO_OPEN_DEADLINE_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!contextResolved || !browserContext) return;
    const controller = new AbortController();
    void fetch("/api/chatbase-session", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return parseAdvisorIdentity(await response.json());
      })
      .then((resolvedIdentity) => {
        if (
          !resolvedIdentity ||
          resolvedIdentity.diplomaSlug !== browserContext.diplomaSlug
        ) {
          setPersonalizationSettled(true);
          return;
        }
        setIdentity(resolvedIdentity);
      })
      .catch(() => {
        // A missing or stale secure session keeps the generic advisor usable.
        setPersonalizationSettled(true);
      });
    return () => controller.abort();
  }, [browserContext, contextResolved]);

  useEffect(() => {
    if (
      status !== "ready" ||
      !identity ||
      identifiedToken.current === identity.token
    ) {
      return;
    }
    let active = true;
    let timer = 0;
    let attempts = 0;
    const identifyWhenInitialized = () => {
      if (!active) return;
      if (!isChatbaseInitialized()) {
        attempts += 1;
        if (attempts < IDENTIFY_MAX_ATTEMPTS) {
          timer = window.setTimeout(
            identifyWhenInitialized,
            IDENTIFY_POLL_INTERVAL_MS,
          );
        } else {
          setPersonalizationSettled(true);
        }
        return;
      }
      const chatbase = getChatbaseApi();
      if (!chatbase) {
        setPersonalizationSettled(true);
        return;
      }
      try {
        chatbase("identify", {
          token: identity.token,
          name: identity.firstName,
        });
        identifiedToken.current = identity.token;
        setIdentityReady(true);
      } catch {
        // Identification failure must never break the Thank You page.
        setPersonalizationSettled(true);
      }
    };
    identifyWhenInitialized();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [identity, status]);

  // The Shopify offer is created asynchronously right after the lead is stored,
  // so the first read usually returns `offer_pending`. Keep polling until the
  // offer reaches a terminal state so the auto-open can carry the real code.
  useEffect(() => {
    if (!identityReady || !identity) return;
    const controller = new AbortController();
    const startedAt = Date.now();
    let cancelled = false;
    let timer = 0;

    const load = async (): Promise<void> => {
      if (cancelled) return;
      let context: SafeAiCloserContext | null = null;
      try {
        const response = await fetch("/api/ai-closer/context", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (response.ok) {
          context = parseSafeAiCloserContext(
            await response.json(),
            identity.diplomaSlug,
          );
        }
      } catch {
        // The verified identity stays valid; only personalization is skipped.
      }
      if (cancelled) return;
      if (context) setVerifiedContext(context);
      if (
        isPendingOfferState(context) &&
        Date.now() - startedAt + AI_CLOSER_POLL_INTERVAL_MS <=
          AI_CLOSER_POLL_MAX_MS
      ) {
        timer = window.setTimeout(() => {
          void load();
        }, AI_CLOSER_POLL_INTERVAL_MS);
        return;
      }
      setPersonalizationSettled(true);
    };

    void load();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [identity, identityReady]);

  const initialMessages = useMemo(() => {
    if (verifiedContext?.leadVerified) {
      return buildVerifiedAdvisorMessages(verifiedContext);
    }
    return browserContext ? buildAdvisorInitialMessages(browserContext) : null;
  }, [browserContext, verifiedContext]);

  // Declared before the auto-open effect so the widget always carries the best
  // available copy by the time it is opened.
  useEffect(() => {
    if (status !== "ready" || !initialMessages) return;
    const signature = initialMessages.join(" ");
    if (preparedMessages.current === signature) return;
    const chatbase = getChatbaseApi();
    if (!chatbase) return;
    try {
      chatbase.setOptions({ initialMessages });
      preparedMessages.current = signature;
    } catch {
      // Keep the normal launcher available without personalized context.
    }
  }, [initialMessages, status]);

  useEffect(() => {
    if (!identityReady) return;
    const chatbase = getChatbaseApi();
    if (!chatbase) return;
    try {
      userMessageStarted.current =
        window.sessionStorage.getItem(USER_MESSAGE_STARTED_KEY) === "1";
    } catch {
      userMessageStarted.current = false;
    }

    const handleUserMessage = (event: ChatbaseUserMessageEvent) => {
      const content = event?.data?.content;
      if (
        event?.type !== "user-message" ||
        typeof content !== "string" ||
        !content.trim()
      ) {
        return;
      }
      const eventType = userMessageStarted.current
        ? "chat_message"
        : "chat_started";
      userMessageStarted.current = true;
      try {
        window.sessionStorage.setItem(USER_MESSAGE_STARTED_KEY, "1");
      } catch {
        // The in-memory guard still prevents duplicate chat_started events.
      }
      void fetch("/api/ai-closer/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          event: eventType,
          eventId: createChatEventId(),
          occurredAt: new Date().toISOString(),
          // Contact details a visitor retypes in chat are masked before they
          // ever leave the browser.
          summary: redactSalesText(content),
        }),
      }).catch(() => {
        // Sales-event delivery must not interrupt the conversation.
      });
    };

    try {
      chatbase.addEventListener("user-message", handleUserMessage);
    } catch {
      return;
    }
    return () => {
      try {
        chatbase.removeEventListener("user-message", handleUserMessage);
      } catch {
        // The widget may already have been removed during route cleanup.
      }
    };
  }, [identityReady]);

  // Nothing to personalize, or a widget that never loaded, counts as settled
  // too: the auto-open must not stall waiting on data that cannot arrive.
  const personalizationResolved =
    personalizationSettled ||
    status === "unavailable" ||
    (contextResolved && !browserContext);

  useEffect(() => {
    if (!contextResolved) return;
    if (
      !shouldAutoOpenAdvisor({
        status,
        hasContext:
          Boolean(browserContext) &&
          (personalizationResolved || autoOpenDeadlineReached),
        openedThisMount: openedThisMount.current,
        storedOpenState: getAdvisorOpenState(),
      })
    ) {
      return;
    }

    try {
      const chatbase = getChatbaseApi();
      if (!chatbase) return;
      chatbase.open();
      openedThisMount.current = true;
      markAdvisorOpenState("automatic");
    } catch {
      setChatbaseStatus("unavailable");
    }
  }, [
    autoOpenDeadlineReached,
    browserContext,
    contextResolved,
    personalizationResolved,
    status,
  ]);

  const openAdvisor = () => {
    if (status !== "ready") return;
    openedThisMount.current = true;
    markAdvisorOpenState("manual");
    try {
      const chatbase = getChatbaseApi();
      if (!chatbase) {
        setStatus("unavailable");
        return;
      }
      chatbase.open();
    } catch {
      setStatus("unavailable");
    }
  };

  const verifiedProfile = identityReady ? identity : null;
  const advisorDiplomaSlug =
    verifiedProfile?.diplomaSlug ?? browserContext?.diplomaSlug ?? null;
  const advisorFirstName =
    verifiedProfile?.firstName ?? browserContext?.firstName ?? null;
  const diplomaLabel = advisorDiplomaSlug
    ? siteContent.diplomas[advisorDiplomaSlug].label
    : null;
  const title = advisorFirstName
    ? `${advisorFirstName}, let’s talk through your next step.`
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
