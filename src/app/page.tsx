import Link from "next/link";
import { LayerHero } from "@/components/layer-hero";
import { materials, processSteps, services, site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <LayerHero />

      <section className="bg-bone text-ink">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-magenta">
            İş kalemleri
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            Atölyenin yaptığı iş
          </h2>
          <ul className="mt-12 grid gap-px bg-ink/10 sm:grid-cols-2">
            {services.map((service) => (
              <li key={service.slug} className="bg-bone p-8">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-magenta">
                  {service.layer}
                </p>
                <h3 className="mt-3 font-display text-2xl">{service.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-ink/70">
                  {service.body}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/hizmetler"
            className="mt-10 inline-block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-ink underline decoration-magenta underline-offset-4"
          >
            Tüm hizmetler
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-bed">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-lime">
            Süreç
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-bone">
            Dört katman
          </h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {processSteps.map((step) => (
              <li key={step.code}>
                <p className="font-mono text-[0.7rem] text-cyan">{step.code}</p>
                <h3 className="mt-3 font-display text-2xl text-bone">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-kraft text-ink">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-magenta">
            Filament rafı
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight">
            Kütüphaneden seç
          </h2>
          <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {materials.map((material) => (
              <li
                key={material.id}
                className="border border-ink/10 bg-bone p-4"
              >
                <span
                  className="block h-16 rounded-full border border-ink/10"
                  style={{ backgroundColor: material.tone }}
                  aria-hidden="true"
                />
                <p className="mt-4 font-display text-xl">{material.name}</p>
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink/50">
                  {material.temp}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/malzemeler"
            className="mt-10 inline-block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-ink underline decoration-magenta underline-offset-4"
          >
            Malzeme notları
          </Link>
        </div>
      </section>

      <section className="bg-chamber">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-cyan">
              Sıradaki parça
            </p>
            <h2 className="mt-3 max-w-lg font-display text-4xl tracking-tight text-bone">
              STL hazırsa teklif, değilse {site.instagramHandle}.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/teklif"
              className="bg-lime px-5 py-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-chamber hover:bg-cyan"
            >
              Teklif al
            </Link>
            <a
              href={site.instagram}
              className="border border-line px-5 py-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-bone hover:border-cyan hover:text-cyan"
            >
              Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
