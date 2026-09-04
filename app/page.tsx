import { ClosingCta } from "@/components/home/closing-cta";
import { Hero } from "@/components/home/hero";
import { IntroBlock } from "@/components/home/intro-block";
import { ProductStrip } from "@/components/home/product-strip";
import { SeriesGrid } from "@/components/home/series-grid";
import { StatsStrip } from "@/components/home/stats-strip";
import { TopVideosShowcase } from "@/components/home/top-videos-showcase";
import { getInstagramVideos } from "@/lib/instagram-videos";
import { getShopierProducts } from "@/lib/shopier";
import { ogImage } from "@/lib/seo";
import { getSocialStatsSafe } from "@/lib/social-stats";
import { site } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: site.url },
  openGraph: {
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [ogImage.url],
  },
};

export default async function HomePage() {
  const [stats, instagramVideos, catalog] = await Promise.all([
    getSocialStatsSafe(),
    getInstagramVideos(),
    getShopierProducts(),
  ]);

  return (
    <>
      <Hero />
      <TopVideosShowcase videos={instagramVideos} />
      <IntroBlock />
      <StatsStrip totalFollowers={stats.totalFollowers} />
      <ProductStrip products={catalog.products.slice(0, 4)} />
      <SeriesGrid videos={instagramVideos} />
      <ClosingCta />
    </>
  );
}
