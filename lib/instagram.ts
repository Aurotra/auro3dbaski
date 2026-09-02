export type InstagramVideo = {
  id: string;
  title: string;
  permalink: string;
  embedUrl: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  viewCount: number;
  viewCountLabel: string;
};

export function instagramEmbedFromPermalink(permalink: string): string {
  const clean = permalink.split("?")[0].replace(/\/$/, "");
  return `${clean}/embed`;
}

export function instagramProfileEmbedUrl(profileUrl: string): string {
  return `${profileUrl.replace(/\/$/, "")}/embed`;
}
