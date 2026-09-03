"use client";

import { useEffect, useState } from "react";
import { stats as staticStats } from "@/data/workshop";
import { formatCompactPlus, formatGroupedPlus } from "@/lib/format";

function StatCell({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: "compact" | "grouped";
}) {
  const display =
    format === "compact" ? formatCompactPlus(value) : formatGroupedPlus(value);

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
  const [followers, setFollowers] = useState(() =>
    Math.max(7000, Number.isFinite(totalFollowers) ? totalFollowers : 7000),
  );

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
          setFollowers(Math.max(7000, data.totalFollowers));
        }
      })
      .catch(() => {
        /* sunucu değeri kalır */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cells = staticStats.map((s) =>
    s.id === "followers" ? { ...s, value: followers } : s,
  );

  return (
    <section className="border-y border-white/10 bg-ink-soft px-4 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        {cells.map((cell) => (
          <StatCell
            key={cell.id}
            label={cell.label}
            value={cell.value}
            format={cell.format}
          />
        ))}
      </div>
    </section>
  );
}
