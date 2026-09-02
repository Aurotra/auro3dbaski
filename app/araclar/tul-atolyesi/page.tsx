import { ToolPlaceholder } from "@/components/tools/placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Tül Atölyesi",
  description: "Tül deseni konfigüratörü — yakında.",
  path: "/araclar/tul-atolyesi",
});

export default function Page() {
  return (
    <ToolPlaceholder
      title="Tül Atölyesi"
      body="Deseni ekranda kur, ölçekle, baskıya hazır dosyayı al."
    />
  );
}
