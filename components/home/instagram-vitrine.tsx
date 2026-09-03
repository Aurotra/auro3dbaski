"use client";

import { SafeImage } from "@/components/media/safe-image";
import { reelCards } from "@/data/reels";
import { site } from "@/lib/site";

export function InstagramVitrine() {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {reelCards.map((card) => (
          <li key={card.id}>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-md border border-white/10 bg-ink-soft"
            >
              <div className="relative aspect-[9/16]">
                <SafeImage
                  src={card.src}
                  alt={card.alt}
                  fill
                  className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 50vw, 16vw"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/50 to-transparent px-2 pb-10 pt-12 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-accent">
                  {card.title}
                </span>
                <span className="btn-glow absolute inset-x-2 bottom-2 inline-flex items-center justify-center rounded-md px-2 py-1.5 text-center font-display text-[0.7rem] font-semibold">
                  Instagram’da izle
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <a
        href={site.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-glow mt-6 inline-flex items-center justify-center rounded-md px-5 py-2.5 font-display text-sm font-semibold hover:brightness-110"
      >
        @auro3dbaski — tüm Reels
      </a>
    </div>
  );
}
