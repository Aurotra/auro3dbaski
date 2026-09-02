export type TeamMember = {
  id: "sude" | "berk";
  name: string;
  role: string;
  photoUrl: string;
  photoAlt: string;
  body: string;
  tags?: string[];
};

export const team: TeamMember[] = [
  {
    id: "sude",
    name: "Sude",
    role: "Kurucu · Tasarım & Üretim · İçerik",
    photoUrl: "/images/sude.svg",
    photoAlt: "TODO: Sude atölye fotoğrafı",
    body: "Eskişehir'de makine mühendisliği öğrencisi. Tasarımdan dilimlemeye, baskıdan kurguya kadar üretim ve içerik tarafının tamamını kendisi yürütüyor. Kamera önündeki yüz.", // TODO: nihai metin
    tags: ["SolidWorks", "Fusion 360", "Bambu Studio", "CapCut"],
  },
  {
    id: "berk",
    name: "Berk",
    role: "Operasyon & İş Geliştirme",
    photoUrl: "/images/berk.svg",
    photoAlt: "Berk — operasyon",
    body: "Üretim operasyonu, sipariş akışı ve işbirlikleri tarafında birlikte çalışıyor. Kamera arkasında kalan tarafın büyük kısmı burada yürüyor.", // TODO: nihai metin
  },
];

export const intro = {
  heading: "Atölyenin içinden.",
  body: [
    "TODO: 3-4 cümlelik tanıtım. Mühendislik öğrencisi kimliği ve kimin için içerik üretildiği.",
    "TODO: ikinci cümle.",
    "TODO: üçüncü cümle.",
  ],
};

export const story = {
  heading: "Marka hikâyesi",
  paragraphs: [
    "TODO: nasıl başladı.",
    "TODO: neden 3D baskı.",
    "TODO: mühendislik eğitiminin içeriğe nasıl yansıdığı.",
  ],
};
