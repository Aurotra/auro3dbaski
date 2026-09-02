import { ProductCard } from "@/components/shop/product-card";
import { shopierStoreUrl, type ShopierProduct } from "@/data/products";

export function ShopGrid({
  products,
  source,
}: {
  products: ShopierProduct[];
  source: "live" | "fallback";
}) {
  return (
    <>
      {source === "fallback" ? (
        <p className="mb-6 max-w-2xl text-sm text-muted">
          Canlı vitrin şu an Shopier’den çekilemedi. Kartlar mağazadan doğrulanmış
          son listedir. Ödeme her zaman Shopier üzerinde tamamlanır.
        </p>
      ) : (
        <p className="mb-6 max-w-2xl text-sm text-muted">
          İlk dört ürün Shopier vitrininden çekilir. Ödeme bu sitede alınmaz;
          buton ilgili ürün sayfasına gider.
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </ul>
      <a
        href={shopierStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex font-mono text-sm text-accent-2 hover:text-accent"
      >
        Tüm ürünleri Shopier’de gör →
      </a>
    </>
  );
}
