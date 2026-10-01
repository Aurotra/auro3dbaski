import { SafeImage } from "@/components/media/safe-image";
import { Button } from "@/components/ui/button";
import { intro } from "@/data/team";

export function IntroBlock() {
  return (
    <section className="bg-ink px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[9/16] overflow-hidden rounded-md border border-white/10 bg-ink-soft">
          {intro.photoUrl ? (
            <SafeImage
              src={intro.photoUrl}
              alt={intro.photoAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : null}
        </div>
        <div>
          <h2 className="border-l-4 border-accent pl-4 font-display text-3xl text-text">{intro.heading}</h2>
          <div className="mt-6 space-y-3 text-muted">
            {intro.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Button href="/hakkimda" className="mt-8">
            Hikayemizi Oku
          </Button>
        </div>
      </div>
    </section>
  );
}
