import Image from "next/image";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { story, team } from "@/data/team";
import { equipment, principles, timeline } from "@/data/workshop";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = pageMeta({
  title: "Hakkımızda",
  description: `${site.name} marka hikâyesi, ekip ve atölye.`,
  path: "/hakkimda",
});

export default function HakkimdaPage() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sude",
    jobTitle: "Kurucu",
    worksFor: { "@type": "Organization", name: site.name },
  };

  return (
    <article className="mx-auto max-w-6xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
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
        <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-white/10">
          <Image src="/images/sude.svg" alt="TODO: Sude atölye fotoğrafı" fill className="object-cover" sizes="50vw" />
        </div>
      </div>

      <h2 className="mt-16 border-l-4 border-accent pl-4 font-display text-3xl text-text">
        Bu işi kimler yürütüyor
      </h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {team.map((m) => (
          <li key={m.id} className="rounded-md border border-white/10 bg-ink-soft p-5">
            <div className="relative mb-4 aspect-square max-w-[220px] overflow-hidden rounded-md">
              <Image src={m.photoUrl} alt={m.photoAlt} fill className="object-cover" sizes="220px" />
            </div>
            <p className="font-display text-2xl text-text">{m.name}</p>
            <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent-2">
              {m.role}
            </p>
            <p className="mt-3 text-sm text-muted">{m.body}</p>
            {m.tags ? (
              <div className="mt-3 flex flex-wrap gap-2">
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
      <p className="mt-2 text-sm text-muted">TODO: atölye fotoğrafları</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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
        Çalışma prensipleri
      </h2>
      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {principles.map((p) => (
          <li key={p.title}>
            <Card>
              <h3 className="font-display text-xl text-text">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
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
