"use client";

import { useEffect } from "react";
import { hasFormspree, site } from "@/lib/site";

export function useFormspreeReady(): boolean {
  const ready = hasFormspree();

  useEffect(() => {
    if (ready) return;
    console.warn(
      `[Auro3DBaskı] NEXT_PUBLIC_FORMSPREE_ID eksik. Gönderim mailto ile ${site.email} adresine gider.`,
    );
  }, [ready]);

  return ready;
}

/** Formspree yoksa: pasif uyarı değil, tıklanır mailto + Instagram. */
export function FormDirectCtas({
  subject = "Auro3DBaskı",
}: {
  subject?: string;
}) {
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={mailto}
        className="btn-glow inline-flex items-center justify-center rounded-md px-4 py-2.5 font-display text-sm font-semibold hover:brightness-110"
      >
        E-posta yaz
      </a>
      <a
        href={site.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-md border border-accent/50 px-4 py-2.5 font-display text-sm font-semibold text-text hover:border-accent-2 hover:text-accent-2"
      >
        Instagram
      </a>
    </div>
  );
}

export function FormUnavailable({
  subject = "Auro3DBaskı",
}: {
  subject?: string;
}) {
  return (
    <div
      role="status"
      className="rounded-md border border-white/10 bg-ink-soft p-5"
    >
      <p className="text-sm text-muted">
        Form altyapısı şu an kapalı. Mesajı doğrudan {site.email} adresine
        gönderin veya Instagram’dan yazın.
      </p>
      <div className="mt-4">
        <FormDirectCtas subject={subject} />
      </div>
    </div>
  );
}
