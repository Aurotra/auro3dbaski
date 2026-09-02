import { FaqAccordion } from "@/components/content/faq-accordion";
import { QuoteForm } from "@/components/forms/quote-form";
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
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Özel ve toplu üretim
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        Prototip, yedek parça, kısa seri, tersine mühendislik. FDM ve SLA.
        Tek parça da olur, tekrarlayan iş de.
      </p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-5">
        {productionSteps.map((s) => (
          <li key={s.n} className="rounded-md border border-white/10 bg-ink-soft p-4">
            <p className="font-mono text-xs text-accent">{s.n}</p>
            <h2 className="mt-2 font-display text-lg text-text">{s.title}</h2>
            <p className="mt-1 text-sm text-muted">{s.body}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-14 border-l-4 border-accent pl-4 font-display text-2xl text-text">
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
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <QuoteForm />
        <div>
          <h2 className="border-l-4 border-accent pl-4 font-display text-2xl text-text">
            SSS
          </h2>
          <div className="mt-4">
            <FaqAccordion items={[...productionFaq]} />
          </div>
        </div>
      </div>
    </div>
  );
}
