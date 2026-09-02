"use client";

import { useEffect, useRef, useState } from "react";
import { stats } from "@/data/workshop";

function useCount(target: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const dur = 800;
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
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
  suffix,
  run,
}: {
  label: string;
  value: number;
  suffix: string;
  run: boolean;
}) {
  const n = useCount(value, run);
  return (
    <div>
      <p className="font-mono text-3xl text-accent-2 sm:text-4xl">
        {n}
        {suffix}
      </p>
      <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
    </div>
  );
}

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRun(true);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-y border-white/10 bg-ink-soft px-4 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((item) => (
          <StatCell
            key={item.id}
            label={item.label}
            value={item.value}
            suffix={item.suffix}
            run={run}
          />
        ))}
      </div>
    </section>
  );
}
