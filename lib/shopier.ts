import { unstable_cache } from "next/cache";
import {
  decorateProduct,
  products as fallbackProducts,
  shopierStoreUrl,
  type Product,
} from "@/data/products";
import { fetchText } from "@/lib/http";

export type ShopierCatalog = {
  products: Product[];
  source: "live" | "fallback";
};

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseShopierHtml(html: string): Product[] {
  const section = html
    .split('id="shopier--product-list-section"')[1]
    ?.split('id="shopier--product-card-template-canvas"')[0];
  if (!section) return [];

  const pattern =
    /data-back-id="(\d+)"[\s\S]*?src="(https:\/\/cdn\.shopier\.app\/[^"]+)"[\s\S]*?shopier-store--store-product-card-title">([^<]*)<\/h3>[\s\S]*?data-price="([^"]+)"/g;

  const items: Product[] = [];
  const seen = new Set<string>();

  for (const match of section.matchAll(pattern)) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    items.push(
      decorateProduct({
        id,
        title: decodeEntities(match[3]),
        price: decodeEntities(match[4]),
        imageUrl: match[2],
        shopierUrl: `https://www.shopier.com/auro3dbaski/${id}`,
      }),
    );
  }

  return items;
}

async function fetchShopierUncached(): Promise<ShopierCatalog> {
  const html = await fetchText(shopierStoreUrl);
  if (html) {
    const live = parseShopierHtml(html);
    if (live.length > 0) return { products: live, source: "live" };
  }

  return { products: fallbackProducts, source: "fallback" };
}

export const getShopierProducts = unstable_cache(
  fetchShopierUncached,
  ["shopier-products-v2"],
  { revalidate: 3600 },
);
