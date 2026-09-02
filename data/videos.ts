export type ShowcaseVideo = {
  id: string;
  title: string;
  videoUrl: string;
  posterUrl: string;
  platform: "instagram" | "tiktok" | "youtube";
  externalLink: string;
  viewCount: string;
  seriesSlug?: string;
};

/** Yerel vitrin klipleri yok; ana sayfa Instagram’dan canlı çeker. */
export const showcaseVideos: ShowcaseVideo[] = [];
export const galleryVideos: ShowcaseVideo[] = [];
