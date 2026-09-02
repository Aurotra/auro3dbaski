import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { tools } from "@/data/content";

export function ToolsStrip() {
  return (
    <section className="bg-paper px-4 py-16 text-ink">
      <div className="mx-auto max-w-6xl">
        <SectionHeading tone="light" eyebrow="Araçlar">
          Kendi tasarımını üret
        </SectionHeading>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={tool.href}
                className="block rounded-md border border-ink/10 bg-white p-5 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-accent">
                  Yakında
                </p>
                <h3 className="mt-2 font-display text-2xl">{tool.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{tool.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
