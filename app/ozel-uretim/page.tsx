import { FaqAccordion } from "@/components/content/faq-accordion";
import { QuoteForm } from "@/components/forms/quote-form";
import { LoopVideo } from "@/components/media/loop-video";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  productionFaq,
  productionMaterials,
  productionSteps,
} from "@/data/content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Özel Üretim",
  description: "Prototip, yedek parça, seri FDM/SLA ve tersine mühendislik teklifi.",
  path: "/ozel-uretim",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Özel üretim
      </p>
      <h1 className="mt-3 max-w-3xl border-l-4 border-accent pl-4 font-display text-4xl text-text sm:text-5xl">
        Özel ve toplu üretim
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Prototip, yedek parça, kısa seri, tersine mühendislik. FDM ve SLA. Tek
        parça da olur, tekrarlayan iş de.
      </p>
      <div className="mt-6">
        <Button href="#form">Teklif Al</Button>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-12">
        <figure className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-md border border-white/10 bg-ink-soft lg:mx-0">
          <LoopVideo
            src="/videos/simit.mp4"
            poster="/images/simit.webp"
            className="absolute inset-0"
            sizes="300px"
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent px-3 pb-3 pt-10">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent">
              Çok renk · simit
            </span>
          </figcaption>
        </figure>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {productionSteps.map((s) => (
            <li
              key={s.n}
              className="rounded-md border border-white/10 bg-ink-soft p-4"
            >
              <p className="font-mono text-xs text-accent">{s.n}</p>
              <h2 className="mt-2 font-display text-lg text-text">{s.title}</h2>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <h2 className="mt-16 border-l-4 border-accent pl-4 font-display text-2xl text-text">
        Malzemeler
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {productionMaterials.map((m) => (
          <li key={m.id}>
            <Card>
              <h3 className="font-display text-xl text-text">{m.name}</h3>
              <p className="mt-2 text-sm text-muted">{m.use}</p>
              <p className="mt-1 font-mono text-xs text-accent-2">{m.highlight}</p>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <div id="form" className="scroll-mt-28">
          <QuoteForm />
        </div>
        <div>
          <h2 className="border-l-4 border-accent pl-4 font-display text-2xl text-text">
            Teknik üretim SSS
          </h2>
          <div className="mt-4">
            <FaqAccordion items={[...productionFaq]} />
          </div>
        </div>
      </div>
    </div>
  );
}
