import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  children,
  tone = "dark",
}: {
  eyebrow?: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <div>
      {eyebrow ? (
        <p
          className={cn(
            "mb-2 font-mono text-[0.7rem] uppercase tracking-[0.16em]",
            tone === "dark" ? "text-accent" : "text-accent",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "border-l-4 border-accent pl-4 font-display text-3xl tracking-tight sm:text-4xl",
          tone === "dark" ? "text-text" : "text-ink",
        )}
      >
        {children}
      </h2>
    </div>
  );
}
