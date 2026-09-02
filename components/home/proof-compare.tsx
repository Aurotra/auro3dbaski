"use client";

import { useRef, useState } from "react";
import { proofPairs } from "@/data/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

export function ProofCompare() {
  const [pair, setPair] = useState(0);
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const item = proofPairs[pair];

  function move(clientX: number) {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  return (
    <section className="bg-paper px-4 py-16 text-ink">
      <div className="mx-auto max-w-6xl">
        <SectionHeading tone="light" eyebrow="Kanıt anı">
          Ayar değişince parça değişir
        </SectionHeading>
        <div className="mt-8 flex flex-wrap gap-2">
          {proofPairs.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPair(i)}
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em]",
                i === pair
                  ? "btn-glow border-transparent"
                  : "border-ink/15 text-ink",
              )}
            >
              {p.title}
            </button>
          ))}
        </div>
        <div
          ref={box}
          className="relative mt-6 aspect-[16/10] cursor-ew-resize overflow-hidden rounded-md border border-ink/10"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            move(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons) move(e.clientX);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.afterUrl}
            alt={item.afterLabel}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.beforeUrl}
              alt={item.beforeLabel}
              className="absolute inset-0 size-full max-w-none object-cover"
              style={{ width: box.current ? `${box.current.clientWidth}px` : "100%" }}
            />
          </div>
          <div
            className="absolute inset-y-0 z-10 w-0.5 bg-accent"
            style={{ left: `${pos}%` }}
          >
            <span className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-md border border-accent bg-ink font-mono text-[0.6rem] leading-8 text-accent-2">
              ║
            </span>
          </div>
        </div>
        <p className="mt-3 font-mono text-xs text-ink/50">
          Sürükle. Sol: {item.beforeLabel} · Sağ: {item.afterLabel}
        </p>
      </div>
    </section>
  );
}
