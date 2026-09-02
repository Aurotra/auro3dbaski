import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
};

export default function KvkkPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight text-bone">
        KVKK Aydınlatma Metni
      </h1>
      <div className="mt-8 space-y-4 leading-relaxed text-mist">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri
          sorumlusu {site.name}’dır.
        </p>
        <p>
          Teklif ve iletişim formları üzerinden ilettiğiniz ad, e-posta ve parça
          notu; talebinizi yanıtlamak ve üretimi planlamak için işlenir.
          Üçüncü kişilerle pazarlama amacıyla paylaşılmaz.
        </p>
        <p>
          Başvurularınız için:{" "}
          <a href={`mailto:${site.email}`} className="text-cyan">
            {site.email}
          </a>
        </p>
      </div>
    </article>
  );
}
