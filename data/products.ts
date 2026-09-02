export const shopierStoreUrl = "https://www.shopier.com/auro3dbaski";

export type Product = {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  shopierUrl: string;
  material: string;
  shipping: string;
};

/**
 * Mağaza vitrininin tek kaynağı. Canlı Shopier çekimi yok —
 * ürün, fiyat ve görsel bu listeden statik gelir.
 */
export const products: Product[] = [
  {
    id: "41163104",
    title: "Ankara Kızılay Tabelası",
    price: "199,00 TL",
    imageUrl: "/images/shop/41163104.webp",
    shopierUrl: "https://www.shopier.com/auro3dbaski/41163104",
    material: "PETG",
    shipping: "1-2 İş Günü",
  },
  {
    id: "50347929",
    title: "GTA VI - 3D Dekorasyon Disk",
    price: "299,00 TL",
    imageUrl: "/images/shop/50347929.webp",
    shopierUrl: "https://www.shopier.com/auro3dbaski/50347929",
    material: "PLA+",
    shipping: "1-2 İş Günü",
  },
  {
    id: "49717093",
    title: "Sardalya Takı Kutusu | Metalik",
    price: "459,00 TL",
    imageUrl: "/images/shop/49717093.webp",
    shopierUrl: "https://www.shopier.com/auro3dbaski/49717093",
    material: "PLA+",
    shipping: "1-2 İş Günü",
  },
  {
    id: "49717068",
    title: "Sardalya Takı Kutusu | Mor",
    price: "459,00 TL",
    imageUrl: "/images/shop/49717068.webp",
    shopierUrl: "https://www.shopier.com/auro3dbaski/49717068",
    material: "PLA+",
    shipping: "1-2 İş Günü",
  },
];
