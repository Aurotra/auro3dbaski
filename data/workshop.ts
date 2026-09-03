export type Stat = {
  id: string;
  label: string;
  value: number;
  suffix: string;
  format: "compact" | "grouped";
};

export const stats: Stat[] = [
  {
    id: "followers",
    label: "Toplam takipçi",
    value: 7_000,
    suffix: "+",
    format: "grouped",
  },
  {
    id: "views",
    label: "Toplam izlenme",
    value: 3_000_000,
    suffix: "+",
    format: "compact",
  },
  {
    id: "parts",
    label: "Test edilen / üretilen parça",
    value: 500,
    suffix: "+",
    format: "grouped",
  },
  {
    id: "printers",
    label: "Atölye filosu",
    value: 6,
    suffix: "+",
    format: "grouped",
  },
];

export type Capability = {
  id: string;
  name: string;
  use: string;
  tags: string[];
};

export const capabilities: Capability[] = [
  {
    id: "ekosistem",
    name: "Bambu Lab & Elegoo",
    use: "FDM ve SLA aynı atölyede: prototip, kısa seri, reçine detay.",
    tags: ["FDM", "SLA"],
  },
  {
    id: "dilimleme",
    name: "Teknik dilimleme",
    use: "Profil, destek, yönelim ve malzeme — Bambu Studio’da tahminsiz.",
    tags: ["Bambu Studio", "Profil"],
  },
  {
    id: "proto",
    name: "Prototipleme",
    use: "DfAM, geçme testi ve dayanım denemesi. Sayı değil, süreç.",
    tags: ["DfAM", "Fit"],
  },
];

export const workshopShots = [
  {
    id: "lambalar",
    src: "/images/workshop/lambalar.webp",
    alt: "İki 3D baskı heykelsi masa lambası, yeşil ve turuncu ışık",
    caption: "Aydınlatma",
  },
  {
    id: "vazo",
    src: "/images/workshop/vazo.webp",
    alt: "Burgulu geometrili vazo ve kırmızı 3D baskı güller, yazıcının yanında",
    caption: "Dekor",
  },
  {
    id: "keman",
    src: "/images/workshop/keman.webp",
    alt: "3D baskı keman, kesim matı üzerinde",
    caption: "Keman",
  },
  {
    id: "tekneler",
    src: "/images/workshop/tekneler.webp",
    alt: "Turuncu ve mavi 3D baskı tekne modelleri ile Wankel motor",
    caption: "Model",
  },
  {
    id: "sardalya",
    src: "/images/workshop/sardalya.webp",
    alt: "Not Sardines takı kutuları, dört renk",
    caption: "Sardalya",
  },
  {
    id: "ani-muzesi",
    src: "/images/workshop/miras-kutu.webp",
    alt: "Anı Müzesi — turuncu gölge kutusu, minyatür çerçeveler ve figürinler",
    caption: "Anı Müzesi",
  },
  {
    id: "keman-parca",
    src: "/images/workshop/keman-parca.webp",
    alt: "3D baskı keman gövde, sap ve köprü parçaları kesim matı üzerinde",
    caption: "Montaj",
  },
  {
    id: "prototip",
    src: "/images/workshop/prototip.webp",
    alt: "Cıvata, conta ve kumpasla ölçü kontrolü yapılan prototip yığın",
    caption: "Prototip",
  },
] as const;

export type Milestone = {
  id: string;
  date: string;
  title: string;
  body: string;
};

export const timeline: Milestone[] = [
  {
    id: "t1",
    date: "Eylül 2024",
    title: "Kanalın kuruluşu",
    body: "Auro 3D Baskı kanalının kuruluşu ve ilk teknik içerik serisinin yayına başlaması.",
  },
  {
    id: "t2",
    date: "Aralık 2024",
    title: "1 milyon izlenme",
    body: "İlk viral teknik içerikle birlikte 1 milyon izlenme barajının aşılması.",
  },
  {
    id: "t3",
    date: "Şubat 2025",
    title: "Parkur genişlemesi",
    body: "Atölye ekipman parkurunun genişletilmesi ve ileri mühendislik filamentlerinin testlerine başlanması.",
  },
  {
    id: "t4",
    date: "Temmuz 2026",
    title: "3 milyon izlenme",
    body: "Toplamda 3 milyondan fazla izlenmeye ve 7 binin üzerinde topluluk büyüklüğüne ulaşılması.",
  },
];
