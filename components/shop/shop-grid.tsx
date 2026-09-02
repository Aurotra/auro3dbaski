import { ProductCard } from "@/components/shop/product-card";
import { products, shopierStoreUrl } from "@/data/products";

export function ShopGrid() {
  return (
    <>
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
