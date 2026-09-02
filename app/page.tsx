import { ClosingCta } from "@/components/home/closing-cta";
import { Hero } from "@/components/home/hero";
import { IntroBlock } from "@/components/home/intro-block";
import { SeriesGrid } from "@/components/home/series-grid";
import { StatsStrip } from "@/components/home/stats-strip";
import { ToolsStrip } from "@/components/home/tools-strip";
import { TopVideosShowcase } from "@/components/home/top-videos-showcase";
import { getSocialStats } from "@/lib/social-stats";

export const revalidate = 3600;

export default async function HomePage() {
  const stats = await getSocialStats();

  return (
    <>
      <Hero />
      <TopVideosShowcase />
      <IntroBlock />
      <StatsStrip totalFollowers={stats.totalFollowers} />
      <SeriesGrid />
      <ToolsStrip />
      <ClosingCta />
    </>
  );
}
