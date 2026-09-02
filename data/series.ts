export type Series = {
  slug: string;
  title: string;
  summary: string;
  coverUrl: string;
  episodeCount: number;
};

export const series: Series[] = [
  {
    slug: "bambu-studio-101",
    title: "Bambu Studio 101",
    summary: "Dilimleyicide hangi ayarın ne işe yaradığı — tahminsiz.",
    coverUrl: "/posters/seri-bambu.svg",
    episodeCount: 0, // TODO: bölüm sayısı
  },
  {
    slug: "makerworld-101",
    title: "MakerWorld 101",
    summary: "Modelleri indirmeden önce bakılacak yerler.",
    coverUrl: "/posters/seri-makerworld.svg",
    episodeCount: 0, // TODO: bölüm sayısı
  },
  {
    slug: "miras-modelleme",
    title: "Miras Modelleme",
    summary: "Eski bir parçayı ölçüp yeniden basılabilir hale getirmek.",
    coverUrl: "/images/workshop/miras-cover.webp",
    episodeCount: 0, // TODO: bölüm sayısı
  },
  {
    slug: "evimdeki-sorunu-cozdum",
    title: "Evimdeki Sorunu Çözdüm",
    summary: "Günlük bir sıkıntı, bir parça, bir baskı.",
    coverUrl: "/posters/seri-ev.svg",
    episodeCount: 0, // TODO: bölüm sayısı
  },
  {
    slug: "keman-serisi",
    title: "Keman Serisi",
    summary: "Müzik aleti parçalarında tolerans ve malzeme seçimi.",
    coverUrl: "/images/workshop/keman-cover.webp",
    episodeCount: 0, // TODO: bölüm sayısı
  },
];

export function getSeries(slug: string): Series | undefined {
  return series.find((item) => item.slug === slug);
}
