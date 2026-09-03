"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formspreeAction, site } from "@/lib/site";
import { composeMailto, contactSchema, type ContactValues } from "@/lib/forms";
import { FormDirectCtas, useFormspreeReady } from "@/components/forms/form-unavailable";
import { useToast } from "@/components/ui/toaster";

export function ContactForm({
  subjects,
}: {
  subjects: { value: string; label: string }[];
}) {
  const ready = useFormspreeReady();
  const { push } = useToast();
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      topic: subjects[0]?.value ?? "genel",
      message: "",
    },
  });

  async function onSubmit(values: ContactValues) {
    setSending(true);
    try {
      if (!ready) {
        window.location.href = composeMailto(site.email, "Auro3DBaskı iletişim", [
          `Ad: ${values.name}`,
          `E-posta: ${values.email}`,
          `Konu: ${values.topic}`,
          "",
          values.message,
        ]);
        push("E-posta uygulamanız açılıyor.");
        return;
      }

      const body = new FormData();
      body.set("_subject", "Auro3DBaskı iletişim");
      body.set("name", values.name);
      body.set("email", values.email);
      body.set("topic", values.topic);
      body.set("message", values.message);
      const res = await fetch(formspreeAction(), {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("send");
      reset();
      push("Mesaj alındı. Dönüş yaparız.");
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
          <FormDirectCtas subject="Auro3DBaskı iletişim" />
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
        Konu
        <select
          {...register("topic")}
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
          {...register("message")}
          rows={5}
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
        {errors.message ? (
          <span role="alert" className="text-xs text-accent-2">
            {errors.message.message}
          </span>
        ) : null}
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
        {sending ? "Gönderiliyor" : "Gönder"}
      </button>
    </form>
  );
}
