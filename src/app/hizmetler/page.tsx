import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "Prototip, seri FDM, slicer ayarı ve marka iş birliği. Auro 3D Baskı atölye hizmetleri.",
};

export default function HizmetlerPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-cyan">
        Hizmetler
      </p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-bone">
        Üretim masası
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist">
        Endüstriyel ve masaüstü FDM. Tek parça da olur, kısa seri de. Amaç aynı:
        parça elde, ölçü tutar, teslim net.
      </p>
      <ol className="mt-14 grid gap-6">
        {services.map((service) => (
          <li
            key={service.slug}
            className="grid gap-4 border border-line bg-bed p-8 md:grid-cols-[5rem_1fr]"
          >
            <p className="font-mono text-sm text-lime">{service.layer}</p>
            <div>
              <h2 className="font-display text-3xl text-bone">{service.title}</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-mist">
                {service.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href="/teklif"
        className="mt-12 inline-block bg-lime px-5 py-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-chamber hover:bg-cyan"
      >
        Baskı teklifi
      </Link>
    </article>
  );
}
