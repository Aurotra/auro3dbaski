"use client";

import { useState, type FormEvent } from "react";
import { quoteMaterials, site } from "@/lib/site";

type Status = "idle" | "ready";

export function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const material = String(data.get("material") ?? "").trim();
    const qty = String(data.get("qty") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();

    const body = [
      `Ad: ${name}`,
      `E-posta: ${email}`,
      `Malzeme: ${material}`,
      `Adet: ${qty || "belirtilmedi"}`,
      "",
      note,
      "",
      "— auro3dbaski.com/teklif",
    ].join("\n");

    const href = `mailto:${site.email}?subject=${encodeURIComponent(
      `Baskı teklifi — ${name}`,
    )}&body=${encodeURIComponent(body)}`;

    setStatus("ready");
    window.location.href = href;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="grid gap-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
          Ad
        </span>
        <input
          required
          name="name"
          autoComplete="name"
          className="border border-line bg-chamber px-3 py-3 text-bone outline-none focus:border-cyan"
        />
      </label>
      <label className="grid gap-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
          E-posta
        </span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="border border-line bg-chamber px-3 py-3 text-bone outline-none focus:border-cyan"
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            Malzeme
          </span>
          <select
            required
            name="material"
            defaultValue=""
            className="border border-line bg-chamber px-3 py-3 text-bone outline-none focus:border-cyan"
          >
            <option value="" disabled>
              Seç
            </option>
            {quoteMaterials.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            Adet
          </span>
          <input
            name="qty"
            inputMode="numeric"
            placeholder="1"
            className="border border-line bg-chamber px-3 py-3 text-bone outline-none focus:border-cyan"
          />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
          Parça notu
        </span>
        <textarea
          required
          name="note"
          rows={5}
          placeholder="Ölçü, malzeme rengi, teslim tarihi, STL bağlantısı…"
          className="resize-y border border-line bg-chamber px-3 py-3 text-bone outline-none focus:border-cyan"
        />
      </label>
      <p className="text-sm text-muted">
        Gönder, e-posta uygulamanı {site.email} adresine açar. Dosyayı o
        maile eklemen yeterli.
      </p>
      <button
        type="submit"
        className="w-fit bg-lime px-5 py-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-chamber hover:bg-cyan"
      >
        Teklifi hazırla
      </button>
      {status === "ready" ? (
        <p className="text-sm text-cyan">
          Mail penceresi açılmazsa Instagram’dan {site.instagramHandle} yaz.
        </p>
      ) : null}
    </form>
  );
}
