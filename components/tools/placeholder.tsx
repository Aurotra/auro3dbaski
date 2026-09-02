import Link from "next/link";

export function ToolPlaceholder({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Yakında</p>
      <h1 className="mt-3 border-l-4 border-accent pl-4 font-display text-4xl text-text">
        {title}
      </h1>
      <p className="mt-4 text-muted">{body}</p>
      <p className="mt-4 text-sm text-muted">
        Çıktı STL olarak indirilecek; ilgili video ve baskı notu buraya gelecek.
      </p>
      <p className="mt-2 text-sm text-muted">TODO: ilgili video linki</p>
      <Link href="/araclar" className="mt-8 inline-block text-accent-2">
        Tüm araçlar
      </Link>
    </article>
  );
}
