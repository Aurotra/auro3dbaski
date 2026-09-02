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
  tagline: "Katman Katman Mühendislik, Sınır Tanımayan Üretim.",
  subtitle:
    "3D baskı dünyasındaki teknik detayları, pratik çözümleri ve üretim süreçlerini keşfedin. Tasarımdan nihai parçaya uzanan yolculuğu birlikte şekillendiriyoruz.",
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

export function formspreeAction(): string {
  const id = process.env.NEXT_PUBLIC_FORMSPREE_ID?.trim();
  return id ? `https://formspree.io/f/${id}` : "https://formspree.io/f/xxxxxxxx";
}

export function hasFormspree(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FORMSPREE_ID?.trim());
}
