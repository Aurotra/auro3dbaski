export type Episode = {
  title: string;
  href?: string;
};

export type Series = {
  slug: string;
  title: string;
  summary: string;
  coverUrl: string;
  episodes: Episode[];
};

export const series: Series[] = [
  {
    slug: "bambu-studio-101",
    title: "Bambu Studio 101",
    summary: "Dilimleyicide hangi ayarın ne işe yaradığı — tahminsiz.",
    coverUrl: "/images/series/bambu-studio.webp",
    episodes: [],
  },
  {
    slug: "makerworld-101",
    title: "MakerWorld 101",
    summary: "Modelleri indirmeden önce bakılacak yerler.",
    coverUrl: "/images/series/makerworld.webp",
    episodes: [],
  },
  {
    slug: "ani-muzesi",
    title: "Anı Müzesi",
    summary: "Anıları bir gölge kutuda toplayan parça — çerçeve, figürin, katman.",
    coverUrl: "/images/series/ani-muzesi.webp",
    episodes: [],
  },
  {
    slug: "evimdeki-sorunu-cozdum",
    title: "Evimdeki Sorunu Çözdüm",
    summary: "Günlük bir sıkıntı, bir parça, bir baskı.",
    coverUrl: "/images/series/evimdeki-sorunu.webp",
    episodes: [],
  },
  {
    slug: "keman-serisi",
    title: "Keman Serisi",
    summary: "Müzik aleti parçalarında tolerans ve malzeme seçimi.",
    coverUrl: "/images/series/keman.webp",
    episodes: [],
  },
];

export function getSeries(slug: string): Series | undefined {
  return series.find((item) => item.slug === slug);
}

export function seriesEpisodeCount(item: Series): number {
  return item.episodes.length;
}
