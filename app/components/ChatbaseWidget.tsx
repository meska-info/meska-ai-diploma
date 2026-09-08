"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  CHATBASE_AGENT_ID,
  CHATBASE_EMBED_SCRIPT,
  CHATBASE_SCRIPT_SRC,
  isChatbaseInitialized,
  isChatbaseRoute,
  setChatbaseStatus,
} from "../lib/chatbase";

const CHATBASE_BOOTSTRAP_SCRIPT_ID = "meska-chatbase-thank-you-bootstrap";
const LOAD_TIMEOUT_MS = 12_000;

function removeChatbaseRuntime() {
  if (isChatbaseInitialized()) {
    try {
      window.chatbase?.close();
    } catch {
      // Route cleanup must continue even if the widget API is unavailable.
    }
  }

  document.getElementById(CHATBASE_BOOTSTRAP_SCRIPT_ID)?.remove();
  document.getElementById(CHATBASE_AGENT_ID)?.remove();
  document
    .querySelectorAll<HTMLElement>('[id^="chatbase-"]')
    .forEach((element) => element.remove());

  delete window.chatbase;
  delete window.__MESKA_CHATBASE_STATUS__;
  delete document.documentElement.dataset.chatbaseStatus;
}

export function ChatbaseWidget() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isChatbaseRoute(pathname)) {
      removeChatbaseRuntime();
      return;
    }

    setChatbaseStatus("loading");
    let settled = false;
    let observedScript: HTMLScriptElement | null = null;
    const settle = (status: "ready" | "unavailable") => {
      if (settled) return;
      settled = true;
      window.clearTimeout(loadTimeout);
      setChatbaseStatus(status);
    };
    const handleLoad = () => {
      if (observedScript) {
        observedScript.dataset.meskaChatbaseLoaded = "true";
      }
      settle("ready");
    };
    const handleError = () => settle("unavailable");
    const loadTimeout = window.setTimeout(
      () => settle("unavailable"),
      LOAD_TIMEOUT_MS,
    );

    const observeEmbedScript = () => {
      if (settled) return;
      if (isChatbaseInitialized()) {
        handleLoad();
        return;
      }

      const candidate = document.getElementById(CHATBASE_AGENT_ID);
      if (!(candidate instanceof HTMLScriptElement)) return;
      if (candidate.src !== CHATBASE_SCRIPT_SRC) {
        handleError();
        return;
      }
      if (candidate === observedScript) return;

      observedScript = candidate;
      if (candidate.dataset.meskaChatbaseLoaded === "true") {
        handleLoad();
        return;
      }
      candidate.addEventListener("load", handleLoad, { once: true });
      candidate.addEventListener("error", handleError, { once: true });
    };

    const mutationObserver = new MutationObserver(observeEmbedScript);
    mutationObserver.observe(document.body, { childList: true });
    observeEmbedScript();

    if (!settled && !document.getElementById(CHATBASE_AGENT_ID)) {
      const bootstrapScript = document.createElement("script");
      bootstrapScript.id = CHATBASE_BOOTSTRAP_SCRIPT_ID;
      bootstrapScript.textContent = CHATBASE_EMBED_SCRIPT;
      document.body.appendChild(bootstrapScript);
      observeEmbedScript();
    }

    return () => {
      window.clearTimeout(loadTimeout);
      mutationObserver.disconnect();
      observedScript?.removeEventListener("load", handleLoad);
      observedScript?.removeEventListener("error", handleError);
      removeChatbaseRuntime();
    };
  }, [pathname]);

  return null;
}
