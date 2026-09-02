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

export const showcaseVideos: ShowcaseVideo[] = [
  {
    id: "v1",
    title: "TODO: video başlığı",
    videoUrl: "/videos/showcase-1.mp4",
    posterUrl: "/posters/v1.svg",
    platform: "instagram",
    externalLink: "https://www.instagram.com/auro3dbaski",
    viewCount: "TODO",
    seriesSlug: "bambu-studio-101",
  },
  {
    id: "v2",
    title: "TODO: video başlığı",
    videoUrl: "/videos/showcase-2.mp4",
    posterUrl: "/posters/v2.svg",
    platform: "tiktok",
    externalLink: "https://www.tiktok.com/@auro3dbaski",
    viewCount: "TODO",
    seriesSlug: "makerworld-101",
  },
  {
    id: "v3",
    title: "TODO: video başlığı",
    videoUrl: "/videos/showcase-3.mp4",
    posterUrl: "/posters/v3.svg",
    platform: "youtube",
    externalLink: "https://www.youtube.com/@auro3dbaski",
    viewCount: "TODO",
    seriesSlug: "evimdeki-sorunu-cozdum",
  },
  {
    id: "v4",
    title: "TODO: video başlığı",
    videoUrl: "/videos/showcase-4.mp4",
    posterUrl: "/posters/v4.svg",
    platform: "instagram",
    externalLink: "https://www.instagram.com/auro3dbaski",
    viewCount: "TODO",
    seriesSlug: "miras-modelleme",
  },
  {
    id: "v5",
    title: "TODO: video başlığı",
    videoUrl: "/videos/showcase-5.mp4",
    posterUrl: "/posters/v5.svg",
    platform: "youtube",
    externalLink: "https://www.youtube.com/@auro3dbaski",
    viewCount: "TODO",
    seriesSlug: "keman-serisi",
  },
];

export const galleryVideos: ShowcaseVideo[] = showcaseVideos;
