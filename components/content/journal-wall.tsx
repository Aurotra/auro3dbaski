"use client";

import Image from "next/image";
import { useState } from "react";
import { type JournalEntry, journal } from "@/data/gunluk";

export function JournalWall() {
  const [open, setOpen] = useState<JournalEntry | null>(null);
  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {journal.map((item) => (
          <li key={item.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(item)}
              className="w-full overflow-hidden rounded-md border border-white/10 bg-ink-soft text-left"
            >
              <div className="relative aspect-[4/5]">
                <Image src={item.photoUrl} alt={item.title} fill className="object-cover" sizes="33vw" />
              </div>
              <div className="p-3">
                <p className="font-mono text-[0.65rem] text-muted">{item.date}</p>
                <h2 className="font-display text-lg text-text">{item.title}</h2>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/80 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-md border border-white/10 bg-ink-soft p-5">
            <h3 className="font-display text-2xl text-text">{open.title}</h3>
            <p className="mt-4 text-sm text-muted">Ne oldu: {open.whatHappened}</p>
            <p className="mt-2 text-sm text-muted">Sebep: {open.cause}</p>
            <p className="mt-2 text-sm text-muted">Çözüm: {open.fix}</p>
            <p className="mt-2 font-mono text-sm text-accent-2">Ayar: {open.settingChanged}</p>
            <button type="button" className="mt-6 text-accent-2" onClick={() => setOpen(null)}>
              Kapat
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
