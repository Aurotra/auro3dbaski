"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled || open
          ? "border-white/10 bg-ink/95 backdrop-blur-md"
          : "border-transparent bg-ink/40",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-display text-lg tracking-tight text-text">
          {site.name}
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted hover:text-accent-2"
            >
              {item.label}
            </Link>
          ))}
          <Button href="/ozel-uretim" className="ml-2">
            Teklif
          </Button>
        </nav>
        <button
          type="button"
          className="rounded-md border border-white/15 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Kapat" : "Menü"}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-white/10 bg-ink px-4 py-4 lg:hidden"
          aria-label="Mobil"
        >
          <ul className="grid gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 font-mono text-sm uppercase tracking-[0.12em] text-text"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
