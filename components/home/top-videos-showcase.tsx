"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { showcaseVideos } from "@/data/videos";
import { cn } from "@/lib/cn";

const CLIP = 5;

export function TopVideosShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [dir, setDir] = useState<"next" | "instant">("next");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (next: number) => {
      setDir(reduceMotion ? "instant" : "next");
      setIndex((next + showcaseVideos.length) % showcaseVideos.length);
      setProgress(0);
    },
    [reduceMotion],
  );

  const active = showcaseVideos[index];
  const nextVideo = showcaseVideos[(index + 1) % showcaseVideos.length];

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (paused) el.pause();
    else void el.play().catch(() => undefined);
  }, [paused, index]);

  function onTimeUpdate() {
    const el = videoRef.current;
    if (!el) return;
    setProgress(Math.min(1, el.currentTime / CLIP));
    if (el.currentTime >= CLIP) {
      go(index + 1);
    }
  }

  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 border-l-4 border-accent pl-4 font-display text-2xl text-text">
          En Çok İzlenenler
        </p>
        <div className="mx-auto w-full max-w-[360px]">
          <div
            className="relative aspect-[9/16] overflow-hidden rounded-md border border-white/10 bg-ink-soft"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerCancel={() => setPaused(false)}
          >
            {showcaseVideos.map((item, i) => (
              <video
                key={item.id}
                ref={i === index ? videoRef : undefined}
                className={cn(
                  "absolute inset-0 size-full object-cover",
                  dir === "instant"
                    ? ""
                    : "transition-[transform,opacity] duration-[400ms] ease-out",
                  i === index
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none translate-x-8 opacity-0",
                )}
                poster={item.posterUrl}
                muted={muted}
                autoPlay={i === index}
                playsInline
                preload={i === index || item.id === nextVideo.id ? "metadata" : "none"}
                onTimeUpdate={i === index ? onTimeUpdate : undefined}
                onPlay={(e) => {
                  if (paused) e.currentTarget.pause();
                }}
                aria-label={item.title}
              >
                <source src={item.videoUrl} type="video/mp4" />
              </video>
            ))}
            <a
              href={active.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-10"
              aria-label={`${active.title} — platformda aç`}
            />
            <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-md bg-ink/70 px-2 py-1 font-mono text-[0.65rem] uppercase text-text">
              {active.platform}
            </span>
            <button
              type="button"
              className="absolute left-3 top-3 z-20 rounded-md bg-ink/70 px-2 py-1 font-mono text-[0.65rem] uppercase text-text"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMuted((v) => !v);
              }}
            >
              {muted ? "Sesi aç" : "Sesi kapat"}
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink to-transparent p-4">
              <p className="font-display text-text">{active.title}</p>
              <p className="font-mono text-xs text-accent-2">{active.viewCount}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            {showcaseVideos.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.title}
                className="h-1 flex-1 overflow-hidden rounded-sm bg-white/15"
                onClick={() => go(i)}
              >
                <span
                  className="block h-full bg-accent"
                  style={{
                    width: i === index ? `${progress * 100}%` : i < index ? "100%" : "0%",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
