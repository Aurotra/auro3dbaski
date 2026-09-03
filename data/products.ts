export const shopierStoreUrl = "https://www.shopier.com/auro3dbaski";

export type Product = {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  shopierUrl: string;
  material?: string;
  shipping?: string;
  description?: string;
  variants?: string[];
};

const LOCAL_IMAGES: Record<string, string> = {
  "41163104": "/images/shop/41163104.webp",
  "50347929": "/images/shop/50347929.webp",
  "49717093": "/images/shop/49717093.webp",
  "49717068": "/images/shop/49717068.webp",
};

/** Shopier vitrininde uzantısız kalan görseller — ürün sayfasındaki çalışan kopya. */
const IMAGE_OVERRIDES: Record<string, string> = {
  "49379876":
    "https://cdn.shopier.app/pictures_large/Auro3dbaski_b83d4424e8766b7674242d77f18e2e2b.png",
  "48020449":
    "https://cdn.shopier.app/pictures_large/Auro3dbaski_5afe9eb02c7e6e15da11ae0272cec0ab.png",
};

const MATERIAL_BY_ID: Record<string, string> = {
  "41163104": "PETG",
  "50347929": "PLA+",
  "49717093": "PLA+",
  "49717068": "PLA+",
  "49379931": "PLA+",
  "49379907": "PLA+",
  "49379876": "PLA+",
  "49379845": "PLA+",
  "41369888": "PETG",
  "41369851": "PETG",
};

const DEFAULT_SHIPPING = "1-2 İş Günü";

const SARDALYA_VARIANTS = [
  "Metalik",
  "Mor",
  "Krem & Soft Pembe",
  "Krem & Pembe",
  "Mavi",
  "Pembe",
];

const KIZILAY_VARIANTS = ["Tabela", "Anahtarlık", "Magnet"];

const DESCRIPTION_BY_ID: Record<string, string> = {
  "41163104": "Kızılay meydanı tabelası — masaüstü ölçek.",
  "50347929": "GTA VI kapak diski. Duvar / raf dekoru.",
  "49717093": "Sardalya kutu formunda takı kutusu. Metalik PLA+.",
  "49717068": "Sardalya kutu formunda takı kutusu. Mor PLA+.",
  "49379931": "Sardalya kutu formunda takı kutusu. Krem ve soft pembe.",
  "49379907": "Sardalya kutu formunda takı kutusu. Krem ve pembe.",
  "49379876": "Sardalya kutu formunda takı kutusu. Mavi.",
  "49379845": "Sardalya kutu formunda takı kutusu. Pembe.",
  "48304917": "Chameleon figür — altı poz.",
  "48020449": "Nissan Skyline RB26 kesit motor. Vitrin modeli.",
  "47251112": "Kart okuyucu / ödeme asası formu.",
  "44278985": "Saat standı. Masaüstü düzen.",
  "43560642": "Anı Müzesi eki: çerçeve, figür, eser seti.",
  "43559813": "Kişiye özel Anı Müzesi — 3D çerçeve.",
  "42365663": "Yılbaşı temalı Stitch figürü.",
  "42129542": "LUMİRA ambiyans ışığı. Atölye lambası.",
  "41369888": "Kızılay tabelası anahtarlık ölçeği.",
  "41369851": "Kızılay tabelası magnet.",
};

const VARIANTS_BY_ID: Record<string, string[]> = {
  "41163104": KIZILAY_VARIANTS,
  "41369888": KIZILAY_VARIANTS,
  "41369851": KIZILAY_VARIANTS,
  "49717093": SARDALYA_VARIANTS,
  "49717068": SARDALYA_VARIANTS,
  "49379931": SARDALYA_VARIANTS,
  "49379907": SARDALYA_VARIANTS,
  "49379876": SARDALYA_VARIANTS,
  "49379845": SARDALYA_VARIANTS,
};

export function decorateProduct(product: Product): Product {
  return {
    ...product,
    imageUrl:
      LOCAL_IMAGES[product.id] ??
      IMAGE_OVERRIDES[product.id] ??
      product.imageUrl,
    material: product.material ?? MATERIAL_BY_ID[product.id],
    shipping: product.shipping ?? DEFAULT_SHIPPING,
    description: product.description ?? DESCRIPTION_BY_ID[product.id],
    variants: product.variants ?? VARIANTS_BY_ID[product.id],
  };
}

