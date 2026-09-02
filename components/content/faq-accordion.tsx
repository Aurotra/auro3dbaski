"use client";

import { useState } from "react";
import { type FaqItem } from "@/data/content";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-white/10 rounded-md border border-white/10">
      {items.map((item, i) => (
        <li key={item.q}>
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left font-display text-text"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.q}
            <span className="font-mono text-accent">{open === i ? "–" : "+"}</span>
          </button>
          {open === i ? <p className="px-4 pb-4 text-sm text-muted">{item.a}</p> : null}
        </li>
      ))}
    </ul>
  );
}
