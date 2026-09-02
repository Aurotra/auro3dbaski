import { JournalWall } from "@/components/content/journal-wall";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Baskı Günlüğü",
  description: "Başarısız baskılar duvarı — ne oldu, nasıl çözüldü.",
  path: "/gunluk",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Başarısız baskılar duvarı
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Kolay göstermiyoruz. Kartı aç, ayarı oku.
      </p>
      <div className="mt-10">
        <JournalWall />
      </div>
    </div>
  );
}
