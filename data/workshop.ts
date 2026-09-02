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
  { id: "printers", label: "Aktif yazıcı", value: 8, suffix: "+" },
];

export type Equipment = {
  id: string;
  name: string;
  use: string;
};

export const equipment: Equipment[] = [
  {
    id: "flashforge",
    name: "Flashforge",
    use: "Atölyedeki FDM parkurunda.",
  },
  {
    id: "bambu",
    name: "Bambu Lab",
    use: "Atölyedeki FDM parkurunda.",
  },
  {
    id: "elegoo",
    name: "Elegoo",
    use: "FDM ve SLA reçine üretiminde.",
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
