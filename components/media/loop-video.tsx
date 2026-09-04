"use client";

import { SafeImage } from "@/components/media/safe-image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function LoopVideo({
  src,
  poster,
  className,
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  poster?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) return;
    el.muted = true;
    const play = () => {
      void el.play().catch(() => {
        /* autoplay kesilirse poster kalır */
      });
    };
    el.addEventListener("canplay", play);
    if (el.readyState >= 2) play();
    return () => el.removeEventListener("canplay", play);
  }, [reduceMotion, src]);

  return (
    <div className={cn("overflow-hidden", className)}>
      {poster ? (
        <SafeImage
          src={poster}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-ink-soft" />
      )}
      {reduceMotion ? null : (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload={priority ? "auto" : "metadata"}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
