import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  tone = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-5",
        tone === "dark"
          ? "border-white/10 bg-ink-soft"
          : "border-ink/10 bg-paper",
        className,
      )}
    >
      {children}
    </div>
  );
}
