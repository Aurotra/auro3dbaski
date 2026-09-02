import { cn } from "@/lib/cn";

export function MeasureLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-accent/40 bg-ink px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-accent-2",
        className,
      )}
    >
      {children}
    </span>
  );
}
