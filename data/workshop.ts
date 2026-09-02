export type Stat = {
  id: string;
  label: string;
  value: number;
  suffix: string;
};

export const stats: Stat[] = [
  { id: "followers", label: "Toplam takipçi", value: 0, suffix: "" }, // TODO: gerçek rakam
  { id: "views", label: "Toplam izlenme", value: 0, suffix: "" }, // TODO: gerçek rakam
  { id: "parts", label: "Üretilen parça", value: 0, suffix: "" }, // TODO: gerçek rakam
  { id: "printers", label: "Aktif yazıcı", value: 5, suffix: "" },
];

export type Equipment = {
  id: string;
  name: string;
  use: string;
};

export const equipment: Equipment[] = [
  {
    id: "p1s",
    name: "2× Bambu Lab P1S",
    use: "Kapalı kabin, PETG ve mühendislik filamentleriyle fonksiyonel parça.",
  },
  {
    id: "p1p",
    name: "1× Bambu Lab P1P",
    use: "Hızlı PLA prototip ve seri tekrar.",
  },
  {
    id: "a1",
    name: "1× Bambu Lab A1",
    use: "Açık yatak, eğitim ve kısa döngülü denemeler.",
  },
  {
    id: "sla",
    name: "1× SLA reçine yazıcı",
    use: "İnce detay, kalıp ve pürüzsüz yüzey.",
  },
  {
    id: "ams",
    name: "AMS çoklu renk sistemi",
    use: "Renk geçişi ve destek malzemesi ayrımı.",
  },
];

export const principles = [
  {
    title: "Asla kolay göstermeyiz",
    body: "Süreç, hata ve düzeltme dahil gösterilir.",
  },
  {
    title: "Her videoda bir kanıt",
    body: "Söylenen şey fiziksel olarak kamerada kanıtlanır.",
  },
  {
    title: "Doğru cevap bağlama göre değişir",
    body: "“Hangisi daha iyi” değil, “hangi durumda hangisi” anlatılır.",
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
    date: "TODO: tarih",
    title: "İlk yazıcı",
    body: "TODO: olay",
  },
  {
    id: "t2",
    date: "TODO: tarih",
    title: "İlk viral video",
    body: "TODO: olay",
  },
  {
    id: "t3",
    date: "TODO: tarih",
    title: "İlk ürün satışı",
    body: "TODO: olay",
  },
  {
    id: "t4",
    date: "TODO: tarih",
    title: "İlk marka işbirliği",
    body: "TODO: olay",
  },
];
