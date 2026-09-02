import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border border-white/15 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
