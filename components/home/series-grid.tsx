import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { MeasureLabel } from "@/components/ui/measure-label";
import { SafeImage } from "@/components/media/safe-image";
import { series, seriesEpisodeCount } from "@/data/series";

export function SeriesGrid() {
  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Seriler">Ne anlatıyoruz</SectionHeading>
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
                    <SafeImage
                      src={item.coverUrl}
                      alt={`${item.title} kapak görseli`}
                      fill
                      className="object-cover"
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
      </div>
    </section>
  );
}
