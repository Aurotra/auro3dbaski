import { ClearanceCalc } from "@/components/calculators/clearance";
import { FilamentCostCalc } from "@/components/calculators/filament-cost";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Hesaplayıcılar",
  description: "Filament maliyet ve geçme toleransı hesaplayıcıları.",
  path: "/araclar/hesaplayicilar",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Hesaplayıcılar
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Sayılar kumpas etiketi gibi. Başlangıç noktası — yazıcıda doğrula.
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <FilamentCostCalc />
        <ClearanceCalc />
      </div>
    </div>
  );
}
