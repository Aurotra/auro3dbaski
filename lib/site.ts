export const brandName = "Auro3DBaskı";

export const site = {
  name: brandName,
  shortName: "Auro3D",
  domain: "auro3dbaski.com",
  url: "https://auro3dbaski.com",
  locale: "tr_TR",
  email: "auro3dbaski@gmail.com",
  location: "Eskişehir / Türkiye",
  tagline: "Atölyeden, ölçerek.",
  description:
    "Mühendislik toleranslarına uygun FDM ve SLA üretim, Türkçe 3D baskı içeriği ve kendi tasarladığımız ürünler.",
  instagram: "https://www.instagram.com/auro3dbaski",
  // TODO: TikTok ve YouTube hesap URL'lerini doğrula
  tiktok: "https://www.tiktok.com/@auro3dbaski",
  youtube: "https://www.youtube.com/@auro3dbaski",
} as const;

export const nav = [
  { href: "/icerikler", label: "İçerikler" },
  { href: "/magaza", label: "Mağaza" },
  { href: "/araclar", label: "Araçlar" },
  { href: "/bilgi-bankasi", label: "Bilgi Bankası" },
  { href: "/gunluk", label: "Günlük" },
  { href: "/ozel-uretim", label: "Özel Üretim" },
  { href: "/hakkimda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export function formspreeAction(): string {
  const id = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  // TODO: NEXT_PUBLIC_FORMSPREE_ID değerini Formspree panelinden ekle
  return id ? `https://formspree.io/f/${id}` : "https://formspree.io/f/xxxxxxxx";
}
