import { unstable_cache } from "next/cache";
import { parseAbbreviatedCount } from "@/lib/format";
import { fetchJson, fetchText } from "@/lib/http";
import { site } from "@/lib/site";

export type SocialStats = {
  youtube: number;
  tiktok: number;
  instagram: number;
  totalFollowers: number;
};

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

function fallbacks(): SocialStats {
  const youtube = envInt("STATS_FALLBACK_YOUTUBE", 272);
  const tiktok = envInt("STATS_FALLBACK_TIKTOK", 936);
  const instagram = envInt("STATS_FALLBACK_INSTAGRAM", 0);
  return {
    youtube,
    tiktok,
    instagram,
    totalFollowers: youtube + tiktok + instagram,
  };
}

function pickCount(...candidates: Array<number | null | undefined>): number | null {
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c) && c >= 0) return Math.round(c);
  }
  return null;
}

function youtubeHandle(): string {
  const fromEnv = process.env.YOUTUBE_HANDLE?.trim();
  if (fromEnv) return fromEnv.replace(/^@/, "");
  const match = site.youtube.match(/@([^/?#]+)/);
  return match?.[1] ?? "auro3dbaski";
}

function instagramUsername(): string {
  const match = site.instagram.match(/instagram\.com\/([^/?#]+)/i);
  return match?.[1]?.replace(/^@/, "") ?? "auro3dbaski";
}

async function youtubeSubscribers(): Promise<number | null> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  const handle = youtubeHandle();

  if (key) {
    const params = new URLSearchParams({ part: "statistics", key });
    if (channelId) params.set("id", channelId);
    else params.set("forHandle", handle);

    const data = await fetchJson<{
      items?: Array<{ statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean } }>;
    }>(`https://www.googleapis.com/youtube/v3/channels?${params.toString()}`);

    const stats = data?.items?.[0]?.statistics;
    if (stats && !stats.hiddenSubscriberCount && stats.subscriberCount) {
      const n = Number(stats.subscriberCount);
      if (Number.isFinite(n)) return n;
    }
  }

  const html = await fetchText(site.youtube);
  if (!html) return null;

  const jsonCount = html.match(/"subscriberCount"\s*:\s*"(\d+)"/);
  if (jsonCount) return Number(jsonCount[1]);

  const hidden = html.match(/"hiddenSubscriberCount"\s*:\s*true/);
  if (hidden) return null;

  const simple = html.match(
    /"subscriberCountText"[^}]*?"simpleText"\s*:\s*"([^"]+)"/,
  );
  if (simple) {
    return parseAbbreviatedCount(simple[1].replace(/abone/i, ""), "tr");
  }

  const label = html.match(/([\d.,]+\s*(?:[KkMmBb]|bin|Mn)?)\s*abone/i);
  if (label) return parseAbbreviatedCount(label[1], "tr");

  return null;
}

async function tiktokFollowers(): Promise<number | null> {
  const html = await fetchText(site.tiktok);
  if (!html) return null;

  const jsonCount = html.match(/"followerCount"\s*:\s*(\d+)/);
  if (jsonCount) return Number(jsonCount[1]);

  const fans = html.match(/"fans"\s*:\s*(\d+)/);
  if (fans) return Number(fans[1]);

  const meta = html.match(
    /<meta[^>]+(?:name|property)="(?:og:description|description)"[^>]+content="([^"]+)"/i,
  );
  if (meta) {
    const fromMeta = meta[1].match(/([\d.,]+\s*[KMBkmb]?)\s*(?:Followers|Takipçi)/i);
    if (fromMeta) return parseAbbreviatedCount(fromMeta[1], "en");
  }

  return null;
}

async function instagramFollowers(): Promise<number | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  if (token && userId) {
    const graph =
      (await fetchJson<{ followers_count?: number }>(
        `https://graph.instagram.com/${userId}?fields=followers_count&access_token=${encodeURIComponent(token)}`,
      )) ??
      (await fetchJson<{ followers_count?: number }>(
        `https://graph.facebook.com/v21.0/${userId}?fields=followers_count&access_token=${encodeURIComponent(token)}`,
      ));
    if (typeof graph?.followers_count === "number") return graph.followers_count;
  }

  const webProfile = await fetchJson<{
    data?: {
      user?: { edge_followed_by?: { count?: number }; follower_count?: number };
    };
  }>("https://www.instagram.com/api/v1/users/web_profile_info/?username=" + instagramUsername(), {
    headers: { "X-IG-App-ID": "936619743392459" },
  });
  const fromApi = pickCount(
    webProfile?.data?.user?.edge_followed_by?.count,
    webProfile?.data?.user?.follower_count,
  );
  if (fromApi != null) return fromApi;

  const html = await fetchText(`${site.instagram.replace(/\/$/, "")}/`);
  if (!html) return null;

  const edge = html.match(/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)/);
  if (edge) return Number(edge[1]);

  const userCount = html.match(/"follower_count"\s*:\s*(\d+)/);
  if (userCount) return Number(userCount[1]);

  const og =
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    );
  if (og) {
    const fromOg = og[1].match(/([\d.,]+\s*[KMBkmb]?)\s*(?:Followers|Takipçi)/i);
    if (fromOg) return parseAbbreviatedCount(fromOg[1], "en");
  }

  return null;
}

async function fetchSocialStatsUncached(): Promise<SocialStats> {
  const floor = fallbacks();
  const [youtube, tiktok, instagram] = await Promise.all([
    youtubeSubscribers().catch(() => null),
    tiktokFollowers().catch(() => null),
    instagramFollowers().catch(() => null),
  ]);

  const y = pickCount(youtube) ?? floor.youtube;
  const t = pickCount(tiktok) ?? floor.tiktok;
  const i = pickCount(instagram) ?? floor.instagram;

  return {
    youtube: y,
    tiktok: t,
    instagram: i,
    totalFollowers: y + t + i,
  };
}

export const getSocialStats = unstable_cache(
  fetchSocialStatsUncached,
  ["social-stats-v2"],
  { revalidate: 3600 },
);
