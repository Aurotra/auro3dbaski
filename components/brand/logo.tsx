import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

export function BrandLogo({
  href = "/",
  size = "md",
  className,
}: {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims =
    size === "lg"
      ? { width: 220, height: 220, className: "h-28 w-28 sm:h-36 sm:w-36" }
      : size === "sm"
        ? { width: 56, height: 56, className: "h-12 w-12" }
        : { width: 64, height: 64, className: "h-14 w-14" };

  const mark = (
    <Image
      src="/brands/logo.png"
      alt={site.name}
      width={dims.width}
      height={dims.height}
      className={cn("object-contain", dims.className)}
      priority={size !== "sm"}
    />
  );

  if (href === null) {
    return <span className={className}>{mark}</span>;
  }

  return (
    <Link href={href} className={cn("inline-flex shrink-0", className)} aria-label={site.name}>
      {mark}
    </Link>
  );
}
