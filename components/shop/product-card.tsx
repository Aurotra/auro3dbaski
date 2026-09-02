import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <li>
      <a
        href={product.shopierUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-md border border-white/10 bg-ink-soft transition-colors hover:border-accent/40 focus-visible:border-accent"
      >
        <div className="relative aspect-square overflow-hidden bg-ink">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
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
          {product.material || product.shipping ? (
            <div className="flex flex-wrap gap-2">
              {product.material ? <Badge>{product.material}</Badge> : null}
              {product.shipping ? <Badge>{product.shipping}</Badge> : null}
            </div>
          ) : null}
          <h2 className="mt-3 font-display text-xl leading-snug text-text">{product.title}</h2>
          <p className="mt-2 font-mono text-lg tabular-nums text-accent-2">{product.price}</p>
          <span className="btn-glow mt-5 inline-flex w-full items-center justify-center rounded-md px-3 py-2.5 text-center font-display text-sm font-semibold">
            Shopier ile Satın Al
          </span>
        </div>
      </a>
    </li>
  );
}
