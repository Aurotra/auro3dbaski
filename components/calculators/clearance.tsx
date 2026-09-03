"use client";

import { useMemo, useState } from "react";
import { NumberField, finiteOrZero, parseLocaleNumber } from "@/components/calculators/number-field";
import { MeasureLabel } from "@/components/ui/measure-label";

const fits = {
  bosluklu: 0.4,
  normal: 0.25,
  siki: 0.12,
  "press-fit": 0,
} as const;

const materialBias = {
  PLA: 0,
  PETG: 0.05,
  Naylon: 0.1,
  ABS: 0.05,
} as const;

export function ClearanceCalc() {
  const [nominal, setNominal] = useState("10");
  const [fit, setFit] = useState<keyof typeof fits>("normal");
  const [material, setMaterial] = useState<keyof typeof materialBias>("PLA");

  const clearance = useMemo(
    () => fits[fit] + materialBias[material],
    [fit, material],
  );

  const size = parseLocaleNumber(nominal);
  const base = finiteOrZero(size);
  const hole = finiteOrZero(base + clearance);
  const shaft = finiteOrZero(base - clearance);

  return (
    <div className="rounded-md border border-white/10 bg-ink-soft p-5">
      <h2 className="font-display text-2xl text-text">Geçme toleransı</h2>
      <div className="mt-4 grid gap-3">
        <NumberField
          label="Nominal ölçü (mm)"
          value={nominal}
          onChange={setNominal}
        />
        <label className="grid gap-1 text-sm text-muted">
          Geçme tipi
          <select
            value={fit}
            onChange={(e) => setFit(e.target.value as keyof typeof fits)}
            className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
          >
            <option value="bosluklu">Boşluklu</option>
            <option value="normal">Normal</option>
            <option value="siki">Sıkı</option>
            <option value="press-fit">Press-fit</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm text-muted">
          Malzeme
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value as keyof typeof materialBias)}
            className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
          >
            {Object.keys(materialBias).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 space-y-2">
        <MeasureLabel>clearance {clearance.toFixed(2)} mm</MeasureLabel>
        <p className="font-mono text-sm text-muted">
          Delik ≈ {hole.toFixed(2)} mm · mil ≈ {shaft.toFixed(2)} mm
        </p>
      </div>
      <p className="mt-4 text-sm text-muted">
        Bu değerler başlangıç noktasıdır, kendi yazıcınızda test basmadan seri
        üretime geçmeyin.
      </p>
    </div>
  );
}
