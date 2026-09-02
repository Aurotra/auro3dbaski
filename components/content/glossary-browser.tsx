"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { glossary, glossaryCategories, type GlossaryCategory } from "@/data/glossary";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

export function GlossaryBrowser() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<GlossaryCategory | "all">("all");
  const [open, setOpen] = useState<number | null>(0);

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    return glossary.filter((t) => {
      const okCat = cat === "all" || t.category === cat;
      if (!okCat) return false;
      if (!needle) return true;
      const hay = `${t.title} ${t.oneLiner} ${t.what}`.toLocaleLowerCase("tr");
      return hay.includes(needle);
    });
  }, [q, cat]);

  return (
    <>
      <label className="grid max-w-md gap-1 text-sm text-muted">
        Sözlükte ara
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(0);
          }}
          placeholder="Ironing, warping, seam…"
          autoComplete="off"
          className="w-full rounded-md border border-white/15 bg-ink-soft px-3 py-2.5 text-text"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        {glossaryCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCat(c.id);
              setOpen(0);
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em]",
              cat === c.id
                ? "btn-glow border-transparent"
                : "border-white/15 text-muted",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Bu aramaya uyan terim yok.</p>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 rounded-md border border-white/10">
          {list.map((term, i) => {
            const videoHref = term.videoHref ?? site.youtube;
            const expanded = open === i;
            return (
              <li key={term.slug}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left font-display text-text"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : i)}
                >
                  {term.title}
                  <span className="font-mono text-accent">{expanded ? "–" : "+"}</span>
                </button>
                {expanded ? (
                  <div className="space-y-3 px-4 pb-4">
                    <p className="text-sm text-muted">
                      {term.oneLiner} {term.what} Ne zaman kullanılır: {term.when}
                    </p>
                    <a
                      href={videoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-md border border-accent/50 px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent-2 hover:border-accent-2"
                    >
                      İlgili Video
                    </a>
                    <Link
                      href={`/bilgi-bankasi/${term.slug}`}
                      className="ml-3 inline-flex font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted hover:text-accent-2"
                    >
                      Ayrıntı
                    </Link>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
