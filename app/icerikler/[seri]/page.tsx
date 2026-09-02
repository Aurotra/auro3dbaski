import Image from "next/image";
import { notFound } from "next/navigation";
import { IdeaForm } from "@/components/forms/idea-form";
import { getSeries, series } from "@/data/series";
import { galleryVideos } from "@/data/videos";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return series.map((s) => ({ seri: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seri: string }>;
}) {
  const { seri } = await params;
  const item = getSeries(seri);
  if (!item) return {};
  return pageMeta({
    title: item.title,
    description: item.summary,
    path: `/icerikler/${item.slug}`,
  });
}

export default async function SeriPage({
  params,
}: {
  params: Promise<{ seri: string }>;
}) {
  const { seri } = await params;
  const item = getSeries(seri);
  if (!item) notFound();
  const videos = galleryVideos.filter((v) => v.seriesSlug === item.slug);

  return (
    <article className="mx-auto max-w-6xl px-4 py-14">
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-md border border-white/10">
        <Image src={item.coverUrl} alt={item.title} fill className="object-cover" sizes="100vw" />
      </div>
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        {item.title}
      </h1>
      <p className="mt-4 max-w-2xl text-muted">{item.summary}</p>
      <ol className="mt-10 grid gap-3">
        {videos.map((v, i) => (
          <li key={v.id}>
            <a
              href={v.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 rounded-md border border-white/10 bg-ink-soft p-4"
            >
              <span className="font-mono text-accent-2">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-display text-text">{v.title}</p>
                <p className="font-mono text-xs text-muted">
                  {v.platform} · {v.viewCount}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ol>
      <section className="mt-16">
        <h2 className="border-l-4 border-accent pl-4 font-display text-2xl text-text">
          Bir sonraki videoda ne test edelim?
        </h2>
        <IdeaForm />
      </section>
    </article>
  );
}
