import { GlossaryBrowser } from "@/components/content/glossary-browser";
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
        Üstteki arama anında süzer; İlgili Video kanalın YouTube’una açılır.
      </p>
      <div className="mt-8">
        <GlossaryBrowser />
      </div>
    </div>
  );
}
