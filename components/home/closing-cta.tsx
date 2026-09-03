import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function ClosingCta() {
  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl rounded-md border border-white/10 bg-ink-soft p-8">
        <h2 className="border-l-4 border-accent pl-4 font-display text-3xl text-text">
          Atölyeyi takip et
        </h2>
        <p className="mt-4 max-w-xl text-sm text-muted">
          Yeni baskı ve testler Instagram, TikTok ve YouTube’da. Bülten yok —
          kanallardan takip yeterli.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={site.instagram} variant="outline">
            Instagram
          </Button>
          <Button href={site.tiktok} variant="outline">
            TikTok
          </Button>
          <Button href={site.youtube} variant="outline">
            YouTube
          </Button>
        </div>
      </div>
    </section>
  );
}
