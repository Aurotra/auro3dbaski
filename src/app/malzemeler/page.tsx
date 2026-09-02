import type { Metadata } from "next";
import Link from "next/link";
import { materials } from "@/lib/site";

export const metadata: Metadata = {
  title: "Malzemeler",
  description:
    "PLA, PETG, ABS, ASA, TPU ve karbon takviyeli PA. Auro 3D Baskı filament kütüphanesi.",
};

export default function MalzemelerPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-cyan">
        Filament
      </p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-bone">
        Kütüphane
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist">
        Parçanın işi malzemeyi seçer. Şüphen varsa yaz — nozul sıcaklığı ve
        profil atölyede ayarlanır.
      </p>
      <ul className="mt-14 grid gap-4 md:grid-cols-2">
        {materials.map((material) => (
          <li
            key={material.id}
            className="flex gap-5 border border-line bg-bed p-6"
          >
            <span
              className="h-20 w-20 shrink-0 rounded-full border border-line"
              style={{ backgroundColor: material.tone }}
              aria-hidden="true"
            />
            <div>
              <h2 className="font-display text-2xl text-bone">{material.name}</h2>
              <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-cyan">
                {material.temp}
              </p>
              <p className="mt-3 text-mist">{material.use}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/teklif"
        className="mt-12 inline-block bg-lime px-5 py-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-chamber hover:bg-cyan"
      >
        Malzeme ile teklif
      </Link>
    </article>
  );
}
