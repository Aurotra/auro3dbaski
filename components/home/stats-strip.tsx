"use client";

import { useEffect, useRef, useState } from "react";
import { stats as staticStats } from "@/data/workshop";
import { formatCompactPlus, formatGroupedPlus } from "@/lib/format";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function useCount(target: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(target);
      return;
    }
    const start = performance.now();
    const dur = 1400;
    let frame = 0;
    const tick = (t: number) => {
      const p = easeOutCubic(Math.min(1, (t - start) / dur));
      setN(Math.round(target * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, target]);
  return n;
}

function StatCell({
  label,
  value,
  format,
  run,
}: {
  label: string;
  value: number;
  format: "compact" | "grouped" | "plain";
  run: boolean;
}) {
  const n = useCount(value, run);
  const display =
    format === "compact"
      ? formatCompactPlus(n)
      : format === "grouped"
        ? formatGroupedPlus(n)
        : n.toLocaleString("tr-TR");

  return (
    <div>
      <p className="font-mono text-3xl tabular-nums text-accent-2 sm:text-4xl">
        {display}
      </p>
      <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
    </div>
  );
}

export function StatsStrip({ totalFollowers }: { totalFollowers: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  const [followers, setFollowers] = useState(totalFollowers);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { totalFollowers?: number } | null) => {
        if (
          !cancelled &&
          data &&
          typeof data.totalFollowers === "number" &&
          Number.isFinite(data.totalFollowers)
        ) {
          setFollowers(data.totalFollowers);
        }
      })
      .catch(() => {
        /* sunucu değeri kalır */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRun(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const views = staticStats.find((s) => s.id === "views")?.value ?? 3_000_000;
  const parts = staticStats.find((s) => s.id === "parts")?.value ?? 1_200;
  const printers = staticStats.find((s) => s.id === "printers")?.value ?? 8;

  return (
    <section ref={ref} className="border-y border-white/10 bg-ink-soft px-4 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        <StatCell
          label="Toplam takipçi"
          value={followers}
          format="compact"
          run={run}
        />
        <StatCell label="Toplam izlenme" value={views} format="grouped" run={run} />
        <StatCell
          label="Test edilen / üretilen parça"
          value={parts}
          format="grouped"
          run={run}
        />
        <StatCell label="Aktif yazıcı" value={printers} format="grouped" run={run} />
      </div>
    </section>
  );
}
