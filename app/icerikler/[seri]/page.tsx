import { SafeImage } from "@/components/media/safe-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IdeaForm } from "@/components/forms/idea-form";
import { MeasureLabel } from "@/components/ui/measure-label";
import { getSeries, series, seriesEpisodeCount } from "@/data/series";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

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

  return (
    <article className="mx-auto max-w-6xl px-4 py-14">
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-md border border-white/10">
        <SafeImage src={item.coverUrl} alt={item.title} fill className="object-cover" sizes="100vw" />
      </div>
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        {item.title}
      </h1>
      <div className="mt-3">
        <MeasureLabel>
          {seriesEpisodeCount(item) > 0
            ? `${seriesEpisodeCount(item)} bl.`
            : "Yeni Seri"}
        </MeasureLabel>
      </div>
      <p className="mt-4 max-w-2xl text-muted">{item.summary}</p>
      <p className="mt-8 text-muted">
        Bu serinin klipleri Instagram’da.{" "}
        <a
          href={site.instagram}
          className="text-accent-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          @auro3dbaski
        </a>
        {" · "}
        <Link href="/icerikler" className="text-accent-2">
          En çok izlenenler
        </Link>
      </p>
      <section className="mt-16">
        <h2 className="border-l-4 border-accent pl-4 font-display text-2xl text-text">
          Bir sonraki videoda ne test edelim?
        </h2>
        <IdeaForm />
      </section>
    </article>
  );
}
