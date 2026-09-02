import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: `Auro 3D Baskı iletişim. ${site.location}. ${site.email} · ${site.instagramHandle}`,
};

export default function IletisimPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-cyan">
        İletişim
      </p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-bone">
        Atölye açık
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
        Baskı, iş birliği, filament incelemesi. Kısa yaz, net dönelim.
      </p>
      <dl className="mt-12 grid gap-8 sm:grid-cols-2">
        <div className="border border-line bg-bed p-6">
          <dt className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            E-posta
          </dt>
          <dd className="mt-3">
            <a href={`mailto:${site.email}`} className="text-xl text-lime hover:text-cyan">
              {site.email}
            </a>
          </dd>
        </div>
        <div className="border border-line bg-bed p-6">
          <dt className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            Instagram
          </dt>
          <dd className="mt-3">
            <a href={site.instagram} className="text-xl text-lime hover:text-cyan">
              {site.instagramHandle}
            </a>
          </dd>
        </div>
        <div className="border border-line bg-bed p-6">
          <dt className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            Konum
          </dt>
          <dd className="mt-3 text-xl text-bone">{site.location}</dd>
        </div>
        <div className="border border-line bg-bed p-6">
          <dt className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            Teklif
          </dt>
          <dd className="mt-3">
            <Link href="/teklif" className="text-xl text-lime hover:text-cyan">
              auro3dbaski.com/teklif
            </Link>
          </dd>
        </div>
      </dl>
    </article>
  );
}
