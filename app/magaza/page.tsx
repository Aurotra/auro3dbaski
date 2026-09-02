import { ShopGrid } from "@/components/shop/shop-grid";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Mağaza",
  description: "Ürün vitrini — satın alma Shopier, Trendyol ve Etsy üzerinden.",
  path: "/magaza",
});

export default function MagazaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Mağaza
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Ödeme burada yok. Karttaki buton ilgili platforma gider.
      </p>
      <div className="mt-8">
        <ShopGrid />
      </div>
    </div>
  );
}
