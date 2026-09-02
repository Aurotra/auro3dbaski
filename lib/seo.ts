import type { Metadata } from "next";
import { site } from "@/lib/site";

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type: "website",
      images: [{ url: "/og-default.svg" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
