import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";
import {
  fallbackProducts,
  shopierStoreUrl,
  type ShopierProduct,
} from "@/data/products";
import { fetchText } from "@/lib/http";

export type ShopierCatalog = {
  products: ShopierProduct[];
  source: "live" | "fallback";
};

function absUrl(href: string): string {
  if (!href) return shopierStoreUrl;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("/")) return `https://www.shopier.com${href}`;
  return `https://www.shopier.com/${href.replace(/^\.\//, "")}`;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function parseShopierHtml(html: string): ShopierProduct[] {
  const $ = cheerio.load(html);
  const items: ShopierProduct[] = [];
  const seen = new Set<string>();

  $("#shopier--product-list-section .shopier--product-card").each((_, el) => {
    const card = $(el);
    const title = decodeEntities(
      card.find(".shopier-store--store-product-card-title").first().text(),
    );
    if (!title) return;

    const href = card.find("a[href]").first().attr("href") ?? "";
    const img =
      card.find("img").first().attr("src") ??
      card.find("img").first().attr("data-src") ??
      "";
    const priceAttr = card.find("[data-price]").first().attr("data-price");
    const priceValue = card.find(".price-current .price-value").first().text().trim();
    const currency = card.find(".price-current .price-currency").first().text().trim();
    const price = decodeEntities(
      priceAttr || [priceValue, currency].filter(Boolean).join(" "),
    );
    const id =
      card.find("[data-back-id]").attr("data-back-id") ??
      href.split("/").filter(Boolean).pop() ??
      title;

    if (seen.has(id)) return;
    seen.add(id);

    items.push({
      id,
      title,
      price: price || "Fiyat için Shopier",
      imageUrl: absUrl(img),
      url: absUrl(href),
    });
  });

  return items.slice(0, 4);
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
  ["shopier-products-v1"],
  { revalidate: 3600 },
);
