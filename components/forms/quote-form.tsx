"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productionMaterials } from "@/data/content";
import { formspreeAction, site } from "@/lib/site";
import {
  FILE_ACCEPT,
  MAX_FILE_BYTES,
  composeMailto,
  quoteSchema,
  type QuoteValues,
} from "@/lib/forms";
import { FormDirectCtas, useFormspreeReady } from "@/components/forms/form-unavailable";
import { useToast } from "@/components/ui/toaster";

const FILE_HINT =
  "Desteklenen formatlar: .STEP, .STP, .STL, .3MF (Maksimum 25MB veya Drive/WeTransfer bağlantısı).";

export function QuoteForm() {
  const ready = useFormspreeReady();
  const { push } = useToast();
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      qty: "1",
      material: productionMaterials[0]?.name ?? "PLA",
      fileUrl: "",
      note: "",
    },
  });

  async function onSubmit(values: QuoteValues, event?: React.BaseSyntheticEvent) {
    const form = event?.target as HTMLFormElement | undefined;
    const fileInput = form?.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    const url = values.fileUrl?.trim() ?? "";

    if (file && file.size > MAX_FILE_BYTES) {
      push("Dosya 25MB sınırını aşıyor. Drive veya WeTransfer kullanın.", "err");
      return;
    }
    if (!file && !url) {
      push(FILE_HINT, "err");
      return;
    }

    setSending(true);
    try {
      if (!ready) {
        window.location.href = composeMailto(site.email, "Auro3DBaskı özel üretim teklifi", [
          `Ad: ${values.name}`,
          `E-posta: ${values.email}`,
          values.phone ? `Telefon: ${values.phone}` : "",
          `Adet: ${values.qty}`,
          `Malzeme: ${values.material}`,
          url ? `Dosya: ${url}` : "",
          values.note ? `Not: ${values.note}` : "",
        ]);
        push("E-posta uygulamanız açılıyor.");
        return;
      }

      const body = new FormData();
      body.set("_subject", "Auro3DBaskı özel üretim teklifi");
      body.set("name", values.name);
      body.set("email", values.email);
      if (values.phone) body.set("phone", values.phone);
      body.set("qty", values.qty);
      body.set("material", values.material);
      if (url) body.set("fileUrl", url);
      if (values.note) body.set("note", values.note);
      if (file) body.set("file", file);

      const res = await fetch(formspreeAction(), {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("send");
      reset();
      if (fileInput) fileInput.value = "";
      push("Teklif alındı. En kısa sürede dönüş yaparız.");
    } catch {
      push("Gönderilemedi. Doğrudan e-posta ile yazın.", "err");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 rounded-md border border-white/10 bg-ink-soft p-5"
      noValidate
    >
      {!ready ? (
        <div className="grid gap-3">
          <p className="text-sm text-muted">
            Form altyapısı kapalı. Alanları doldurup gönderebilir veya doğrudan
            e-posta / Instagram’dan yazabilirsiniz.
          </p>
          <FormDirectCtas subject="Auro3DBaskı özel üretim teklifi" />
        </div>
      ) : null}
      <label className="grid gap-1 text-sm text-muted">
        Ad
        <input
          {...register("name")}
          autoComplete="name"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
        {errors.name ? (
          <span role="alert" className="text-xs text-accent-2">
            {errors.name.message}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1 text-sm text-muted">
        E-posta
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
        {errors.email ? (
          <span role="alert" className="text-xs text-accent-2">
            {errors.email.message}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Telefon
        <input
          {...register("phone")}
          type="tel"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Adet
        <input
          {...register("qty")}
          inputMode="numeric"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
        {errors.qty ? (
          <span role="alert" className="text-xs text-accent-2">
            {errors.qty.message}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Malzeme
        <select
          {...register("material")}
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        >
          {productionMaterials.map((m) => (
            <option key={m.id}>{m.name}</option>
          ))}
        </select>
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
          {...register("fileUrl")}
          type="url"
          placeholder="https://"
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
        {errors.fileUrl ? (
          <span role="alert" className="text-xs text-accent-2">
            {errors.fileUrl.message}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1 text-sm text-muted">
        Not
        <textarea
          {...register("note")}
          rows={4}
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
      </label>
      <button
        type="submit"
        disabled={sending}
        className="btn-glow inline-flex w-fit items-center gap-2 rounded-md px-4 py-2.5 font-display text-sm font-semibold hover:brightness-110 disabled:opacity-60"
      >
        {sending ? (
          <span
            className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
            aria-hidden
          />
        ) : null}
        {sending ? "Gönderiliyor" : "Teklif iste"}
      </button>
    </form>
  );
}
