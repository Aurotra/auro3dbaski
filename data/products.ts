export type ProductCategory =
  | "taki-kutulari"
  | "ev-dekoru"
  | "kisisellestirilmis-hediyeler";

export type ProductPlatform = "shopier" | "trendyol" | "etsy";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  summary: string;
  priceRange: string;
  images: string[];
  platforms: Partial<Record<ProductPlatform, string>>;
  variants: string[];
  leadTime: string;
  shippingNote: string;
  material: string;
  featured?: boolean;
};

export const productCategories: { id: ProductCategory | "all"; label: string }[] =
  [
    { id: "all", label: "Tümü" },
    { id: "taki-kutulari", label: "Takı Kutuları" },
    { id: "ev-dekoru", label: "Ev Dekoru" },
    { id: "kisisellestirilmis-hediyeler", label: "Kişiselleştirilmiş Hediyeler" },
  ];

export const products: Product[] = [
  {
    id: "p1",
    name: "Sardalya Takı Kutusu",
    slug: "sardalya-taki-kutusu",
    category: "taki-kutulari",
    summary: "Kapaklı, bölmeli takı kutusu. // TODO: açıklama",
    priceRange: "TODO ₺",
    images: ["/posters/urun-sardalya.svg"],
    platforms: {
      // TODO: Shopier / Trendyol / Etsy linkleri
    },
    variants: ["TODO: renk"],
    leadTime: "TODO: üretim süresi",
    shippingNote: "TODO: kargo notu",
    material: "TODO: malzeme",
    featured: true,
  },
  {
    id: "p2",
    name: "Mini Manyetik Vazo",
    slug: "mini-manyetik-vazo",
    category: "ev-dekoru",
    summary: "Metal yüzeye tutunan küçük vazo. // TODO: açıklama",
    priceRange: "TODO ₺",
    images: ["/posters/urun-vazo.svg"],
    platforms: {},
    variants: ["TODO: renk"],
    leadTime: "TODO: üretim süresi",
    shippingNote: "TODO: kargo notu",
    material: "TODO: malzeme",
    featured: true,
  },
  {
    id: "p3",
    name: "Şehir Haritası Duvar Panosu",
    slug: "sehir-haritasi-duvar-panosu",
    category: "ev-dekoru",
    summary: "Katmanlı şehir silueti. // TODO: açıklama",
    priceRange: "TODO ₺",
    images: ["/posters/urun-harita.svg"],
    platforms: {},
    variants: ["TODO: şehir"],
    leadTime: "TODO: üretim süresi",
    shippingNote: "TODO: kargo notu",
    material: "TODO: malzeme",
    featured: true,
  },
  {
    id: "p4",
    name: "Kişiselleştirilmiş Hafıza Kartı",
    slug: "kisisellestirilmis-hafiza-karti",
    category: "kisisellestirilmis-hediyeler",
    summary: "İsim / tarih kabartmalı kart. // TODO: açıklama",
    priceRange: "TODO ₺",
    images: ["/posters/urun-kart.svg"],
    platforms: {},
    variants: ["TODO: metin"],
    leadTime: "TODO: üretim süresi",
    shippingNote: "TODO: kargo notu",
    material: "TODO: malzeme",
    featured: true,
  },
];
