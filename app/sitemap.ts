import type { MetadataRoute } from "next";
import { glossary } from "@/data/glossary";
import { series } from "@/data/series";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/hakkimda",
    "/icerikler",
    "/magaza",
    "/araclar",
    "/araclar/hesaplayicilar",
    "/bilgi-bankasi",
    "/gunluk",
    "/ozel-uretim",
    "/isbirlikleri",
    "/iletisim",
  ];
  const extra = [
    ...series.map((s) => `/icerikler/${s.slug}`),
    ...glossary.map((g) => `/bilgi-bankasi/${g.slug}`),
  ];
  return [...staticPaths, ...extra].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));
}
