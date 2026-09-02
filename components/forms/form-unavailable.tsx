"use client";

import { useEffect } from "react";
import { hasFormspree, site } from "@/lib/site";

export function useFormspreeReady(): boolean {
  const ready = hasFormspree();

  useEffect(() => {
    if (ready) return;
    console.warn(
      `[Auro3DBaskı] NEXT_PUBLIC_FORMSPREE_ID eksik. Formlar gönderilmiyor. Doğrudan ${site.email} adresine yazın.`,
    );
  }, [ready]);

  return ready;
}

export function FormUnavailable() {
  return (
    <p
      role="status"
      className="rounded-md border border-white/10 bg-ink-soft p-5 text-sm text-muted"
    >
      Sistem şu an bakımda, lütfen doğrudan{" "}
      <a href={`mailto:${site.email}`} className="text-accent-2">
        {site.email}
      </a>{" "}
      adresine yazın.
    </p>
  );
}
