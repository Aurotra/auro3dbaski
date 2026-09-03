import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { collabFormats, mediaKit } from "@/data/content";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "İşbirlikleri",
  description: `${mediaKit.channel} marka ortaklıkları — ${mediaKit.audience}`,
  path: "/isbirlikleri",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        İşbirlikleri
      </h1>
      <p className="mt-3 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">
        {mediaKit.channel}
      </p>
      <p className="mt-4 max-w-3xl text-muted">{mediaKit.audience}</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-muted">Topluluk</p>
          <p className="mt-2 font-mono text-2xl text-accent-2">{mediaKit.followers}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Toplam izlenme</p>
          <p className="mt-2 font-mono text-lg text-accent-2">{mediaKit.reach}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Ort. izlenme</p>
          <p className="mt-2 text-sm text-text">{mediaKit.avgViews}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Demografi</p>
          <p className="mt-2 text-sm text-text">{mediaKit.demo}</p>
        </Card>
      </div>
      <h2 className="mt-14 border-l-4 border-accent pl-4 font-display text-2xl text-text">
        İş birliği alanları
      </h2>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {collabFormats.map((f) => (
          <li key={f.title}>
            <Card>
              <h2 className="font-display text-xl text-text">{f.title}</h2>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </Card>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/iletisim">İletişime geç</Button>
        {mediaKit.pdfUrl ? (
          <Button href={mediaKit.pdfUrl} variant="outline">
            Medya kiti (PDF)
          </Button>
        ) : null}
        <Button href={site.youtube} variant="outline">
          YouTube
        </Button>
        <Button href={site.instagram} variant="outline">
          Instagram
        </Button>
        <Button href={site.tiktok} variant="outline">
          TikTok
        </Button>
      </div>
      <p id="medya-kiti" className="mt-6 text-sm text-muted">
        {mediaKit.pdfUrl ? (
          <a href={mediaKit.pdfUrl} className="text-accent-2">
            Medya kiti PDF
          </a>
        ) : (
          <>
            Medya kiti PDF’si henüz yayınlanmadı. Hazır olunca bu bloktan
            indirilecek. Brief için{" "}
            <Link href="/iletisim" className="text-accent-2">
              iletişim formu
            </Link>{" "}
            veya {site.email}.
          </>
        )}
      </p>
    </div>
  );
}
