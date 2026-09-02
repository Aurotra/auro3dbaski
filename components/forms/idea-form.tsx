"use client";

import { formspreeAction } from "@/lib/site";
import { FormUnavailable, useFormspreeReady } from "@/components/forms/form-unavailable";

export function IdeaForm() {
  const ready = useFormspreeReady();
  if (!ready) return <FormUnavailable />;

  return (
    <form
      action={formspreeAction()}
      method="POST"
      className="mt-6 grid gap-3 rounded-md border border-white/10 bg-ink-soft p-5"
    >
      <input type="hidden" name="_subject" value="Video önerisi" />
      <label className="grid gap-1 text-sm text-muted">
        E-posta
        <input required type="email" name="email" className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Ne test edelim?
        <textarea required name="idea" rows={4} className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text" />
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
