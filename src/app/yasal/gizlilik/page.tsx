import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gizlilik",
};

export default function GizlilikPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight text-bone">
        Gizlilik
      </h1>
      <div className="mt-8 space-y-4 leading-relaxed text-mist">
        <p>
          {site.name}, siteyi işletmek ve baskı taleplerini karşılamak için
          gerekli asgari veriyi tutar.
        </p>
        <p>
          Gönderdiğiniz 3D modeller ve teknik notlar üçüncü kişilerle
          paylaşılmaz. Hosting sağlayıcısının erişim kayıtları güvenlik ve
          performans için tutulabilir.
        </p>
        <p>
          Sorular için {site.email} veya {site.instagramHandle}.
        </p>
      </div>
    </article>
  );
}
