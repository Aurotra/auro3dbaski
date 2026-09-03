import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Araçlar",
  description: "Atölye araçları — yakında.",
  path: "/araclar",
});

export default function AraclarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Yakında</p>
      <h1 className="mt-3 border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Araçlar
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Daha gelişmiş atölye araçları yapım aşamasında. Hazır olduğunda burada yayınlanacak.
      </p>
    </div>
  );
}
