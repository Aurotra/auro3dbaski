import { FaqAccordion } from "@/components/content/faq-accordion";
import { GlossaryBrowser } from "@/components/content/glossary-browser";
import { glossaryAccordion } from "@/data/glossary";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Bilgi Bankası",
  description: "Türkçe 3D baskı terim ve ayar sözlüğü — 15 maddelik akordeon.",
  path: "/bilgi-bankasi",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Bilgi Bankası
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        On beş terim: ne işe yarar, ne zaman basılır, Bambu Studio’da nerede durur.
        Kısa cevap aşağıda; ayrıntı kartlara tıklayınca açılır.
      </p>
      <h2 className="mt-10 border-l-4 border-accent pl-4 font-display text-2xl text-text">
        15 maddelik sözlük
      </h2>
      <div className="mt-4">
        <FaqAccordion items={glossaryAccordion()} />
      </div>
      <h2 className="mt-14 border-l-4 border-accent pl-4 font-display text-2xl text-text">
        Terim ara
      </h2>
      <div className="mt-4">
        <GlossaryBrowser />
      </div>
    </div>
  );
}
