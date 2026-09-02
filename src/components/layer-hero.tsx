import Link from "next/link";

const layers = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export function LayerHero() {
  return (
    <section className="bed-grid relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:py-28">
        <aside className="hidden font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted lg:block">
          <p className="text-cyan">G-code</p>
          <ul className="mt-4 space-y-1 text-mist">
            <li>G28 ; home</li>
            <li>M104 S215</li>
            <li>M140 S60</li>
            <li>G1 Z0.2 F3000</li>
            <li className="text-lime">; LAYER:00 hero</li>
          </ul>
          <p className="mt-8 text-muted">Denizli · FDM filosu</p>
        </aside>

        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-cyan">
            Auro 3D Baskı
          </p>
          <h1 className="layer-print mt-4 font-display text-[clamp(3rem,12vw,7rem)] font-semibold tracking-tight text-bone">
            {layers.map((i) => (
              <span key={i} style={{ ["--i" as string]: i }}>
                Katman
                <br />
                katman.
              </span>
            ))}
          </h1>
          <div
            className="nozzle-line mt-3 h-1 w-40 filament-bar shadow-nozzle"
            aria-hidden="true"
          />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-mist">
            Fikirden parçaya. Prototip, seri FDM, slicer ayarı ve filament
            kütüphanesi — atölyede üretilir, Instagram’da anlatılır.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/teklif"
              className="bg-lime px-5 py-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-chamber hover:bg-cyan"
            >
              Baskı teklifi
            </Link>
            <Link
              href="/hizmetler"
              className="border border-line px-5 py-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-bone hover:border-cyan hover:text-cyan"
            >
              Hizmetler
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
