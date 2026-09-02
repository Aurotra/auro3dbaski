import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MeasureLabel } from "@/components/ui/measure-label";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/data/products";

export function ProductStrip() {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Mağaza">Atölyeden çıkanlar</SectionHeading>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-md border border-white/10 bg-ink-soft"
            >
              <div className="relative aspect-square">
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg text-text">{item.name}</h3>
                <p className="mt-1 text-sm text-muted">{item.summary}</p>
                <MeasureLabel className="mt-3">{item.priceRange}</MeasureLabel>
              </div>
            </li>
          ))}
        </ul>
        <Button href="/magaza" className="mt-8">
          Tüm Ürünler
        </Button>
      </div>
    </section>
  );
}
