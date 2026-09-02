import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-magenta">
        Error 404
      </p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-bone">
        Bu katman yok.
      </h1>
      <p className="mt-4 max-w-md text-mist">
        Adres baskıda yok. Ana sayfadan veya tekliften devam et.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block bg-lime px-5 py-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-chamber hover:bg-cyan"
      >
        Ana sayfa
      </Link>
    </div>
  );
}
