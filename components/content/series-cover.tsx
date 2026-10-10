import { SafeImage } from "@/components/media/safe-image";
import { cn } from "@/lib/cn";

export function SeriesCover({
  src,
  title,
  sizes,
  width,
  height,
  className,
}: {
  src?: string;
  title: string;
  sizes: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (src && width && height) {
    return (
      <SafeImage
        src={src}
        alt={`${title} kapak görseli`}
        width={width}
        height={height}
        className={cn("h-auto w-full", className)}
        sizes={sizes}
      />
    );
  }

  if (src) {
    return (
      <SafeImage
        src={src}
        alt={`${title} kapak görseli`}
        fill
        className={cn("object-cover", className)}
        sizes={sizes}
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-end gap-1 border border-dashed border-white/20 bg-ink px-4 py-3">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent-2">
        Taslak
      </p>
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
        Kapak yok
      </p>
    </div>
  );
}
