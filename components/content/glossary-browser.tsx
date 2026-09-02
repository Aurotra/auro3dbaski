"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { glossary, glossaryCategories, type GlossaryCategory } from "@/data/glossary";
import { cn } from "@/lib/cn";

export function GlossaryBrowser() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<GlossaryCategory | "all">("all");
  const list = useMemo(() => {
    return glossary.filter((t) => {
      const okCat = cat === "all" || t.category === cat;
      const okQ =
        !q ||
        t.title.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr"));
      return okCat && okQ;
    });
  }, [q, cat]);

  return (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Terim ara"
        className="w-full max-w-md rounded-md border border-white/15 bg-ink-soft px-3 py-2.5 text-text"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {glossaryCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
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
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {list.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/bilgi-bankasi/${t.slug}`}
              className="block rounded-md border border-white/10 bg-ink-soft p-4 hover:border-accent"
            >
              <h2 className="font-display text-xl text-text">{t.title}</h2>
              <p className="mt-1 text-sm text-muted">{t.oneLiner}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
