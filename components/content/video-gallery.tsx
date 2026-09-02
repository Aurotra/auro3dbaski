"use client";

import Link from "next/link";
import { series } from "@/data/series";
import { type InstagramVideo } from "@/lib/instagram";
import { site } from "@/lib/site";

export function VideoGallery({ videos }: { videos: InstagramVideo[] }) {
  return (
    <>
      {videos.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((item) => (
            <li key={item.id}>
              <a
                href={item.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-md border border-white/10 bg-ink-soft"
              >
                <div className="relative mx-auto aspect-[9/16] max-w-[280px] bg-ink">
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <iframe
                      title={item.title}
                      src={item.embedUrl}
                      className="size-full border-0"
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    />
                  )}
                  <span className="absolute right-2 top-2 rounded-md bg-ink/70 px-2 py-1 font-mono text-[0.6rem] uppercase text-text">
                    Instagram
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="font-display text-lg text-text">{item.title}</h2>
                  <p className="font-mono text-xs text-accent-2">{item.viewCountLabel}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">
          Videolar Instagram’dan sıralanıyor. Token yoksa veya Instagram duvar
          çıkarırsa{" "}
          <a
            href={site.instagram}
            className="text-accent-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            @auro3dbaski
          </a>{" "}
          üzerinden izleyin.
        </p>
      )}
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
