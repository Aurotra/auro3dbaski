import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import {
  decorateProduct,
  products as fallbackProducts,
  shopierStoreUrl,
  type Product,
} from "@/data/products";
import { fetchText } from "@/lib/http";

export const SHOPIER_REVALIDATE_SECONDS = 300;
export const SHOPIER_CACHE_TAG = "shopier-products";

const SHOPIER_STORE_URLS = [
  shopierStoreUrl,
  "https://www.shopier.com/Auro3dbaski",
];

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

function extractProductListHtml(html: string): string | null {
  const after = html.split('id="shopier--product-list-section"')[1];
  if (!after) return null;
  return (
    after.split('id="shopier--product-card-template-canvas"')[0] ?? after
  );
}

function attrPrice(
  body: string,
  kind: "price-current" | "price-old",
): string | undefined {
  const forward = body.match(new RegExp(`${kind}[^>]*data-price="([^"]+)"`));
  if (forward?.[1]) return decodeEntities(forward[1]);
  const reverse = body.match(new RegExp(`data-price="([^"]+)"[^>]*${kind}`));
  return reverse?.[1] ? decodeEntities(reverse[1]) : undefined;
}

export function parseShopierHtml(html: string): Product[] {
  const section = extractProductListHtml(html);
  if (!section) return [];

  const items: Product[] = [];
  const seen = new Set<string>();
  const cards = section.matchAll(
    /data-back-id="(\d+)"([\s\S]*?)(?=data-back-id="\d+"|$)/g,
  );

  for (const match of cards) {
    const id = match[1];
    if (seen.has(id)) continue;

    const body = match[2];
    const title = decodeEntities(
      body.match(
        /shopier-store--store-product-card-title">([^<]*)<\/h3>/,
      )?.[1] ?? "",
    );
    const price = attrPrice(body, "price-current") ?? attrPrice(body, "price-old");
    if (!title || !price) continue;

    seen.add(id);

    const imageUrl =
      body.match(/src="(https:\/\/cdn\.shopier\.app\/[^"]+)"/)?.[1] ?? "";
    const originalPrice = attrPrice(body, "price-old");
    const discount = decodeEntities(
      body.match(/badge-discount">([^<]+)</)?.[1] ?? "",
    );

    items.push(
      decorateProduct({
        id,
        title,
        price,
        imageUrl,
        shopierUrl: `https://www.shopier.com/auro3dbaski/${id}`,
        originalPrice:
          originalPrice && originalPrice !== price ? originalPrice : undefined,
        discount: discount || undefined,
      }),
    );
  }

  return items;
}

async function fetchShopierHtml(): Promise<string | null> {
  for (const url of SHOPIER_STORE_URLS) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const html = await fetchText(url, {
        timeoutMs: 20_000,
        headers: { Referer: "https://www.shopier.com/" },
      });
      if (html?.includes("shopier--product-list-section")) return html;
    }
  }
  return null;
}

async function fetchShopierUncached(): Promise<ShopierCatalog> {
  const html = await fetchShopierHtml();
  if (!html) throw new Error("shopier-fetch-failed");

  const live = parseShopierHtml(html);
  if (live.length === 0) throw new Error("shopier-parse-empty");

  return { products: live, source: "live" };
}

const getShopierProductsCached = unstable_cache(
  fetchShopierUncached,
  ["shopier-products-v4"],
  { revalidate: SHOPIER_REVALIDATE_SECONDS, tags: [SHOPIER_CACHE_TAG] },
);

export async function getShopierProducts(): Promise<ShopierCatalog> {
  try {
    return await getShopierProductsCached();
  } catch {
    return { products: fallbackProducts, source: "fallback" };
  }
}

export async function syncShopierCatalog(): Promise<ShopierCatalog> {
  revalidateTag(SHOPIER_CACHE_TAG);
  revalidatePath("/magaza");
  revalidatePath("/");
  try {
    return await fetchShopierUncached();
  } catch {
    return { products: fallbackProducts, source: "fallback" };
  }
}
