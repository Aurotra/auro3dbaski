"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { series } from "@/data/series";
import { galleryVideos } from "@/data/videos";
import { cn } from "@/lib/cn";

export function VideoGallery() {
  const [slug, setSlug] = useState<string>("all");
  const list = useMemo(
    () =>
      slug === "all"
        ? galleryVideos
        : galleryVideos.filter((v) => v.seriesSlug === slug),
    [slug],
  );

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Chip active={slug === "all"} onClick={() => setSlug("all")}>
          Tümü
        </Chip>
        {series.map((s) => (
          <Chip key={s.slug} active={slug === s.slug} onClick={() => setSlug(s.slug)}>
            {s.title}
          </Chip>
        ))}
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => (
          <li key={item.id}>
            <a
              href={item.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md border border-white/10 bg-ink-soft"
            >
              <div className="relative mx-auto aspect-[9/16] max-w-[280px]">
                <Image src={item.posterUrl} alt={item.title} fill className="object-cover" sizes="280px" />
                <span className="absolute right-2 top-2 rounded-md bg-ink/70 px-2 py-1 font-mono text-[0.6rem] uppercase text-text">
                  {item.platform}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-display text-lg text-text">{item.title}</h2>
                <p className="font-mono text-xs text-accent-2">{item.viewCount}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">
        Seri sayfaları:{" "}
        {series.map((s) => (
          <Link key={s.slug} href={`/icerikler/${s.slug}`} className="mr-2 text-accent-2">
            {s.title}
          </Link>
        ))}
      </p>
    </>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em]",
        active ? "border-accent bg-accent text-ink" : "border-white/15 text-muted",
      )}
    >
      {children}
    </button>
  );
}
