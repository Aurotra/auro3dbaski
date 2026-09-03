import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter."),
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  topic: z.string().trim().min(1),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter."),
});

export const quoteSchema = z
  .object({
    name: z.string().trim().min(2, "Ad en az 2 karakter."),
    email: z.string().trim().email("Geçerli bir e-posta girin."),
    phone: z.string().trim().optional().or(z.literal("")),
    qty: z
      .string()
      .trim()
      .min(1, "Adet gerekli.")
      .refine((v) => {
        const n = Number(v.replace(",", "."));
        return Number.isFinite(n) && n > 0;
      }, "Adet 0’dan büyük olmalı."),
    material: z.string().trim().min(1),
    deadline: z.string().optional().or(z.literal("")),
    fileUrl: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => !v || /^https?:\/\//i.test(v),
        "Bağlantı http veya https ile başlamalı.",
      ),
    note: z.string().optional().or(z.literal("")),
  });

export type ContactValues = z.infer<typeof contactSchema>;
export type QuoteValues = z.infer<typeof quoteSchema>;

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const FILE_ACCEPT = ".step,.stp,.stl,.3mf";

export function composeMailto(to: string, subject: string, lines: string[]): string {
  const body = lines.filter((line) => line.length > 0).join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
