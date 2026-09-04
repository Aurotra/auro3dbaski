"use client";

import { useEffect, useRef, useState } from "react";

export function MutedReel({
  videoUrl,
  posterUrl,
  title,
}: {
  videoUrl?: string;
  posterUrl?: string;
  title: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35, rootMargin: "80px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (inView) setActivated(true);
  }, [inView]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl || reduceMotion) return;
    if (inView) {
      el.muted = true;
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [inView, videoUrl, reduceMotion, activated]);

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-ink">
      {posterUrl ? (
        // Instagram CDN imzalı URL — next/image host listesine bağlanmaz.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 size-full object-cover pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 bg-ink-soft" />
      )}
      {videoUrl && !reduceMotion && activated ? (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover pointer-events-none"
          src={videoUrl}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
          title={title}
        />
      ) : null}
    </div>
  );
}
