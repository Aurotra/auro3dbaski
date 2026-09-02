"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type InstagramVideo, instagramProfileEmbedUrl } from "@/lib/instagram";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

const CLIP = 8;

function InstagramPlayer({
  videos,
}: {
  videos: InstagramVideo[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const go = useCallback((next: number) => {
    setIndex((next + videos.length) % videos.length);
    setProgress(0);
  }, [videos.length]);

  const active = videos[index];
  const canNative = Boolean(active?.videoUrl);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canNative) return;
    if (paused) el.pause();
    else void el.play().catch(() => undefined);
  }, [paused, index, canNative]);

  useEffect(() => {
    if (canNative || paused) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (CLIP * 1000));
      setProgress(p);
      if (p >= 1) go(index + 1);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [canNative, paused, index, go]);

  function onTimeUpdate() {
    const el = videoRef.current;
    if (!el) return;
    setProgress(Math.min(1, el.currentTime / CLIP));
    if (el.currentTime >= CLIP) go(index + 1);
  }

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div
        className="relative aspect-[9/16] overflow-hidden rounded-md border border-white/10 bg-ink-soft"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {videos.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "absolute inset-0",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {item.videoUrl ? (
              <video
                ref={i === index ? videoRef : undefined}
                className="size-full object-cover"
                poster={item.thumbnailUrl}
                src={item.videoUrl}
                muted={muted}
                autoPlay={i === index}
                playsInline
                preload={i === index ? "metadata" : "none"}
                onTimeUpdate={i === index ? onTimeUpdate : undefined}
                aria-label={item.title}
              />
            ) : (
              <iframe
                title={item.title}
                src={item.embedUrl}
                className="size-full border-0"
                loading={i === index ? "eager" : "lazy"}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              />
            )}
          </div>
        ))}
        <a
          href={active.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-x-0 top-0 z-10 h-14"
          aria-label={`${active.title} — Instagram’da aç`}
        />
        <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-md bg-ink/70 px-2 py-1 font-mono text-[0.65rem] uppercase text-text">
          Instagram
        </span>
        {canNative ? (
          <button
            type="button"
            className="absolute left-3 top-3 z-20 rounded-md bg-ink/70 px-2 py-1 font-mono text-[0.65rem] uppercase text-text"
            onClick={() => setMuted((v) => !v)}
          >
            {muted ? "Sesi aç" : "Sesi kapat"}
          </button>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink to-transparent p-4">
          <p className="font-display text-text">{active.title}</p>
          <p className="font-mono text-xs text-accent-2">{active.viewCountLabel}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {videos.map((item, i) => (
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
  );
}

function InstagramProfileEmbed() {
  return (
    <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-md border border-white/10 bg-ink-soft">
      <iframe
        title={`${site.channelName} Instagram`}
        src={instagramProfileEmbedUrl(site.instagram)}
        className="h-[680px] w-full border-0"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
      />
    </div>
  );
}

export function TopVideosShowcase({ videos }: { videos: InstagramVideo[] }) {
  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 border-l-4 border-accent pl-4 font-display text-2xl text-text">
          En Çok İzlenenler
        </p>
        <p className="mb-6 max-w-xl text-sm text-muted">
          Instagram Reels. Sıralama izlenme sayısına göre; çekilemezse profil vitrini açılır.
        </p>
        {videos.length > 0 ? (
          <InstagramPlayer videos={videos} />
        ) : (
          <InstagramProfileEmbed />
        )}
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex font-mono text-sm text-accent-2"
        >
          Tümünü Instagram’da izle →
        </a>
      </div>
    </section>
  );
}
