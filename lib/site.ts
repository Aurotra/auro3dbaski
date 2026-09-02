export const brandName = "Auro3DBaskı";
export const channelName = "Auro 3D Baskı";

function envUrl(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

export const site = {
  name: brandName,
  channelName,
  shortName: "Auro3D",
  domain: "auro3dbaski.com",
  url: "https://auro3dbaski.com",
  locale: "tr_TR",
  email: "auro3dbaski@gmail.com",
  location: "Eskişehir / Türkiye",
  tagline: "Atölyeden, katman katman.",
  subtitle:
    "Teknik detayı ve pratik çözümü yazıcının başından anlatıyoruz. Tasarımdan çıkan parçaya kadar, atölyede olanı paylaşıyoruz.",
  description:
    "Auro 3D Baskı; masaüstü eklemeli imalat, malzeme bilimi ve tasarım ipuçlarını atölye deneyimiyle sunan bir dijital içerik ve inovasyon kanalıdır.",
  instagram: envUrl(
    "NEXT_PUBLIC_INSTAGRAM_URL",
    "https://www.instagram.com/auro3dbaski",
  ),
  tiktok: envUrl("NEXT_PUBLIC_TIKTOK_URL", "https://www.tiktok.com/@auro3dbaski"),
  youtube: envUrl(
    "NEXT_PUBLIC_YOUTUBE_URL",
    "https://www.youtube.com/@auro3dbaski",
  ),
};

export const nav = [
  { href: "/icerikler", label: "İçerikler" },
  { href: "/magaza", label: "Mağaza" },
  { href: "/araclar", label: "Araçlar" },
  { href: "/bilgi-bankasi", label: "Bilgi Bankası" },
  { href: "/ozel-uretim", label: "Özel Üretim" },
  { href: "/hakkimda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;

/** Menüdeki Özel Üretim sayfasından ayrı: teklif formu. */
export const ctaNav = {
  href: "/ozel-uretim#form",
  label: "Teklif Al",
} as const;

export function formspreeAction(): string {
  const id = process.env.NEXT_PUBLIC_FORMSPREE_ID?.trim();
  if (!id) {
    console.warn(
      `[Auro3DBaskı] NEXT_PUBLIC_FORMSPREE_ID eksik. Formlar gönderilmiyor. Doğrudan ${site.email} adresine yazın.`,
    );
    return "";
  }
  return `https://formspree.io/f/${id}`;
}

export function hasFormspree(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FORMSPREE_ID?.trim());
}
