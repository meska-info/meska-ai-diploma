"use client";

import { useEffect, useRef } from "react";

const STREAM_CUSTOMER_CODE = "27axu7xjwelxbgon";

type StreamPlayer = {
  addEventListener: (event: "play", listener: () => void) => void;
  pause: () => void;
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
    };

    connect();
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
      if (player) activePlayers.delete(player);
    };
  }, [onFirstPlay]);

  const parameters = new URLSearchParams();
  if (autoplay) {
    parameters.set("autoplay", "true");
    parameters.set("muted", "true");
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
