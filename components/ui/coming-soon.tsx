import { Button } from "@/components/ui/button";

export function ComingSoon({
  eyebrow = "Yakında",
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-3 border-l-4 border-accent pl-4 font-display text-4xl text-text">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-muted">{body}</p>
      {action ? (
        <Button href={action.href} className="mt-8">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
