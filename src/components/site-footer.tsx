import Link from "next/link";
import { nav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bed">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-bone">
            Auro<span className="text-cyan">3D</span>Baski
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            {site.tagline}. {site.location}.
          </p>
        </div>
        <nav className="flex flex-col gap-2" aria-label="Alt">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-fit font-mono text-[0.72rem] uppercase tracking-[0.16em] text-mist hover:text-lime"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-mist">
          <a href={`mailto:${site.email}`} className="hover:text-lime">
            {site.email}
          </a>
          <a href={site.instagram} className="hover:text-lime">
            {site.instagramHandle}
          </a>
          <p className="normal-case tracking-normal text-muted">{site.location}</p>
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
            © {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex gap-4">
            <Link
              href="/yasal/kvkk"
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted hover:text-cyan"
            >
              KVKK
            </Link>
            <Link
              href="/yasal/gizlilik"
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted hover:text-cyan"
            >
              Gizlilik
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
