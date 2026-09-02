import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Teklif",
  description:
    "3D baskı teklifi. Malzeme, adet ve parça notunu yaz; Auro 3D Baskı dönüş yapsın.",
};

export default function TeklifPage() {
  return (
    <article className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <div>
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-cyan">
          Teklif
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-tight text-bone">
          Parçayı anlat
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-mist">
          Form e-postanı açar. STL, 3MF veya fotoğrafı o maile ekle. Dosya yoksa
          ölçü ve iş de yeter.
        </p>
        <ul className="mt-8 space-y-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
          <li>G28 ; home</li>
          <li>M115 ; firmware</li>
          <li className="text-lime">; hedef {site.email}</li>
        </ul>
      </div>
      <div className="border border-line bg-bed p-6 sm:p-8">
        <QuoteForm />
      </div>
    </article>
  );
}
