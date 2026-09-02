"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

function skipBackgroundVideo(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }
  const connection = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
  if (connection?.saveData) return true;
  const type = connection?.effectiveType;
  return type === "slow-2g" || type === "2g";
}

export function LoopVideo({
  src,
  poster,
  className,
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  poster: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (skipBackgroundVideo()) return;
    const node = wrapRef.current;
    if (!node) return;

    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;

    const begin = () => {
      if (cancelled) return;
      const run = () => {
        if (!cancelled) setActiveSrc(src);
      };
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(run, { timeout: 2000 });
      } else {
        timeoutId = window.setTimeout(run, 1);
      }
    };

    const arm = () => {
      if (document.readyState === "complete") begin();
      else window.addEventListener("load", begin, { once: true });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          arm();
        }
      },
      { rootMargin: "160px" },
    );
    io.observe(node);

    return () => {
      cancelled = true;
      io.disconnect();
      window.removeEventListener("load", begin);
      if (idleId) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [src]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !activeSrc) return;
    el.muted = true;
    const markPlaying = () => setPlaying(true);
    const play = () => {
      void el.play().catch(() => {
        /* autoplay kesilirse poster kalır */
      });
    };
    el.addEventListener("playing", markPlaying);
    el.addEventListener("canplay", play);
    play();
    return () => {
      el.removeEventListener("playing", markPlaying);
      el.removeEventListener("canplay", play);
    };
  }, [activeSrc]);

  return (
    <div ref={wrapRef} className={cn("relative size-full overflow-hidden", className)}>
      <Image
        src={poster}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
      {activeSrc ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            playing ? "opacity-100" : "opacity-0",
          )}
          src={activeSrc}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
