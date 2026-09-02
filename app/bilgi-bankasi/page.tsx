import { GlossaryBrowser } from "@/components/content/glossary-browser";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Bilgi Bankası",
  description: "Türkçe 3D baskı terim ve ayar sözlüğü.",
  path: "/bilgi-bankasi",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Bilgi Bankası
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Terim, ne işe yarar, Bambu Studio’da nerede durur.
      </p>
      <div className="mt-8">
        <GlossaryBrowser />
      </div>
    </div>
  );
}
