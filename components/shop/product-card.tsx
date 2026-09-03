import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/media/safe-image";
import { type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const remote = product.imageUrl.startsWith("http");

  return (
    <li>
      <article className="group flex h-full flex-col overflow-hidden rounded-md border border-white/10 bg-ink-soft transition-colors hover:border-accent/40">
        <div className="relative aspect-square overflow-hidden bg-ink">
          <SafeImage
            src={product.imageUrl}
            alt={product.title}
            fill
            unoptimized={remote}
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_92%,rgb(34_211_238_/_0.28)_92%,transparent_100%)] bg-[length:100%_10px] opacity-0 mix-blend-screen motion-safe:transition-opacity motion-safe:group-hover:opacity-100"
          />
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-accent" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h2 className="font-display text-xl leading-snug text-text">{product.title}</h2>
          {product.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted">{product.description}</p>
          ) : null}
          {product.variants && product.variants.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <Badge key={v}>{v}</Badge>
              ))}
            </div>
          ) : null}
          <p className="mt-2 font-mono text-lg tabular-nums text-accent-2">{product.price}</p>
          <a
            href={product.shopierUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow mt-auto inline-flex w-full items-center justify-center rounded-md px-3 py-2.5 text-center font-display text-sm font-semibold hover:brightness-110"
          >
            Shopier ile Güvenle Satın Al
          </a>
        </div>
      </article>
    </li>
  );
}
