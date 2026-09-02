import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MeasureLabel } from "@/components/ui/measure-label";
import { collabFormats, mediaKit, partners } from "@/data/content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "İşbirlikleri",
  description: "Marka ortaklıkları ve medya kiti.",
  path: "/isbirlikleri",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        İşbirlikleri
      </h1>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        {partners.map((p) => (
          <div
            key={p.id}
            className="flex h-16 w-36 items-center justify-center rounded-md border border-white/10 bg-ink-soft font-mono text-xs text-muted"
          >
            {p.name}
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">TODO: logolar</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-muted">Takipçi</p>
          <MeasureLabel className="mt-2">{mediaKit.followers}</MeasureLabel>
        </Card>
        <Card>
          <p className="text-sm text-muted">Ort. izlenme</p>
          <MeasureLabel className="mt-2">{mediaKit.avgViews}</MeasureLabel>
        </Card>
        <Card>
          <p className="text-sm text-muted">Kitle</p>
          <p className="mt-2 text-sm text-text">{mediaKit.demo}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Geçmiş</p>
          <p className="mt-2 text-sm text-text">{mediaKit.past}</p>
        </Card>
      </div>
      <ul className="mt-10 grid gap-3 md:grid-cols-2">
        {collabFormats.map((f) => (
          <li key={f.title}>
            <Card>
              <h2 className="font-display text-xl text-text">{f.title}</h2>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </Card>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled
        className="mt-8 rounded-md bg-white/10 px-4 py-2.5 font-display text-sm text-muted"
      >
        Medya Kitini İndir
      </button>
      {/* TODO: PDF eklenecek */}
      <p className="mt-6">
        <Link href="/iletisim" className="text-accent-2">
          İletişime geç
        </Link>
      </p>
    </div>
  );
}
