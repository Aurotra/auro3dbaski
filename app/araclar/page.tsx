import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Araçlar",
  description: "Filament maliyet ve geçme toleransı hesaplayıcıları.",
  path: "/araclar",
});

export default function AraclarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Araçlar
      </h1>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
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
