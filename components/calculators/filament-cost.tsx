"use client";

import { useMemo, useState } from "react";
import { MeasureLabel } from "@/components/ui/measure-label";

export function FilamentCostCalc() {
  const [grams, setGrams] = useState(50);
  const [priceKg, setPriceKg] = useState(400);
  const [hours, setHours] = useState(4);
  const [kwh, setKwh] = useState(3.2);
  const [watts, setWatts] = useState(120);
  const [waste, setWaste] = useState(10);

  const result = useMemo(() => {
    const material = (grams / 1000) * priceKg * (1 + waste / 100);
    const electricity = hours * (watts / 1000) * kwh;
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
        <Field label="Parça ağırlığı (g)" value={grams} onChange={setGrams} />
        <Field label="Filament (TL/kg)" value={priceKg} onChange={setPriceKg} />
        <Field label="Baskı süresi (saat)" value={hours} onChange={setHours} step={0.1} />
        <Field label="Elektrik (TL/kWh)" value={kwh} onChange={setKwh} step={0.1} />
        <Field label="Yazıcı gücü (W)" value={watts} onChange={setWatts} />
        <Field label="Fire (%)" value={waste} onChange={setWaste} />
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
        <MeasureLabel>{fmt(result.low)} – {fmt(result.high)} ₺</MeasureLabel>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="grid gap-1 text-sm text-muted">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border border-white/15 bg-ink px-3 py-2 font-mono text-text"
      />
    </label>
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
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
}
