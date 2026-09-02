import Link from "next/link";
import { tools } from "@/data/content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Araçlar",
  description: "Tül Atölyesi, şehir haritası, çanta stüdyo ve hesaplayıcılar.",
  path: "/araclar",
});

export default function AraclarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Araçlar
      </h1>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link
              href={t.href}
              className="block rounded-md border border-white/10 bg-ink-soft p-5"
            >
              <p className="font-mono text-xs uppercase text-accent">Yakında</p>
              <h2 className="mt-2 font-display text-2xl text-text">{t.title}</h2>
              <p className="mt-2 text-sm text-muted">{t.summary}</p>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/araclar/hesaplayicilar"
            className="block rounded-md border border-accent/40 bg-ink-soft p-5"
          >
            <p className="font-mono text-xs uppercase text-accent-2">Hazır</p>
            <h2 className="mt-2 font-display text-2xl text-text">Hesaplayıcılar</h2>
            <p className="mt-2 text-sm text-muted">
              Filament maliyet ve geçme toleransı.
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
