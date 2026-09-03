function sanitizeNumeric(raw: string): string {
  const cleaned = raw.replace(/[^\d.,\-]/g, "");
  let sign = "";
  let body = cleaned;
  if (body.startsWith("-")) {
    sign = "-";
    body = body.slice(1);
  }
  body = body.replace(/-/g, "");
  const sep = body.includes(",") ? "," : body.includes(".") ? "." : "";
  if (!sep) return sign + body;
  const [head, ...rest] = body.split(sep);
  return sign + head + sep + rest.join("").replace(/[.,]/g, "");
}

export function parseLocaleNumber(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t || t === "-" || t === "." || t === "-.") return Number.NaN;
  const n = Number(t);
  return Number.isFinite(n) ? n : Number.NaN;
}

/** Hesaplayıcı çıktısı: NaN/Infinity → 0. */
export function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function formatTry(value: number): string {
  return finiteOrZero(value).toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  });
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-muted">
      {label}
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(sanitizeNumeric(e.target.value))}
        className="rounded-md border border-white/15 bg-ink px-3 py-2 font-mono text-text"
      />
    </label>
  );
}
