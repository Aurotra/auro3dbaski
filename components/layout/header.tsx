"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ctaNav, nav } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled || open
          ? "border-white/10 bg-ink/95 backdrop-blur-md"
          : "border-transparent bg-ink/40",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <BrandLogo size="md" />
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
          <Button href={ctaNav.href} className="ml-2">
            {ctaNav.label}
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
      <nav
        id="mobile-nav"
        aria-label="Mobil"
        aria-hidden={!open}
        className={cn(
          "grid overflow-hidden border-white/10 bg-ink lg:hidden motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-200",
          open
            ? "grid-rows-[1fr] border-t opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 px-4">
          <ul className="grid gap-1 py-4">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  tabIndex={open ? 0 : -1}
                  className="block py-2 font-mono text-sm uppercase tracking-[0.12em] text-text"
                  onClick={close}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            href={ctaNav.href}
            className="mb-4 w-full"
            onClick={close}
          >
            {ctaNav.label}
          </Button>
        </div>
      </nav>
      <div className="glow-bar h-0.5 w-full" aria-hidden="true" />
    </header>
  );
}
