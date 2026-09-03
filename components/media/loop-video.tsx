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
  poster: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) {
      setPlaying(false);
      return;
    }
    el.muted = true;
    const markPlaying = () => setPlaying(true);
    const play = () => {
      void el.play().then(markPlaying).catch(() => {
        /* autoplay kesilirse poster kalır */
      });
    };
    el.addEventListener("playing", markPlaying);
    el.addEventListener("canplay", play);
    if (!el.paused && el.readyState >= 2) markPlaying();
    else play();
    return () => {
      el.removeEventListener("playing", markPlaying);
      el.removeEventListener("canplay", play);
    };
  }, [reduceMotion, src]);

  return (
    <div className={cn("overflow-hidden", className)}>
      <SafeImage
        src={poster}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
      {reduceMotion ? null : (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            playing ? "opacity-100" : "opacity-0",
          )}
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
