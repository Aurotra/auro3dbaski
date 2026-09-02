"use client";

import Image from "next/image";
import { useState } from "react";
import { MeasureLabel } from "@/components/ui/measure-label";
import {
  type Product,
  type ProductCategory,
  productCategories,
  products,
} from "@/data/products";
import { cn } from "@/lib/cn";

const platformLabel = {
  shopier: "Shopier",
  trendyol: "Trendyol",
  etsy: "Etsy",
} as const;

export function ShopGrid() {
  const [cat, setCat] = useState<ProductCategory | "all">("all");
  const [open, setOpen] = useState<Product | null>(null);
  const list =
    cat === "all" ? products : products.filter((p) => p.category === cat);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {productCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em]",
              cat === c.id
                ? "border-accent bg-accent text-ink"
                : "border-white/15 text-muted",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(item)}
              className="w-full overflow-hidden rounded-md border border-white/10 bg-ink-soft text-left"
            >
              <div className="relative aspect-square">
                <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="50vw" />
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl text-text">{item.name}</h2>
                <p className="mt-1 text-sm text-muted">{item.summary}</p>
                <MeasureLabel className="mt-3">{item.priceRange}</MeasureLabel>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-ink/80 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="p-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-white/10 bg-ink-soft p-5">
            <h3 id="p-title" className="font-display text-2xl text-text">
              {open.name}
            </h3>
            <p className="mt-2 text-muted">{open.summary}</p>
            <p className="mt-3 font-mono text-sm text-accent-2">Varyant: {open.variants.join(", ")}</p>
            <p className="mt-1 text-sm text-muted">Üretim: {open.leadTime}</p>
            <p className="mt-1 text-sm text-muted">Kargo: {open.shippingNote}</p>
            <p className="mt-1 text-sm text-muted">Malzeme: {open.material}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(platformLabel) as Array<keyof typeof platformLabel>).map((key) => {
                const href = open.platforms[key];
                return href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-accent px-3 py-2 font-display text-sm text-ink"
                  >
                    {platformLabel[key]}
                  </a>
                ) : (
                  <span key={key} className="rounded-md border border-white/10 px-3 py-2 font-mono text-xs text-muted">
                    {platformLabel[key]} {/* TODO: link */}
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              className="mt-6 font-mono text-sm text-accent-2"
              onClick={() => setOpen(null)}
            >
              Kapat
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
