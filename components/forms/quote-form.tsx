"use client";

import { productionMaterials } from "@/data/content";
import { formspreeAction } from "@/lib/site";

export function QuoteForm() {
  return (
    <form
      action={formspreeAction()}
      method="POST"
      className="grid gap-4 rounded-md border border-white/10 bg-ink-soft p-5"
    >
      <input type="hidden" name="_subject" value="Auro3DBaskı özel üretim teklifi" />
      <label className="grid gap-1 text-sm text-muted">
        Ad
        <input required name="name" className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        E-posta
        <input required type="email" name="email" className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Telefon
        <input name="phone" type="tel" className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Adet
        <input required name="qty" inputMode="numeric" className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Malzeme
        <select name="material" className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text">
          {productionMaterials.map((m) => (
            <option key={m.id}>{m.name}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Teslim tarihi
        <input name="deadline" type="date" className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Model dosyası linki (WeTransfer / Drive)
        <input
          required
          name="fileUrl"
          type="url"
          placeholder="https://"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Not
        <textarea name="note" rows={4} className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
      </label>
      <button
        type="submit"
        className="w-fit rounded-md bg-accent px-4 py-2.5 font-display text-sm text-ink hover:bg-accent-2"
      >
        Teklif iste
      </button>
    </form>
  );
}
