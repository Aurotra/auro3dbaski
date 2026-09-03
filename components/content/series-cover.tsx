import { SafeImage } from "@/components/media/safe-image";

export function SeriesCover({
  src,
  title,
  sizes,
}: {
  src?: string;
  title: string;
  sizes: string;
}) {
  if (src) {
    return (
      <SafeImage
        src={src}
        alt={`${title} kapak görseli`}
        fill
        className="object-cover"
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
