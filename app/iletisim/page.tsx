import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";
import { shopierStoreUrl } from "@/data/products";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "İletişim",
  description: `Auro3DBaskı iletişim — ${site.email}`,
  path: "/iletisim",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        İletişim
      </h1>
      <p className="mt-4 text-muted">
        <a href={`mailto:${site.email}`} className="text-accent-2">
          {site.email}
        </a>
      </p>
      <p className="mt-3 text-sm text-muted">
        Ürün siparişi şimdilik{" "}
        <a
          href={shopierStoreUrl}
          className="text-accent-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shopier
        </a>
        . Özel üretim:{" "}
        <Link href="/ozel-uretim" className="text-accent-2">
          /ozel-uretim
        </Link>
        .
      </p>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ContactForm
          subjects={[
            { value: "genel", label: "Genel" },
            { value: "isbirligi", label: "İşbirliği" },
            { value: "basin", label: "Basın" },
          ]}
        />
        <div className="flex flex-col gap-2 font-mono text-sm">
          <a href={site.instagram} className="text-accent-2">Instagram</a>
          <a href={site.tiktok} className="text-accent-2">TikTok</a>
          <a href={site.youtube} className="text-accent-2">YouTube</a>
        </div>
      </div>
    </div>
  );
}
