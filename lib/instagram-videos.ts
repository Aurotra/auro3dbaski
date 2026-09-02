import { unstable_cache } from "next/cache";
import { formatCompactPlus } from "@/lib/format";
import { fetchJson, fetchText } from "@/lib/http";
import {
  instagramEmbedFromPermalink,
  type InstagramVideo,
} from "@/lib/instagram";
import { site } from "@/lib/site";

export type { InstagramVideo };

type GraphMedia = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  like_count?: number;
};

function instagramUsername(): string {
  const match = site.instagram.match(/instagram\.com\/([^/?#]+)/i);
  return match?.[1]?.replace(/^@/, "") ?? "auro3dbaski";
}

function titleFromCaption(caption?: string, fallback = "Instagram Reels"): string {
  const line = caption?.split("\n").find((part) => part.trim());
  if (!line) return fallback;
  return line.trim().slice(0, 90);
}

function toVideo(item: {
  id: string;
  title: string;
  permalink: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  viewCount: number;
}): InstagramVideo {
  return {
    ...item,
    embedUrl: instagramEmbedFromPermalink(item.permalink),
    viewCountLabel: `${formatCompactPlus(item.viewCount).replace(/\+$/, "")} izlenme`,
  };
}

async function graphPlays(id: string, token: string): Promise<number | null> {
  const data = await fetchJson<{
    data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
  }>(
    `https://graph.instagram.com/${id}/insights?metric=plays,reach&access_token=${encodeURIComponent(token)}`,
  );
  const plays = data?.data?.find((row) => row.name === "plays")?.values?.[0]?.value;
  if (typeof plays === "number") return plays;
  const reach = data?.data?.find((row) => row.name === "reach")?.values?.[0]?.value;
  return typeof reach === "number" ? reach : null;
}

async function fromGraphApi(): Promise<InstagramVideo[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) return [];

  const userId = process.env.INSTAGRAM_USER_ID?.trim() || "me";
  const fields =
    "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count";
  const listed = await fetchJson<{ data?: GraphMedia[] }>(
    `https://graph.instagram.com/${userId}/media?fields=${fields}&limit=40&access_token=${encodeURIComponent(token)}`,
  );
  const media = (listed?.data ?? []).filter(
    (item) => item.media_type === "VIDEO" || item.media_product_type === "REELS",
  );
  if (media.length === 0) return [];

  const ranked = await Promise.all(
    media.map(async (item) => {
      const plays = item.id ? await graphPlays(item.id, token) : null;
      return toVideo({
        id: item.id ?? item.permalink ?? "ig",
        title: titleFromCaption(item.caption),
        permalink: item.permalink ?? site.instagram,
        thumbnailUrl: item.thumbnail_url ?? item.media_url,
        videoUrl: item.media_url,
        viewCount: plays ?? item.like_count ?? 0,
      });
    }),
  );

  return ranked.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
}

function parseFromHtml(html: string): InstagramVideo[] {
  const byId = new Map<string, InstagramVideo>();

  for (const match of html.matchAll(
    /https:\/\/(?:www\.)?instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/g,
  )) {
    const code = match[1];
    if (!byId.has(code)) {
      byId.set(
        code,
        toVideo({
          id: code,
          title: "Instagram Reels",
          permalink: `https://www.instagram.com/reel/${code}/`,
          viewCount: 0,
        }),
      );
    }
  }

  for (const block of html.split(/"shortcode"\s*:\s*"/).slice(1)) {
    const code = block.match(/^([A-Za-z0-9_-]+)"/)?.[1];
    if (!code) continue;
    const views =
      Number(block.match(/"video_view_count"\s*:\s*(\d+)/)?.[1] ?? "") ||
      Number(block.match(/"play_count"\s*:\s*(\d+)/)?.[1] ?? "") ||
      Number(block.match(/"ig_play_count"\s*:\s*(\d+)/)?.[1] ?? "") ||
      0;
    const caption = block.match(/"text"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1];
    const videoUrl = block
      .match(/"video_url"\s*:\s*"(https:[^"]+)"/)?.[1]
      ?.replace(/\\u0026/g, "&")
      .replace(/\\\//g, "/");
    const thumb = block
      .match(/"display_url"\s*:\s*"(https:[^"]+)"/)?.[1]
      ?.replace(/\\u0026/g, "&")
      .replace(/\\\//g, "/");
    const existing = byId.get(code);
    byId.set(
      code,
      toVideo({
        id: code,
        title: titleFromCaption(caption?.replace(/\\n/g, "\n"), existing?.title),
        permalink: existing?.permalink ?? `https://www.instagram.com/reel/${code}/`,
        thumbnailUrl: thumb ?? existing?.thumbnailUrl,
        videoUrl: videoUrl ?? existing?.videoUrl,
        viewCount: views || existing?.viewCount || 0,
      }),
    );
  }

  return [...byId.values()]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);
}

async function fromPublicHtml(): Promise<InstagramVideo[]> {
  const user = instagramUsername();
  const pages = [
    `${site.instagram.replace(/\/$/, "")}/reels/`,
    `${site.instagram.replace(/\/$/, "")}/`,
    `https://www.instagram.com/${user}/embed/`,
  ];
  for (const url of pages) {
    const html = await fetchText(url);
    if (!html) continue;
    const parsed = parseFromHtml(html);
    if (parsed.length > 0) return parsed;
  }
  return [];
}

async function fetchInstagramVideosUncached(): Promise<InstagramVideo[]> {
  const fromGraph = await fromGraphApi().catch(() => []);
  if (fromGraph.length > 0) return fromGraph;
  return fromPublicHtml().catch(() => []);
}

export const getInstagramVideos = unstable_cache(
  fetchInstagramVideosUncached,
  ["instagram-videos-v1"],
  { revalidate: 3600 },
);
