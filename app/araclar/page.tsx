import Link from "next/link";
import { PrintCostCalc } from "@/components/calculators/print-cost";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Araçlar",
  description: "3D baskı maliyet ve gramaj hesaplayıcı, geçme toleransı.",
  path: "/araclar",
});

export default function AraclarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Araçlar
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Filament gramajı ve baskı süresinden taban maliyeti canlı hesaplar.
        Sayılar başlangıç noktası — yazıcıda doğrula.
      </p>
      <div className="mt-10 max-w-3xl">
        <PrintCostCalc />
      </div>
      <p className="mt-8 text-sm text-muted">
        Fire payı, kWh tarifesi ve geçme toleransı için{" "}
        <Link href="/araclar/hesaplayicilar" className="text-accent-2">
          ayrıntılı hesaplayıcılar
        </Link>
        .
      </p>
    </div>
  );
}
