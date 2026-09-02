export type ProofPair = {
  id: string;
  title: string;
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
};

export const proofPairs: ProofPair[] = [
  {
    id: "pr1",
    title: "Yanlış ayar / doğru ayar",
    beforeUrl: "/posters/before-1.svg",
    afterUrl: "/posters/after-1.svg",
    beforeLabel: "Yanlış profil",
    afterLabel: "Doğru profil",
  },
  {
    id: "pr2",
    title: "TODO: ikinci örnek",
    beforeUrl: "/posters/before-2.svg",
    afterUrl: "/posters/after-2.svg",
    beforeLabel: "Önce",
    afterLabel: "Sonra",
  },
  {
    id: "pr3",
    title: "TODO: üçüncü örnek",
    beforeUrl: "/posters/before-3.svg",
    afterUrl: "/posters/after-3.svg",
    beforeLabel: "Önce",
    afterLabel: "Sonra",
  },
];

export type ToolCard = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  status: "yakinda" | "hazir";
};

export const tools: ToolCard[] = [
  {
    slug: "tul-atolyesi",
    href: "/araclar/tul-atolyesi",
    title: "Tül Atölyesi",
    summary: "Deseni ekranda kur, baskıya hazır dosyayı al.",
    status: "yakinda",
  },
  {
    slug: "sehir-haritasi",
    href: "/araclar/sehir-haritasi",
    title: "Şehir Haritası Konfigüratörü",
    summary: "Katmanlı şehir panosunu ölçüyle ayarla.",
    status: "yakinda",
  },
  {
    slug: "canta-studyo",
    href: "/araclar/canta-studyo",
    title: "Çanta Stüdyo",
    summary: "Form, kulp ve ölçü seç, çıktıyı bas.",
    status: "yakinda",
  },
];

export type ProductionMaterial = {
  id: string;
  name: string;
  use: string;
  highlight: string;
};

export const productionMaterials: ProductionMaterial[] = [
  {
    id: "petg",
    name: "Yüksek sıcaklık PETG",
    use: "Fonksiyonel parça, nem ve darbe.",
    highlight: "Isı ve kimyasal direnç.",
  },
  {
    id: "pa",
    name: "Poliamid (Naylon)",
    use: "Jig, menteşe, tekrarlayan yük.",
    highlight: "Tokluk.",
  },
  {
    id: "pla",
    name: "PLA",
    use: "Prototip, vitrin, kısa döngü.",
    highlight: "Kolay ve temiz yüzey.",
  },
  {
    id: "sla",
    name: "SLA reçine",
    use: "İnce detay, kalıp, pürüzsüz parça.",
    highlight: "Hassas geometri.",
  },
];

export const productionSteps = [
  { n: "01", title: "Dosya gönder", body: "STL / STEP veya ölçü. WeTransfer ya da Drive linki yeter." },
  { n: "02", title: "Teklif", body: "Malzeme, adet ve süre netleşir." },
  { n: "03", title: "Onay", body: "Profil ve teslim tarihi kilitlenir." },
  { n: "04", title: "Üretim", body: "FDM veya SLA, ölçü kontrolüyle." },
  { n: "05", title: "Kargo", body: "Paketlenmiş parça yola çıkar." },
] as const;

export type FaqItem = {
  q: string;
  a: string;
};

export const productionFaq: FaqItem[] = [
  { q: "Hangi dosya formatları kabul ediliyor?", a: "TODO: cevap" },
  { q: "Minimum sipariş var mı?", a: "TODO: cevap" },
  { q: "Teslim süresi ne kadar?", a: "TODO: cevap" },
  { q: "Hangi malzemeler mevcut?", a: "TODO: cevap" },
  { q: "Tolerans hassasiyeti ne?", a: "TODO: cevap" },
  { q: "Kargo nasıl yapılıyor?", a: "TODO: cevap" },
];

export const collabFormats = [
  {
    title: "Ürün incelemesi",
    body: "Kamerada ölçülür, basılır, söylenen şey kanıtlanır.",
  },
  {
    title: "Sponsorlu video",
    body: "Seri içine oturan, öğretici format.",
  },
  {
    title: "Uzun vadeli elçilik",
    body: "Yazıcı ve filament tarafında süreklilik.",
  },
  {
    title: "Ortak ürün geliştirme",
    body: "Atölyede birlikte tasarlanan parça.",
  },
] as const;

export type Partner = {
  id: string;
  name: string;
  logoUrl: string;
};

export const partners: Partner[] = [
  { id: "pt1", name: "TODO: ortak 1", logoUrl: "/posters/partner.svg" },
  { id: "pt2", name: "TODO: ortak 2", logoUrl: "/posters/partner.svg" },
  { id: "pt3", name: "TODO: ortak 3", logoUrl: "/posters/partner.svg" },
];

export const mediaKit = {
  followers: "TODO",
  avgViews: "TODO",
  demo: "TODO: kitle demografisi",
  past: "TODO: geçmiş işbirliği örnekleri",
};
