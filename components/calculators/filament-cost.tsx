"use client";

import { useMemo, useState } from "react";
import { NumberField, formatTry, parseLocaleNumber } from "@/components/calculators/number-field";
import { MeasureLabel } from "@/components/ui/measure-label";

function n(raw: string): number {
  const v = parseLocaleNumber(raw);
  return Number.isFinite(v) ? v : 0;
}

export function FilamentCostCalc() {
  const [grams, setGrams] = useState("50");
  const [priceKg, setPriceKg] = useState("400");
  const [hours, setHours] = useState("4");
  const [kwh, setKwh] = useState("3,2");
  const [watts, setWatts] = useState("120");
  const [waste, setWaste] = useState("10");

  const result = useMemo(() => {
    const material = (n(grams) / 1000) * n(priceKg) * (1 + n(waste) / 100);
    const electricity = n(hours) * (n(watts) / 1000) * n(kwh);
    const total = material + electricity;
    return {
      material,
      electricity,
      total,
      low: total * 2.5,
      high: total * 4,
    };
  }, [grams, priceKg, hours, kwh, watts, waste]);

  return (
    <div className="rounded-md border border-white/10 bg-ink-soft p-5">
      <h2 className="font-display text-2xl text-text">Filament maliyet</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <NumberField label="Parça ağırlığı (g)" value={grams} onChange={setGrams} />
        <NumberField label="Filament (TL/kg)" value={priceKg} onChange={setPriceKg} />
        <NumberField label="Baskı süresi (saat)" value={hours} onChange={setHours} />
        <NumberField label="Elektrik (TL/kWh)" value={kwh} onChange={setKwh} />
        <NumberField label="Yazıcı gücü (W)" value={watts} onChange={setWatts} />
        <NumberField label="Fire (%)" value={waste} onChange={setWaste} />
      </div>
      <dl className="mt-6 grid gap-2">
        <Row label="Malzeme" value={result.material} />
        <Row label="Elektrik" value={result.electricity} />
        <Row label="Toplam maliyet" value={result.total} />
      </dl>
      <p className="mt-4 text-sm text-muted">
        Önerilen satış aralığı maliyetin 2.5×–4×’i: işçilik, arıza ve tekrar için pay.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <MeasureLabel>
          {fmt(result.low)} – {fmt(result.high)} ₺
        </MeasureLabel>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between font-mono text-sm text-text">
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
