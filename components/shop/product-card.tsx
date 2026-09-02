import Image from "next/image";
import { shopierStoreUrl, type ShopierProduct } from "@/data/products";

export function ProductCard({ product }: { product: ShopierProduct }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-md border border-white/10 bg-ink-soft">
      <div className="relative aspect-square bg-ink">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg text-text">{product.title}</h3>
        <p className="mt-2 font-mono text-sm text-accent-2">{product.price}</p>
        <a
          href={product.url || shopierStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glow mt-4 inline-flex w-full items-center justify-center rounded-md px-3 py-2.5 text-center font-display text-sm font-semibold hover:brightness-110"
        >
          Shopier ile Satın Al
        </a>
      </div>
    </li>
  );
}
