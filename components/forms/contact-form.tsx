"use client";

import { formspreeAction } from "@/lib/site";

export function ContactForm({
  subjects,
}: {
  subjects: { value: string; label: string }[];
}) {
  return (
    <form
      action={formspreeAction()}
      method="POST"
      className="grid gap-4 rounded-md border border-white/10 bg-ink-soft p-5"
    >
      <input type="hidden" name="_subject" value="Auro3DBaskı iletişim" />
      <label className="grid gap-1 text-sm text-muted">
        Ad
        <input
          required
          name="name"
          autoComplete="name"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        E-posta
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Konu
        <select
          name="topic"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        >
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Mesaj
        <textarea
          required
          name="message"
          rows={5}
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
      </label>
      <button
        type="submit"
        className="btn-glow w-fit rounded-md px-4 py-2.5 font-display text-sm font-semibold hover:brightness-110"
      >
        Gönder
      </button>
    </form>
  );
}
