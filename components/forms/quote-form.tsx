"use client";

import { type FormEvent, useState } from "react";
import { productionMaterials } from "@/data/content";
import { formspreeAction } from "@/lib/site";
import { FormUnavailable, useFormspreeReady } from "@/components/forms/form-unavailable";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const FILE_ACCEPT = ".step,.stp,.stl,.3mf";
const FILE_HINT =
  "Desteklenen formatlar: .STEP, .STP, .STL, .3MF (Maksimum 25MB veya Drive/WeTransfer bağlantısı).";

export function QuoteForm() {
  const ready = useFormspreeReady();
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <FormUnavailable />;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement | null;
    const urlInput = form.elements.namedItem("fileUrl") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    const url = urlInput?.value.trim() ?? "";

    if (file && file.size > MAX_FILE_BYTES) {
      event.preventDefault();
      setError("Dosya 25MB sınırını aşıyor. Drive veya WeTransfer bağlantısı kullanın.");
      return;
    }

    if (!file && !url) {
      event.preventDefault();
      setError(FILE_HINT);
    }
  }

  return (
    <form
      action={formspreeAction()}
      method="POST"
      encType="multipart/form-data"
      onSubmit={onSubmit}
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
        Model dosyası
        <input
          name="file"
          type="file"
          accept={FILE_ACCEPT}
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-text"
        />
        <span className="text-xs text-muted">{FILE_HINT}</span>
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Drive / WeTransfer bağlantısı
        <input
          name="fileUrl"
          type="url"
          placeholder="https://"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-accent-2">
          {error}
        </p>
      ) : null}
      <label className="grid gap-1 text-sm text-muted">
        Not
        <textarea name="note" rows={4} className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
      </label>
      <button
        type="submit"
        className="btn-glow w-fit rounded-md px-4 py-2.5 font-display text-sm font-semibold hover:brightness-110"
      >
        Teklif iste
      </button>
    </form>
  );
}
