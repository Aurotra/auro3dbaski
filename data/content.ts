export type ProofPair = {
  id: string;
  title: string;
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
};

/** Kanıt karşılaştırmaları henüz yok — ana sayfa bölümü beklemeye alındı. */
export const proofPairs: ProofPair[] = [];

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
  {
    n: "01",
    title: "Dosya gönder",
    body: "STL, STEP, STP veya 3MF. WeTransfer ya da Drive linki yeter.",
  },
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
  {
    q: "Hangi dosya formatlarında üretim yapabiliyorsunuz?",
    a: "Üretim ve dilimleme süreçlerimizde doğrudan .STL, .STEP, .STP ve .3MF uzantılarını kabul ediyoruz. Mühendislik ve montaj gerektiren parçalar için geometrik doğruluğu koruyan STEP formatı öncelikli tercihimizdir.",
  },
  {
    q: "Parçam için hangi malzemenin (PLA, PETG, ABS, PC vb.) uygun olduğunu nasıl belirliyorsunuz?",
    a: "Parçanın çalışacağı ortam sıcaklığı, maruz kalacağı mekanik yük, UV dayanımı gereksinimi ve kimyasal temas durumuna göre mühendislik analizi yaparak en optimum malzemeyi belirliyoruz.",
  },
  {
    q: "Sipariş ettiğim parçanın tolerans hassasiyeti nedir?",
    a: "FDM üretimlerimizde geometriye ve kullanılan malzemeye bağlı olarak standart boyutsal toleransımız ±0,15 mm ile ±0,2 mm aralığındadır. Reçine (SLA) baskılarda bu değer mikron seviyelerine inmektedir.",
  },
  {
    q: "Minimum ve maksimum üretim boyutlarınız nedir?",
    a: "Tek parça baskıda yazıcı hacmimize göre 256 × 256 × 256 mm ölçülerine kadar blok baskı alabiliyoruz. Daha büyük modellerde ise modüler birleştirme (dovetail/pim) teknikleriyle metre boyutundaki prototipleri üretebiliyoruz.",
  },
  {
    q: "Teslimat süresi ne kadardır?",
    a: "Onaylanan siparişlerde prototipleme ve test modelleri genellikle 1–3 iş günü içerisinde üretilip kargoya teslim edilir. Seri veya yüksek hacimli parçalarda süre proje kapsamına göre önceden planlanır.",
  },
  {
    q: "Gönderdiğim tasarımların gizliliği korunuyor mu?",
    a: "Evet. Tarafımıza iletilen tüm CAD çizimleri, özel modeller ve Ar-Ge fikirleri tamamen gizli tutulur; talep edilmesi durumunda kurumsal işbirlikleri için Gizlilik Sözleşmesi (NDA) imzalanmaktadır.",
  },
];

export const collabFormats = [
  {
    title: "3D yazıcı incelemeleri",
    body: "Masaüstü ve atölye yazıcıları ölçülür, basılır, söylenen performans kamerada kanıtlanır.",
  },
  {
    title: "Filament / malzeme dayanım sponsorlukları",
    body: "Termoplastik ve reçine iddiaları ısı, yük ve UV bağlamında test edilir.",
  },
  {
    title: "Dilimleme / CAD yazılım tanıtımları",
    body: "Profil, oryantasyon ve DfAM kararları gerçek parça üzerinde gösterilir.",
  },
  {
    title: "Atölye ekipman testleri",
    body: "Kurutucu, AMS, nozul ve kalibrasyon donanımı üretim hattında denenir.",
  },
] as const;

export type Partner = {
  id: string;
  name: string;
  logoUrl: string;
};

export const partners: Partner[] = [];

export const mediaKit = {
  channel: "Auro 3D Baskı",
  audience:
    "3D yazıcı kullanıcıları, makine / mekatronik / otomotiv mühendisleri, maker toplulukları, endüstriyel tasarımcılar ve teknoloji meraklıları.",
  demo: "%82 erkek / %18 kadın; en yoğun yaş aralığı 18–34 (%68). Ağırlıklı kitle: Türkiye, Almanya, Azerbaycan.",
  avgViews:
    "Short / Reels başına 10.000–25.000 görüntülenme; öne çıkan rehber içeriklerde 500.000+ izlenme.",
  followers: "7.000+",
  reach: "3.000.000+ toplam izlenme",
};
