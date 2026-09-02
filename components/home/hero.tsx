import { Button } from "@/components/ui/button";

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
        {/* TODO: /videos/hero.mp4 — atölye / kumpas klipi */}
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent-2">
          FDM · SLA · içerik
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight text-text sm:text-7xl">
          {/* TODO: nihai metin */}
          Ölç, bas, kanıtla.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          {/* TODO: 1-2 cümlelik ne yaptığımız açıklaması */}
          Mühendislik toleransına uygun parça, atölyeden anlatılan ayar, masadan çıkan ürün.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/icerikler">İçerikleri İzle</Button>
          <Button href="/magaza" variant="outline">
            Ürünleri Gör
          </Button>
        </div>
        <p className="mt-12 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          Aşağı kaydır
        </p>
      </div>
    </section>
  );
}
