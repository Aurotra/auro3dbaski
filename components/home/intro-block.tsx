import { SafeImage } from "@/components/media/safe-image";
import { Button } from "@/components/ui/button";
import { intro, team } from "@/data/team";

const sude = team.find((m) => m.id === "sude");

export function IntroBlock() {
  return (
    <section className="bg-paper px-4 py-16 text-ink">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-ink/10 bg-ink-soft">
          <SafeImage
            src={sude?.photoUrl ?? "/images/team/sude.webp"}
            alt={sude?.photoAlt ?? "Sude Can Sümer"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          <h2 className="border-l-4 border-accent pl-4 font-display text-3xl">{intro.heading}</h2>
          <div className="mt-6 space-y-3 text-ink/80">
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
