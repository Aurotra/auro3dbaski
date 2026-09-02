"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function LoopVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAutoPlay(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    if (!autoPlay) {
      el.pause();
      return;
    }
    const play = () => {
      void el.play().catch(() => {
        /* tarayıcı autoplay keserse poster kalır */
      });
    };
    play();
    el.addEventListener("canplay", play);
    return () => el.removeEventListener("canplay", play);
  }, [autoPlay, src]);

  return (
    <video
      ref={ref}
      className={cn("size-full object-cover", className)}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
