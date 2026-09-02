import { ComingSoon } from "@/components/ui/coming-soon";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Baskı Günlüğü",
  description: "Atölye devlog kayıtları yakında.",
  path: "/gunluk",
});

export default function Page() {
  return (
    <ComingSoon
      title="Atölye günlüğü yakında"
      body="Başarısız baskı ve düzeltme kayıtları henüz yayınlanmadı. Hazır olunca buraya düşecek."
      action={{ href: "/icerikler", label: "İçeriklere git" }}
    />
  );
}
