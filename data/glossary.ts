export type GlossaryCategory =
  | "yuzey"
  | "dilimleme"
  | "yapiskanlik"
  | "malzeme"
  | "olcu";

export type GlossaryTerm = {
  slug: string;
  title: string;
  category: GlossaryCategory;
  oneLiner: string;
  what: string;
  when: string;
  bambuSetting: string;
  caveats: string;
  videoHref?: string;
  calculatorHref?: string;
};

export const glossaryCategories: { id: GlossaryCategory | "all"; label: string }[] =
  [
    { id: "all", label: "Tümü" },
    { id: "yuzey", label: "Yüzey" },
    { id: "dilimleme", label: "Dilimleme" },
    { id: "yapiskanlik", label: "Yatak / yapışma" },
    { id: "malzeme", label: "Malzeme" },
    { id: "olcu", label: "Ölçü" },
  ];

function stub(
  slug: string,
  title: string,
  category: GlossaryCategory,
  calculatorHref?: string,
): GlossaryTerm {
  return {
    slug,
    title,
    category,
    oneLiner: "TODO: tek cümlelik tanım",
    what: "TODO: ne işe yarar",
    when: "TODO: hangi durumda kullanılır",
    bambuSetting: "TODO: ilgili Bambu Studio ayarı",
    caveats: "TODO: dikkat edilecekler",
    videoHref: undefined, // TODO: ilgili video
    calculatorHref,
  };
}

export const glossary: GlossaryTerm[] = [
  stub("ironing", "Ironing (ütüleme)", "yuzey"),
  stub("fuzzy-skin", "Fuzzy skin", "yuzey"),
  stub("infill-desenleri", "Infill desenleri", "dilimleme"),
  stub("pressure-advance", "Pressure advance", "dilimleme"),
  stub("adaptif-katman-yuksekligi", "Adaptif katman yüksekliği", "dilimleme"),
  stub("tree-support", "Tree support", "dilimleme"),
  stub("warping", "Warping", "yapiskanlik"),
  stub("bed-adhesion", "Bed adhesion", "yapiskanlik"),
  stub("nem-ve-filament-kurutma", "Nem ve filament kurutma", "malzeme"),
  stub("tolerans-ve-gecme-payi", "Tolerans ve geçme payı", "olcu", "/araclar/hesaplayicilar"),
  stub("katman-yuksekligi", "Katman yüksekliği", "dilimleme"),
  stub("baski-yonu", "Baskı yönü (orientation)", "olcu"),
  stub("duvar-sayisi", "Duvar sayısı", "dilimleme"),
  stub("brim-ve-raft", "Brim ve raft", "yapiskanlik"),
  stub("seam-konumu", "Seam (dikiş) konumu", "yuzey"),
];

export function getTerm(slug: string): GlossaryTerm | undefined {
  return glossary.find((item) => item.slug === slug);
}
