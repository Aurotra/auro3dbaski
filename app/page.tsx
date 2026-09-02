import { ClosingCta } from "@/components/home/closing-cta";
import { Hero } from "@/components/home/hero";
import { IntroBlock } from "@/components/home/intro-block";
import { SeriesGrid } from "@/components/home/series-grid";
import { StatsStrip } from "@/components/home/stats-strip";
import { TopVideosShowcase } from "@/components/home/top-videos-showcase";
import { getInstagramVideos } from "@/lib/instagram-videos";
import { getSocialStatsSafe } from "@/lib/social-stats";

export const revalidate = 3600;

export default async function HomePage() {
  const [stats, instagramVideos] = await Promise.all([
    getSocialStatsSafe(),
    getInstagramVideos(),
  ]);

  return (
    <>
      <Hero />
      <TopVideosShowcase videos={instagramVideos} />
      <IntroBlock />
      <StatsStrip totalFollowers={stats.totalFollowers} />
      <SeriesGrid />
      <ClosingCta />
    </>
  );
}
