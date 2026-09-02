import Image from "next/image";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { story, team } from "@/data/team";
import { equipment, timeline } from "@/data/workshop";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    jobTitle: m.role,
    worksFor: { "@type": "Organization", name: site.name },
  }));

  return (
    <article className="mx-auto max-w-6xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(people) }}
      />
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="border-l-4 border-accent pl-4 font-display text-5xl text-text">
            {story.heading}
          </h1>
          <div className="mt-6 space-y-3 text-muted">
            {story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <figure className="relative aspect-[4/3] overflow-hidden rounded-md border border-white/10 bg-ink-soft">
          <Image
            src="/images/atolye-hero.webp"
            alt="Auro 3D Baskı atölyesi — FDM ve SLA üretim ortamı"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent px-4 pb-4 pt-10">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent">
              Atölye · FDM / SLA
            </span>
          </figcaption>
        </figure>
      </div>

      <h2 className="mt-16 border-l-4 border-accent pl-4 font-display text-3xl text-text">
        Bu işi kimler yürütüyor
      </h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {team.map((m) => (
          <li key={m.id} className="flex flex-col rounded-md border border-white/10 bg-ink-soft p-5">
            <div className="relative mb-4 aspect-square w-full max-w-[280px] overflow-hidden rounded-md bg-ink">
              <Image
                src={m.photoUrl}
                alt={m.photoAlt}
                fill
                className="object-cover object-top"
                sizes="280px"
              />
            </div>
            <p className="font-display text-2xl text-text">{m.name}</p>
            <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent-2">
              {m.role}
            </p>
            {m.body.map((p) => (
              <p key={p} className="mt-3 text-sm text-muted">
                {p}
              </p>
            ))}
            {m.tags ? (
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {m.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="mt-16 border-l-4 border-accent pl-4 font-display text-3xl text-text">
        Atölye ve ekipman
      </h2>
      <p className="mt-2 text-sm text-muted">
        Atölyemizde bulunan markalar: Flashforge, Bambu Lab, Elegoo. 8+ FDM /
        SLA yazıcı.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {equipment.map((e) => (
          <li key={e.id}>
            <Card>
              <h3 className="font-display text-xl text-text">{e.name}</h3>
              <p className="mt-2 text-sm text-muted">{e.use}</p>
            </Card>
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
