import { ToolPlaceholder } from "@/components/tools/placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Çanta Stüdyo",
  description: "Çanta konfigüratörü — yakında.",
  path: "/araclar/canta-studyo",
});

export default function Page() {
  return (
    <ToolPlaceholder
      title="Çanta Stüdyo"
      body="Form, kulp ve ölçü. Çıktıyı atölyede bas."
    />
  );
}
