export type ReelCard = {
  id: string;
  title: string;
  src: string;
  alt: string;
};

/** Instagram çekilemezse gösterilen atölye vitrini — gerçek çekimler. */
export const reelCards: ReelCard[] = [
  {
    id: "lamba",
    title: "Ambiyans",
    src: "/images/workshop/lambalar.webp",
    alt: "3D baskı heykelsi masa lambaları",
  },
  {
    id: "keman",
    title: "Keman",
    src: "/images/workshop/keman.webp",
    alt: "3D baskı keman",
  },
  {
    id: "sardalya",
    title: "Sardalya",
    src: "/images/workshop/sardalya.webp",
    alt: "Sardalya takı kutuları",
  },
  {
    id: "ani",
    title: "Anı Müzesi",
    src: "/images/workshop/miras-kutu.webp",
    alt: "Anı Müzesi gölge kutusu",
  },
  {
    id: "model",
    title: "Model",
    src: "/images/workshop/tekneler.webp",
    alt: "3D baskı tekne modelleri",
  },
  {
    id: "dekor",
    title: "Dekor",
    src: "/images/workshop/vazo.webp",
    alt: "Burgulu vazo ve baskı güller",
  },
];
