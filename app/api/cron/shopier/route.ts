import { NextResponse } from "next/server";
import { syncShopierCatalog } from "@/lib/shopier";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (secret) return header === `Bearer ${secret}`;
  return process.env.NODE_ENV !== "production";
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const catalog = await syncShopierCatalog();
  return NextResponse.json({
    ok: true,
    source: catalog.source,
    count: catalog.products.length,
  });
}
