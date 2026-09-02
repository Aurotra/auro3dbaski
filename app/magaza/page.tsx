import { ComingSoon } from "@/components/ui/coming-soon";
import { shopierStoreUrl } from "@/data/products";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Mağaza",
  description: "Auro 3D Baskı koleksiyon vitrini yakında. Satın alma şimdilik Shopier üzerinden.",
  path: "/magaza",
});

export default function MagazaPage() {
  return (
    <ComingSoon
      title="Koleksiyon vitrini yakında"
      body="Örnek ürün ve koleksiyon kartları henüz yayında değil. Satın alma ve güncel stok için Shopier mağazasına gidin; özel parça için teklif formunu kullanın."
      action={{ href: shopierStoreUrl, label: "Shopier mağazası" }}
    />
  );
}
