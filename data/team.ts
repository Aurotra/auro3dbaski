import { site } from "@/lib/site";

export type TeamSocial = {
  label: string;
  href: string;
};

export type TeamMember = {
  id: "sude" | "berk";
  name: string;
  title: string;
  role: string;
  photoUrl: string;
  photoAlt: string;
  body: string[];
  techs: string[];
  socials: TeamSocial[];
};

export const team: TeamMember[] = [
  {
    id: "sude",
    name: "Sude Can Sümer",
    title: "Mekanik Tasarım",
    role: "İçerik üretimi · marka iletişimi",
    photoUrl: "/images/team/sude.webp",
    photoAlt: "Sude Can Sümer — mekanik tasarım, içerik üretimi ve marka iletişimi",
    body: [
      "Makine mühendisliği formasyonuyla projelerin mekanik tasarım, CAD modelleme ve simülasyon aşamalarını yürütüyor.",
      "Eklemeli imalat için tasarım (DfAM) prensiplerini içeriklere entegre ediyor.",
      "Teknik derinliği koruyarak eklemeli imalat konularını popüler bir dile taşıyor; ürettiği içerikler hem sektör profesyonellerine hem yeni başlayanlara hitap ediyor.",
      "Üretim süreçlerinde estetik ve işlevselliğin dengesini kurarak kanalın yaratıcı projelerinin hayata geçirilmesinde aktif rol alıyor.",
    ],
    techs: ["FDM", "SLA", "CAD", "DfAM"],
    socials: [
      { label: "Instagram", href: site.instagram },
      { label: "TikTok", href: site.tiktok },
    ],
  },
  {
    id: "berk",
    name: "Berk Tepe",
    title: "Kurucu",
    role: "Ar-Ge · eklemeli imalat · içerik stratejisi",
    photoUrl: "/images/team/berk.webp",
    photoAlt: "Berk Tepe — Ar-Ge, eklemeli imalat ve tersine mühendislik",
    body: [
      "Otomotiv mühendisliği altyapısına sahip olan Berk Tepe; kompozit teknolojileri, eklemeli imalat ve tersine mühendislik alanlarında edindiği Ar-Ge tecrübesini Auro 3D Baskı platformuna aktarıyor.",
      "Farklı FDM ve SLA yazıcıların kalibrasyonu üzerine içerik stratejilerini yönetiyor.",
      "Endüstriyel filamentlerin dayanım testleri ve donanım iyileştirmeleri de aynı stratejinin parçası.",
    ],
    techs: ["FDM", "SLA", "Malzeme", "Ar-Ge"],
    socials: [
      { label: "YouTube", href: site.youtube },
      { label: "Instagram", href: site.instagram },
    ],
  },
];

export const intro = {
  heading: "Atölyenin içinden.",
  body: [
    "Auro 3D Baskı; masaüstü eklemeli imalat teknolojilerini, malzeme bilimini ve tasarım ipuçlarını doğrudan atölye deneyimiyle sunan bir dijital içerik ve inovasyon kanalıdır.",
    "FDM ve reçine baskı süreçlerindeki dilimleme püf noktalarından endüstriyel termoplastiklerin sınırlarına kadar merak edilen tüm detayları şeffaf bir dille paylaşıyoruz.",
    "Milyonlara ulaşan video içeriklerimizle hem yeni başlayanlara rehberlik ediyor hem de profesyonellere yönelik optimize üretim taktikleri sunuyoruz.",
  ],
};

export const story = {
  heading: "Marka hikâyesi",
  paragraphs: [
    "Auro 3D Baskı, katmanlı imalat teknolojilerini teorik mühendislik temelleri ve pratik atölye uygulamalarıyla harmanlayarak dijital platformlarda paylaşmak amacıyla kuruldu.",
    "Atölyemizde sadece parçaları yazdırmıyor; baskı yöneliminin mekanik mukavemete etkisini, doğru malzeme seçimini ve tasarım optimizasyonunu analiz ederek takipçilerimize katma değerli içerikler üretiyoruz.",
    "Masaüstü eklemeli imalat, malzeme bilimi ve tasarım ipuçlarını doğrudan atölye deneyimiyle sunuyoruz — yeni başlayanlara rehber, profesyonellere optimize üretim taktiği.",
  ],
};
