export const site = {
  name: "Auro 3D Baskı",
  shortName: "Auro",
  domain: "auro3dbaski.com",
  url: "https://auro3dbaski.com",
  locale: "tr_TR",
  location: "Denizli / Türkiye",
  email: "3d@auro3d.com",
  instagram: "https://www.instagram.com/auro3dbaski",
  instagramHandle: "@auro3dbaski",
  tagline: "Tasarım · Üretim · İlham",
  description:
    "Denizli merkezli 3D baskı atölyesi. FDM prototip, seri üretim, slicer ayarı ve filament kütüphanesi. Maker topluluğuna açık dil.",
} as const;

export const nav = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/malzemeler", label: "Malzemeler" },
  { href: "/teklif", label: "Teklif" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export const services = [
  {
    slug: "prototip",
    title: "Prototip",
    layer: "01",
    body: "Fikir masadan çıkmadan önce elde tutulur. Tek parça, hızlı iterasyon, form ve fit kontrolü.",
  },
  {
    slug: "seri",
    title: "Seri FDM",
    layer: "02",
    body: "Aynı parçayı düzgün tekrarlamak. Jig, kılıf, yedek parça, kısa seri — yazıcı filosu gece de çalışır.",
  },
  {
    slug: "slicer",
    title: "Slicer ayarı",
    layer: "03",
    body: "Duvar, infill, sıcaklık, soğutma. Modelin geometrisine göre profil; tahmin değil ölçü.",
  },
  {
    slug: "isbirligi",
    title: "Marka iş birliği",
    layer: "04",
    body: "Filament ve yazıcı markalarıyla inceleme, sponsorlu proje ve atölye içeriği. Samimi, teknik, pratik.",
  },
] as const;

export const processSteps = [
  {
    code: "; LAYER:01",
    title: "Dosya",
    body: "STL, 3MF veya STEP. Yoksa eskiz yeter — birlikte bakılır.",
  },
  {
    code: "; LAYER:02",
    title: "Dilim",
    body: "Malzeme, katman, dolgu. Parçanın işi neyse profil ona göre.",
  },
  {
    code: "; LAYER:03",
    title: "Baskı",
    body: "Yatak ısınır, nozul yol çizer. Baskı bitince haber gider.",
  },
  {
    code: "; LAYER:04",
    title: "Teslim",
    body: "Destek temizliği, ölçü kontrolü. Denizli’den kargo veya elden.",
  },
] as const;

export const materials = [
  {
    id: "pla",
    name: "PLA",
    temp: "200–220 °C",
    use: "Prototip, vitrin, eğitim",
    tone: "#F2D7A4",
  },
  {
    id: "petg",
    name: "PETG",
    temp: "230–250 °C",
    use: "Fonksiyonel parça, nem direnci",
    tone: "#3AF0E8",
  },
  {
    id: "abs",
    name: "ABS",
    temp: "240–260 °C",
    use: "Isı, darbe, kapalı kabin",
    tone: "#D14BFF",
  },
  {
    id: "asa",
    name: "ASA",
    temp: "240–260 °C",
    use: "Dış ortam, UV",
    tone: "#7AA2FF",
  },
  {
    id: "tpu",
    name: "TPU",
    temp: "210–230 °C",
    use: "Esnek, conta, kılıf",
    tone: "#B6FF4A",
  },
  {
    id: "cf",
    name: "PA-CF",
    temp: "260–280 °C",
    use: "Sertlik, jig, mühendislik",
    tone: "#2A3038",
  },
] as const;

export const quoteMaterials = [
  "PLA",
  "PETG",
  "ABS",
  "ASA",
  "TPU",
  "PA-CF",
  "Kararsızım — siz seçin",
] as const;
