import Link from "next/link";
import { notFound } from "next/navigation";
import { getTerm, glossary } from "@/data/glossary";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return glossary.map((t) => ({ konu: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ konu: string }>;
}) {
  const { konu } = await params;
  const term = getTerm(konu);
  if (!term) return {};
  return pageMeta({
    title: term.title,
    description: term.oneLiner,
    path: `/bilgi-bankasi/${term.slug}`,
  });
}

export default async function TermPage({
  params,
}: {
  params: Promise<{ konu: string }>;
}) {
  const { konu } = await params;
  const term = getTerm(konu);
  if (!term) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: term.title,
    description: term.oneLiner,
    inLanguage: "tr",
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="font-mono text-xs uppercase text-accent">{term.category}</p>
      <h1 className="mt-2 border-l-4 border-accent pl-4 font-display text-4xl text-text">
        {term.title}
      </h1>
      <p className="mt-4 text-lg text-muted">{term.oneLiner}</p>
      <section className="mt-8 space-y-4 text-muted">
        <p>
          <strong className="text-text">Ne işe yarar: </strong>
          {term.what}
        </p>
        <p>
          <strong className="text-text">Ne zaman: </strong>
          {term.when}
        </p>
        <p>
          <strong className="text-text">Bambu Studio: </strong>
          {term.bambuSetting}
        </p>
        <p>
          <strong className="text-text">Dikkat: </strong>
          {term.caveats}
        </p>
      </section>
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={term.videoHref ?? site.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md border border-accent/50 px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent-2 hover:border-accent-2"
        >
          İlgili Video
        </a>
        <Link href="/araclar" className="inline-flex items-center font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent-2">
            Araçlar
          </Link>
      </div>
    </article>
  );
}
