"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { composeMailto } from "@/lib/forms";
import { formspreeAction, site } from "@/lib/site";
import {
  FormDirectCtas,
  useFormspreeReady,
} from "@/components/forms/form-unavailable";
import { useToast } from "@/components/ui/toaster";

const ideaSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  idea: z.string().trim().min(8, "En az 8 karakter yazın."),
});

type IdeaValues = z.infer<typeof ideaSchema>;

export function IdeaForm() {
  const ready = useFormspreeReady();
  const { push } = useToast();
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IdeaValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { email: "", idea: "" },
  });

  async function onSubmit(values: IdeaValues) {
    setSending(true);
    try {
      if (!ready) {
        window.location.href = composeMailto(site.email, "Video önerisi", [
          `E-posta: ${values.email}`,
          "",
          values.idea,
        ]);
        push("E-posta uygulamanız açılıyor.");
        return;
      }
      const body = new FormData();
      body.set("_subject", "Video önerisi");
      body.set("email", values.email);
      body.set("idea", values.idea);
      const res = await fetch(formspreeAction(), {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("send");
      reset();
      push("Öneri alındı.");
    } catch {
      push("Gönderilemedi. Doğrudan e-posta ile yazın.", "err");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 grid gap-3 rounded-md border border-white/10 bg-ink-soft p-5"
      noValidate
    >
      {!ready ? (
        <div className="grid gap-3">
          <p className="text-sm text-muted">
            Form altyapısı kapalı. Öneriyi e-posta veya Instagram’dan da
            iletebilirsiniz.
          </p>
          <FormDirectCtas subject="Video önerisi" />
        </div>
      ) : null}
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
        Ne test edelim?
        <textarea
          {...register("idea")}
          rows={4}
          className="rounded-md border border-white/15 bg-ink px-3 py-2 text-text"
        />
        {errors.idea ? (
          <span role="alert" className="text-xs text-accent-2">
            {errors.idea.message}
          </span>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={sending}
        className="btn-glow w-fit rounded-md px-4 py-2.5 font-display text-sm font-semibold hover:brightness-110 disabled:opacity-60"
      >
        {sending ? "Gönderiliyor" : "Gönder"}
      </button>
    </form>
  );
}
