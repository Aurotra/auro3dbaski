import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { shopierStoreUrl, type ShopierProduct } from "@/data/products";

export function ProductStrip({
  products,
  source,
}: {
  products: ShopierProduct[];
  source: "live" | "fallback";
}) {
  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Mağaza">Atölyeden çıkanlar</SectionHeading>
        {source === "fallback" ? (
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Canlı vitrin şu an Shopier’den çekilemedi. Aşağıdaki kartlar mağazadan
            doğrulanmış son listedir; güncel stok ve fiyat için Shopier’e gidin.
          </p>
        ) : null}
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
