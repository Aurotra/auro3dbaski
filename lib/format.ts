function trimCompact(value: number): string {
  if (value >= 10) return String(Math.round(value));
  const rounded = Math.round(value * 10) / 10;
  return rounded.toFixed(1).replace(/\.0$/, "");
}

/** 7200 → "7.2K+", 3000000 → "3M+" */
export function formatCompactPlus(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0+";
  if (n >= 1_000_000) return `${trimCompact(n / 1_000_000)}M+`;
  if (n >= 1_000) return `${trimCompact(n / 1_000)}K+`;
  return `${Math.round(n).toLocaleString("tr-TR")}+`;
}

/** 3000000 → "3.000.000+" */
export function formatGroupedPlus(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0+";
  return `${Math.round(n).toLocaleString("tr-TR")}+`;
}

export function parseAbbreviatedCount(raw: string, locale: "tr" | "en" = "en"): number | null {
  const text = raw.replace(/\u00a0/g, " ").trim();
  if (!text) return null;

  const match = text.match(
    /([\d]+(?:[.,]\d+)*)\s*(bin|milyon|mn|mr|k|m|b)?/i,
  );
  if (!match) return null;

  const rawNum = match[1];
  const suffix = (match[2] ?? "").toLowerCase();

  let value: number;
  if (suffix) {
    value = Number(rawNum.replace(",", "."));
  } else if ((rawNum.match(/\./g) ?? []).length > 1) {
    value = Number(rawNum.replace(/\./g, ""));
  } else if ((rawNum.match(/,/g) ?? []).length > 1) {
    value = Number(rawNum.replace(/,/g, ""));
  } else if (locale === "tr" && /^\d{1,3}(\.\d{3})+$/.test(rawNum)) {
    value = Number(rawNum.replace(/\./g, ""));
  } else if (/^\d{1,3}(,\d{3})+$/.test(rawNum)) {
    value = Number(rawNum.replace(/,/g, ""));
  } else {
    value = Number(rawNum.replace(",", "."));
  }

  if (!Number.isFinite(value)) return null;

  if (suffix === "k") return Math.round(value * 1_000);
  if (suffix === "milyon" || suffix === "mn") return Math.round(value * 1_000_000);
  if (suffix === "bin") return Math.round(value * 1_000);
  if (suffix === "mr") return Math.round(value * 1_000_000_000);
  if (suffix === "m") return Math.round(value * 1_000_000);
  if (suffix === "b") {
    return locale === "tr" ? Math.round(value * 1_000) : Math.round(value * 1_000_000_000);
  }

  return Math.round(value);
}
