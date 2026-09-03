"use client";

import { useMemo, useState } from "react";
import { NumberField, formatTry, parseLocaleNumber } from "@/components/calculators/number-field";
import { MeasureLabel } from "@/components/ui/measure-label";

/** Konut tarifesi varsayılanı — elektrik çıktısı için. */
const KWH_RATE_TL = 3.2;

function n(raw: string): number {
  const v = parseLocaleNumber(raw);
  return Number.isFinite(v) ? v : 0;
}

export function PrintCostCalc() {
  const [grams, setGrams] = useState("50");
  const [priceKg, setPriceKg] = useState("400");
  const [hours, setHours] = useState("4");
  const [watts, setWatts] = useState("120");

  const result = useMemo(() => {
    const material = (n(grams) / 1000) * n(priceKg);
    const electricity = n(hours) * (n(watts) / 1000) * KWH_RATE_TL;
    return {
      material,
      electricity,
      total: material + electricity,
    };
  }, [grams, priceKg, hours, watts]);

  return (
    <div className="rounded-md border border-white/10 bg-ink-soft p-5">
      <h2 className="font-display text-2xl text-text">
        3D Baskı Maliyet ve Gramaj Hesaplayıcı
      </h2>
      <p className="mt-2 text-sm text-muted">
        Malzeme + tahmini elektrik. Satış fiyatı değil, taban maliyet.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <NumberField
          label="Harcanan filament (gram)"
          value={grams}
          onChange={setGrams}
        />
        <NumberField
          label="Filament kg fiyatı (TL)"
          value={priceKg}
          onChange={setPriceKg}
        />
        <NumberField
          label="Baskı süresi (saat)"
          value={hours}
          onChange={setHours}
        />
        <NumberField
          label="Yazıcı gücü (W)"
          value={watts}
          onChange={setWatts}
        />
      </div>
      <dl className="mt-6 grid gap-2">
        <Row label="Malzeme maliyeti" value={result.material} />
        <Row label="Tahmini elektrik tüketim maliyeti" value={result.electricity} />
        <Row label="Toplam taban maliyeti" value={result.total} />
      </dl>
      <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted">
        Elektrik: {KWH_RATE_TL.toLocaleString("tr-TR")} ₺/kWh varsayılan tarife
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4 font-mono text-sm text-text">
      <dt>{label}</dt>
      <dd>
        <MeasureLabel>{fmt(value)} ₺</MeasureLabel>
      </dd>
    </div>
  );
}

function fmt(n: number) {
  return formatTry(n);
}
