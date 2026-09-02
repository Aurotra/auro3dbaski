import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[75vh] items-end overflow-hidden">
      <video
        className="absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/posters/hero.svg"
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-20">
        <BrandLogo href={null} size="lg" />
        <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent">
          FDM · SLA · mühendislik üretimi
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[0.95] tracking-tight text-text sm:text-6xl lg:text-7xl">
          Katman Katman Mühendislik, Sınır Tanımayan Üretim.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">{site.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/icerikler">İçerikleri İzle</Button>
          <Button href="/ozel-uretim" variant="outline">
            Özel Üretim
          </Button>
        </div>
        <p className="mt-12 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          Aşağı kaydır
        </p>
      </div>
    </section>
  );
}
