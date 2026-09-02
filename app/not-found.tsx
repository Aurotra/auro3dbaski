import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <BrandLogo href="/" size="md" />
      <h1 className="mt-8 border-l-4 border-accent pl-4 font-display text-4xl text-text">
        Bu katman yok.
      </h1>
      <Link href="/" className="mt-8 inline-block text-accent-2">
        Ana sayfa
      </Link>
    </div>
  );
}