/**
 * Shopier canlı çekimi düşerse kullanılan son doğrulanmış vitrin.
 * Mağazadaki 18 ürün — uydurma kart yok.
 */
export const products: Product[] = [
  {
    id: "41163104",
    title: "Ankara Kızılay Tabelası",
    price: "199,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_624d0c35d822ecea1f17d66aa34325b9.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/41163104",
  },
  {
    id: "50347929",
    title: "GTA VI - 3D Dekorasyon Disk",
    price: "299,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_cd60f76c0aebabdaf745f0b6d5a84148.jpeg",
    shopierUrl: "https://www.shopier.com/auro3dbaski/50347929",
  },
  {
    id: "49717093",
    title: "Sardalya Takı Kutusu | Metalik",
    price: "459,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_fbe0e3b82618d541d2bdcf1709ac4285.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/49717093",
  },
  {
    id: "49717068",
    title: "Sardalya Takı Kutusu | Mor",
    price: "459,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_d1573df1f67ace35b63516b03bc83ac2.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/49717068",
  },
  {
    id: "49379931",
    title: "Sardalya Takı Kutusu | Krem & Soft Pembe",
    price: "459,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_3d49453b38f2c899741208e68192e724.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/49379931",
  },
  {
    id: "49379907",
    title: "Sardalya Takı Kutusu | Krem & Pembe",
    price: "459,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_ceb641ea55d87e4b90c2c2510754604a.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/49379907",
  },
  {
    id: "49379876",
    title: "Sardalya Takı Kutusu | Mavi",
    price: "499,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_large/Auro3dbaski_b83d4424e8766b7674242d77f18e2e2b.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/49379876",
  },
  {
    id: "49379845",
    title: "Sardalya Takı Kutusu | Pembe",
    price: "459,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_11bae433fcd3a5ccfd908a2a660f95cf.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/49379845",
  },
  {
    id: "48304917",
    title: "MECCHA CHAMELEON 6'lı Poz Seti",
    price: "379,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_9db8a67e87fb5bca58115ba18d7531d3.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/48304917",
  },
  {
    id: "48020449",
    title: "3D Baskı Nissan Skyline RB26 Motor",
    price: "2.899,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_large/Auro3dbaski_5afe9eb02c7e6e15da11ae0272cec0ab.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/48020449",
  },
  {
    id: "47251112",
    title: "Sihirli Ödeme Asası",
    price: "449,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_c625fd487d34cef27db31f1b7cc73fed.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/47251112",
  },
  {
    id: "44278985",
    title: "Saat standı",
    price: "350,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_8bb0a1eb61187ae55b9a4a137f94b27b.jpeg",
    shopierUrl: "https://www.shopier.com/auro3dbaski/44278985",
  },
  {
    id: "43560642",
    title: "6 Çerçeve, 6 Figür, 2 Eser",
    price: "449,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_14e583fa139a331aaf11b94f879092ef.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/43560642",
  },
  {
    id: "43559813",
    title: "Kişiye Özel Anılar Müzesi – 3D Çerçeve",
    price: "1.699,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_c5491d60440a52624bcb2ad13aa6b842.png",
    shopierUrl: "https://www.shopier.com/auro3dbaski/43559813",
  },
  {
    id: "42365663",
    title: "Yılbaşı Temalı Stitch",
    price: "799,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_65943b4b8934cea5da86d0c16095cb73.jpeg",
    shopierUrl: "https://www.shopier.com/auro3dbaski/42365663",
  },
  {
    id: "42129542",
    title: "LUMİRA - Ambiyans Işığı",
    price: "799,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_dd6520698df78aedb09701d01dd909d6.jpeg",
    shopierUrl: "https://www.shopier.com/auro3dbaski/42129542",
  },
  {
    id: "41369888",
    title: "Kızılay Tabelası Anahtarlık",
    price: "99,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_88b1327abc1e65f91ec88e2f03a49e11.jpeg",
    shopierUrl: "https://www.shopier.com/auro3dbaski/41369888",
  },
  {
    id: "41369851",
    title: "Kızılay Tabelası Magnet",
    price: "99,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_f8285d961f8bebcf3b39644c2e682d92.jpeg",
    shopierUrl: "https://www.shopier.com/auro3dbaski/41369851",
  },
].map(decorateProduct);
