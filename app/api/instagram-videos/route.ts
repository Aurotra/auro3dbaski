import { NextResponse } from "next/server";
import { getInstagramVideos } from "@/lib/instagram-videos";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  const videos = await getInstagramVideos();
  return NextResponse.json(
    { videos },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
