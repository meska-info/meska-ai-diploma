"use client";

import { useEffect, useRef } from "react";

const STREAM_CUSTOMER_CODE = "27axu7xjwelxbgon";

type StreamPlayer = {
  addEventListener: (event: "play", listener: () => void) => void;
  autoplay: boolean;
  muted: boolean;
  pause: () => void;
  play: () => Promise<void>;
};

declare global {
  interface Window {
    Stream?: (iframe: HTMLIFrameElement) => StreamPlayer;
  }
}

const activePlayers = new Set<StreamPlayer>();

export function CloudflareStreamVideo({
  autoplay = false,
  className = "",
  loading = "lazy",
  onFirstPlay,
  title,
  videoId,
}: {
  autoplay?: boolean;
  className?: string;
  loading?: "eager" | "lazy";
  onFirstPlay?: () => void;
  title: string;
  videoId: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const played = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timeout: number | undefined;
    let player: StreamPlayer | undefined;
    let removeInteractionFallback: (() => void) | undefined;

    const connect = () => {
      const iframe = iframeRef.current;
      if (cancelled || !iframe) return;
      if (!window.Stream) {
        timeout = window.setTimeout(connect, 150);
        return;
      }

      player = window.Stream(iframe);
      activePlayers.add(player);
      player.addEventListener("play", () => {
        activePlayers.forEach((other) => {
          if (other !== player) other.pause();
        });
        if (!played.current) {
          played.current = true;
          onFirstPlay?.();
        }
      });

      if (autoplay) {
        player.autoplay = true;
        player.muted = false;
        void player.play().catch(() => {
          if (cancelled || !player) return;
          player.muted = true;
          void player.play().catch(() => undefined);

          const enableAudio = () => {
            removeInteractionFallback?.();
            if (cancelled || !player) return;
            player.muted = false;
            void player.play().catch(() => undefined);
          };
          document.addEventListener("pointerdown", enableAudio, {
            capture: true,
            once: true,
          });
          document.addEventListener("keydown", enableAudio, {
            capture: true,
            once: true,
          });
          removeInteractionFallback = () => {
            document.removeEventListener("pointerdown", enableAudio, true);
            document.removeEventListener("keydown", enableAudio, true);
          };
        });
      }
    };

    connect();
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
      removeInteractionFallback?.();
      if (player) activePlayers.delete(player);
    };
  }, [autoplay, onFirstPlay]);

  const parameters = new URLSearchParams();
  if (autoplay) {
    parameters.set("autoplay", "true");
    parameters.set("preload", "auto");
  }

  return (
    <iframe
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      className={`cloudflare-stream-player ${className}`.trim()}
      loading={loading}
      ref={iframeRef}
      src={`https://customer-${STREAM_CUSTOMER_CODE}.cloudflarestream.com/${videoId}/iframe${parameters.size ? `?${parameters.toString()}` : ""}`}
      title={title}
    />
  );
}
