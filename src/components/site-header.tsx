import Link from "next/link";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-chamber/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brands/mark.svg"
            alt=""
            width={36}
            height={40}
            className="h-10 w-9"
          />
          <span className="font-display text-lg tracking-tight text-bone">
            Auro<span className="text-cyan">3D</span>Baski
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Ana">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-mist transition-colors hover:text-lime"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/teklif"
            className="ml-2 bg-lime px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-chamber transition-colors hover:bg-cyan"
          >
            Baskı teklifi
          </Link>
        </nav>

        <details className="relative md:hidden">
          <summary className="list-none cursor-pointer px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-mist [&::-webkit-details-marker]:hidden">
            Menü
          </summary>
          <div className="absolute right-0 mt-2 w-52 border border-line bg-bed p-2 shadow-nozzle">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-bone hover:bg-plate hover:text-lime"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={site.instagram}
              className="block px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-cyan"
            >
              Instagram
            </Link>
          </div>
        </details>
      </div>
      <div className="filament-bar h-px w-full" aria-hidden="true" />
    </header>
  );
}
