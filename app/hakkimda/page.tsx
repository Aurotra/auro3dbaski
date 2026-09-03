import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { story, team } from "@/data/team";
import { capabilities, timeline, workshopShots } from "@/data/workshop";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SafeImage } from "@/components/media/safe-image";

export const metadata = pageMeta({
  title: "Hakkımızda",
  description: `${site.name} marka hikâyesi, ekip ve atölye.`,
  path: "/hakkimda",
});

export default function HakkimdaPage() {
  const people = team.map((m) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.name,
    jobTitle: m.title,
    worksFor: { "@type": "Organization", name: site.name },
  }));

  return (
    <article className="mx-auto max-w-6xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(people) }}
      />
      <div className="max-w-3xl">
        <h1 className="border-l-4 border-accent pl-4 font-display text-5xl text-text">
          {story.heading}
        </h1>
        <div className="mt-6 space-y-3 text-muted">
          {story.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      <h2 className="mt-16 border-l-4 border-accent pl-4 font-display text-3xl text-text">
        Bu işi kimler yürütüyor
      </h2>
      <ul className="mt-8 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
        {team.map((m) => (
          <li
            key={m.id}
            className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-ink-soft p-5"
          >
            <div>
              <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-md bg-ink">
                <SafeImage
                  src={m.photoUrl}
                  alt={m.photoAlt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <p className="font-display text-2xl text-text">{m.name}</p>
              <div className="mt-2 flex min-h-8 flex-wrap items-center gap-2">
                <Badge className="border-accent/40 text-accent-2">{m.title}</Badge>
              </div>
              <p className="mt-2 min-h-10 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
                {m.role}
              </p>
              <div className="mt-1">
                {m.body.map((p) => (
                  <p key={p} className="mt-3 text-sm text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-3 pt-6">
              <div className="flex min-h-16 flex-wrap content-start gap-2">
                {m.techs.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
              <div className="flex min-h-5 flex-wrap gap-3 font-mono text-[0.7rem] uppercase tracking-[0.12em]">
                {m.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-2 hover:text-accent"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-2">
        <figure className="flex h-full flex-col overflow-hidden rounded-md border border-white/10 bg-ink-soft">
          <div className="relative min-h-[360px] flex-1">
            <SafeImage
              src="/images/workshop/filo.webp"
              alt="Bambu Lab yazıcılar, filament rafları ve atölye düzeni"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <figcaption className="px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent">
            Atölye filosu · Bambu Lab
          </figcaption>
        </figure>
        <div className="flex h-full flex-col">
          <h2 className="border-l-4 border-accent pl-4 font-display text-3xl text-text">
            Atölye kabiliyeti
          </h2>
          <p className="mt-2 text-sm text-muted">
            Bambu Lab ve Elegoo FDM/SLA ekosistemi. Dilimleme, prototip, kısa seri —
            cihaz sayısı değil, ne basılabildiği.
          </p>
          <ul className="mt-6 grid flex-1 gap-3">
            {capabilities.map((e) => (
              <li key={e.id} className="h-full">
                <Card className="flex h-full flex-col">
                  <h3 className="font-display text-xl text-text">{e.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{e.use}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {e.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mt-16 border-l-4 border-accent pl-4 font-display text-3xl text-text">
        Atölyeden çıkanlar
      </h2>
      <p className="mt-2 text-sm text-muted">
        Kendi çekimlerimiz — lamba, keman, tekne, sardalya, Anı Müzesi, prototip.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workshopShots.map((shot) => (
          <li key={shot.id}>
            <figure className="overflow-hidden rounded-md border border-white/10 bg-ink-soft">
              <div className="relative aspect-[3/4]">
                <SafeImage
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <figcaption className="px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent">
                {shot.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <h2 className="mt-16 border-l-4 border-accent pl-4 font-display text-3xl text-text">
        Zaman çizelgesi
      </h2>
      <ol className="mt-8 border-l border-accent/50 pl-6">
        {timeline.map((t) => (
          <li key={t.id} className="relative mb-8">
            <span className="absolute -left-[29px] top-1 size-3 rounded-full bg-accent" />
            <p className="font-mono text-xs text-accent-2">{t.date}</p>
            <h3 className="font-display text-xl text-text">{t.title}</h3>
            <p className="text-sm text-muted">{t.body}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
