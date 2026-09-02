export const shopierStoreUrl = "https://www.shopier.com/auro3dbaski";

export type ShopierProduct = {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  url: string;
};

/**
 * Shopier canlı çekimi başarısız olursa kullanılan son doğrulanmış vitrin.
 * Uydurma ürün yok — yalnızca mağazada listelenmiş kartlar.
 */
export const fallbackProducts: ShopierProduct[] = [
  {
    id: "41163104",
    title: "Ankara Kızılay Tabelası",
    price: "199,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_624d0c35d822ecea1f17d66aa34325b9.png",
    url: "https://www.shopier.com/auro3dbaski/41163104",
  },
  {
    id: "50347929",
    title: "GTA VI - 3D Dekorasyon Disk",
    price: "299,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_cd60f76c0aebabdaf745f0b6d5a84148.jpeg",
    url: "https://www.shopier.com/auro3dbaski/50347929",
  },
  {
    id: "49717093",
    title: "Sardalya Takı Kutusu | Metalik",
    price: "459,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_fbe0e3b82618d541d2bdcf1709ac4285.png",
    url: "https://www.shopier.com/auro3dbaski/49717093",
  },
  {
    id: "49717068",
    title: "Sardalya Takı Kutusu | Mor",
    price: "459,00 TL",
    imageUrl:
      "https://cdn.shopier.app/pictures_mid/Auro3dbaski_d1573df1f67ace35b63516b03bc83ac2.png",
    url: "https://www.shopier.com/auro3dbaski/49717068",
  },
];
