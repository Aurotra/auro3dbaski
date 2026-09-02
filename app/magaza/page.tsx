import { ShopGrid } from "@/components/shop/shop-grid";
import { products, shopierStoreUrl } from "@/data/products";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Mağaza",
  description:
    "Auro 3D Baskı atölyesinden çıkan parçalar. Ödeme Shopier üzerinde tamamlanır.",
  path: "/magaza",
});

export default function MagazaPage() {
  const listing = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} mağaza`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: p.shopierUrl,
      name: p.title,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listing) }}
      />
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">
        Vitrin
      </p>
      <h1 className="mt-3 border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Mağaza
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        Atölyeden çıkan parçalar. Stok ve ödeme Shopier’de; kartlar buradan, her
        seferinde aynı listeden açılır.
      </p>
      <div className="mt-10">
        <ShopGrid />
      </div>
      <p className="mt-10 text-sm text-muted">
        Özel parça için{" "}
        <a href="/ozel-uretim" className="text-accent-2">
          teklif
        </a>
        {" · "}
        <a
          href={shopierStoreUrl}
          className="text-accent-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shopier mağazası
        </a>
      </p>
    </div>
  );
}
