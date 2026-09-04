import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { MeasureLabel } from "@/components/ui/measure-label";
import { SeriesCover } from "@/components/content/series-cover";
import { MutedReel } from "@/components/media/muted-reel";
import { series, seriesEpisodeCount } from "@/data/series";
import { site } from "@/lib/site";
import type { InstagramVideo } from "@/lib/instagram";

export function SeriesGrid({ videos }: { videos: InstagramVideo[] }) {
  const reels = videos.filter((item) => item.videoUrl || item.permalink);

  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Seriler">Ne anlatıyoruz</SectionHeading>
        {reels.length > 0 ? (
          <>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reels.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-md border border-white/10 bg-ink-soft transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[3/4]">
                      <MutedReel
                        videoUrl={item.videoUrl}
                        posterUrl={item.thumbnailUrl}
                        title={item.title}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 font-display text-xl leading-snug text-text line-clamp-2">
                          {item.title}
                        </h3>
                        <MeasureLabel className="shrink-0">Instagram</MeasureLabel>
                      </div>
                      <p className="mt-2 text-sm text-muted">{item.viewCountLabel}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex font-mono text-sm text-accent-2"
            >
              @auro3dbaski — tüm Reels
            </a>
          </>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((item) => {
              const count = seriesEpisodeCount(item);
              return (
                <li key={item.slug}>
                  <Link
                    href={`/icerikler/${item.slug}`}
                    className="block overflow-hidden rounded-md border border-white/10 bg-ink-soft transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[4/3]">
                      <SeriesCover
                        src={item.coverUrl}
                        title={item.title}
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-xl text-text">{item.title}</h3>
                        <MeasureLabel>
                          {count > 0 ? `${count} bl.` : "Yeni Seri"}
                        </MeasureLabel>
                      </div>
                      <p className="mt-2 text-sm text-muted">{item.summary}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
