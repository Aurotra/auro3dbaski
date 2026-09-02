import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function ClosingCta() {
  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto max-w-6xl rounded-md border border-white/10 bg-ink-soft p-8">
        <h2 className="border-l-4 border-accent pl-4 font-display text-3xl text-text">
          Atölyeyi takip et
        </h2>
        <form className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="bulten">
            E-posta
          </label>
          <input
            id="bulten"
            type="email"
            disabled
            placeholder="e-posta"
            className="flex-1 rounded-md border border-white/15 bg-ink px-3 py-2.5 text-text"
          />
          <button
            type="button"
            disabled
            className="rounded-md bg-white/10 px-4 py-2.5 font-display text-sm text-muted"
          >
            Kaydol
          </button>
        </form>
        {/* TODO: bülten servisi seçilecek */}
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
