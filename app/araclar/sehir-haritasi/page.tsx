import { ToolPlaceholder } from "@/components/tools/placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Şehir Haritası Konfigüratörü",
  description: "Katmanlı şehir panosu — yakında.",
  path: "/araclar/sehir-haritasi",
});

export default function Page() {
  return (
    <ToolPlaceholder
      title="Şehir Haritası Konfigüratörü"
      body="Şehir, katman sayısı ve ölçü. Duvar panosuna giden yol."
    />
  );
}
