import { NextResponse } from "next/server";
import {
  getSocialStatsSafe,
  MIN_TOTAL_FOLLOWERS,
} from "@/lib/social-stats";

export const runtime = "nodejs";
export const revalidate = 3600;

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  try {
    const stats = await getSocialStatsSafe();
    return NextResponse.json(stats, { headers: cacheHeaders });
  } catch {
    return NextResponse.json(
      {
        youtube: 0,
        tiktok: 0,
        instagram: 0,
        totalFollowers: MIN_TOTAL_FOLLOWERS,
      },
      { headers: cacheHeaders },
    );
  }
}
