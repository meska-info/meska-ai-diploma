"use client";

import { useEffect } from "react";
import {
  CHATBASE_AGENT_ID,
  CHATBASE_SCRIPT_SRC,
  isChatbaseInitialized,
  setChatbaseStatus,
} from "../lib/chatbase";

const LOAD_TIMEOUT_MS = 12_000;

export function ChatbaseWidget() {
  useEffect(() => {
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
    const handleWindowLoad = () => queueMicrotask(observeEmbedScript);
    window.addEventListener("load", handleWindowLoad, { once: true });
    observeEmbedScript();

    return () => {
      window.clearTimeout(loadTimeout);
      mutationObserver.disconnect();
      window.removeEventListener("load", handleWindowLoad);
      observedScript?.removeEventListener("load", handleLoad);
      observedScript?.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
