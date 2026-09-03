import { SafeImage } from "@/components/media/safe-image";

const LAYER_LINES = Array.from({ length: 16 }, (_, i) => {
  const y = 18 + i * 18;
  const opacity = (0.08 + (i % 4) * 0.05).toFixed(2);
  return (
    <line
      key={i}
      x1="20"
      x2="400"
      y1={y}
      y2={y}
      stroke="#22d3ee"
      strokeWidth="1"
      strokeOpacity={opacity}
    />
  );
});

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
    <div className="absolute inset-0 bg-ink-soft" aria-hidden="true">
      <svg
        className="size-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="400" height="300" fill="#10182e" />
        <rect width="6" height="300" fill="#22d3ee" />
        {LAYER_LINES}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
    </div>
  );
}
