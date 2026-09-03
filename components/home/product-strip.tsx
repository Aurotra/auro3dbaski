import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { shopierStoreUrl, type Product } from "@/data/products";

export function ProductStrip({ products }: { products: Product[] }) {
  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Mağaza">Atölyeden çıkanlar</SectionHeading>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/magaza">Tüm Ürünler</Button>
          <Button href={shopierStoreUrl} variant="outline">
            Shopier mağazası
          </Button>
        </div>
      </div>
    </section>
  );
}
