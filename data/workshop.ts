export type Stat = {
  id: string;
  label: string;
  value: number;
  suffix: string;
};

export const stats: Stat[] = [
  { id: "views", label: "Toplam izlenme", value: 3_000_000, suffix: "+" },
  {
    id: "parts",
    label: "Test edilen / üretilen parça",
    value: 1_200,
    suffix: "+",
  },
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
