import { ClosingCta } from "@/components/home/closing-cta";
import { Hero } from "@/components/home/hero";
import { IntroBlock } from "@/components/home/intro-block";
import { ProductStrip } from "@/components/home/product-strip";
import { ProofCompare } from "@/components/home/proof-compare";
import { SeriesGrid } from "@/components/home/series-grid";
import { StatsStrip } from "@/components/home/stats-strip";
import { ToolsStrip } from "@/components/home/tools-strip";
import { TopVideosShowcase } from "@/components/home/top-videos-showcase";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TopVideosShowcase />
      <IntroBlock />
      <StatsStrip />
      <SeriesGrid />
      <ProofCompare />
      <ProductStrip />
      <ToolsStrip />
      <ClosingCta />
    </>
  );
}
