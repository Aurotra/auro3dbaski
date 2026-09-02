import { NextResponse } from "next/server";
import { getShopierProducts } from "@/lib/shopier";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  const catalog = await getShopierProducts();
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
