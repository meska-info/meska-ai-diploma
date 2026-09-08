"use client";

import { useEffect, useRef, useState } from "react";
import { siteContent } from "../content";
import {
  buildVerifiedAdvisorMessages,
  parseSafeAiCloserContext,
  type SafeAiCloserContext,
} from "../lib/aiCloser";
import {
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
  const [verifiedContextLoaded, setVerifiedContextLoaded] = useState(false);
  const [widgetPrepared, setWidgetPrepared] = useState(false);
  const openedThisMount = useRef(false);
  const identifiedToken = useRef<string | null>(null);
  const preparedToken = useRef<string | null>(null);
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
          return;
        }
        setIdentity(resolvedIdentity);
      })
      .catch(() => {
        // A missing or stale secure session keeps the generic advisor usable.
      });
    return () => controller.abort();
  }, [browserContext, contextResolved]);

  useEffect(() => {
    if (status !== "ready" || !identity || identifiedToken.current === identity.token) {
      return;
    }
    let active = true;
    let timer = 0;
    let attempts = 0;
    const identifyWhenInitialized = () => {
      if (!active) return;
      if (!isChatbaseInitialized()) {
        attempts += 1;
        if (attempts < 50) {
          timer = window.setTimeout(identifyWhenInitialized, 100);
        }
        return;
      }
      const chatbase = getChatbaseApi();
      if (!chatbase) return;
      try {
        chatbase("identify", {
          token: identity.token,
          name: identity.firstName,
        });
        identifiedToken.current = identity.token;
        setIdentityReady(true);
      } catch {
        // Identification failure must never break the Thank You page.
      }
    };
    identifyWhenInitialized();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [identity, status]);

  useEffect(() => {
    if (!identityReady || !identity) return;
    const controller = new AbortController();
    void fetch("/api/ai-closer/context", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return parseSafeAiCloserContext(
          await response.json(),
          identity.diplomaSlug,
        );
      })
      .then((context) => {
        if (!context) return;
        setVerifiedContext(context);
        setVerifiedContextLoaded(true);
      })
      .catch(() => {
        // The verified identity remains valid; only personalized context is skipped.
      });
    return () => controller.abort();
  }, [identity, identityReady]);

  useEffect(() => {
    if (
      !identityReady ||
      !identity ||
      !verifiedContextLoaded ||
      !verifiedContext?.leadVerified ||
      preparedToken.current === identity.token
    ) {
      return;
    }
    const chatbase = getChatbaseApi();
    if (!chatbase) return;
    try {
      chatbase.setOptions({
        initialMessages: buildVerifiedAdvisorMessages(verifiedContext),
      });
      preparedToken.current = identity.token;
      queueMicrotask(() => setWidgetPrepared(true));
    } catch {
      // Keep the normal launcher available without personalized context.
    }
  }, [identity, identityReady, verifiedContext, verifiedContextLoaded]);

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
      if (event?.type !== "user-message" || typeof content !== "string" || !content.trim()) {
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
          summary: content,
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

  useEffect(() => {
    if (!contextResolved || !shouldAutoOpenAdvisor({
      status,
      hasContext: Boolean(
        identityReady &&
          verifiedContextLoaded &&
          verifiedContext?.leadVerified &&
          widgetPrepared,
      ),
      openedThisMount: openedThisMount.current,
      storedOpenState: getAdvisorOpenState(),
    })) {
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
    contextResolved,
    identityReady,
    status,
    verifiedContext,
    verifiedContextLoaded,
    widgetPrepared,
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

  const advisorProfile = identityReady ? identity : null;
  const diplomaLabel = advisorProfile
    ? siteContent.diplomas[advisorProfile.diplomaSlug].label
    : null;
  const title = advisorProfile?.firstName
    ? `${advisorProfile.firstName}, let’s talk through your next step.`
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
