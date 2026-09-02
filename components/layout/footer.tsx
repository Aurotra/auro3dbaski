import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { site } from "@/lib/site";

const footerNav = [
  { href: "/icerikler", label: "İçerikler" },
  { href: "/magaza", label: "Mağaza" },
  { href: "/araclar", label: "Araçlar" },
  { href: "/bilgi-bankasi", label: "Bilgi Bankası" },
  { href: "/ozel-uretim", label: "Özel Üretim" },
  { href: "/isbirlikleri", label: "İşbirlikleri" },
  { href: "/hakkimda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <BrandLogo size="md" />
          <p className="mt-3 max-w-xs text-sm text-muted">{site.subtitle}</p>
        </div>
        <nav className="grid grid-cols-2 gap-2" aria-label="Site haritası">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted hover:text-accent-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2 font-mono text-[0.72rem] text-muted">
          <a href={`mailto:${site.email}`} className="text-accent-2 hover:text-accent">
            {site.email}
          </a>
          <a href={site.instagram}>Instagram</a>
          <a href={site.tiktok}>TikTok</a>
          <a href={site.youtube}>YouTube</a>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
