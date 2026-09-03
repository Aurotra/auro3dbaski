import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import { ogImage } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display-face",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body-face",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono-face",
  display: "swap",
});

const defaultTitle = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: defaultTitle,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: defaultTitle,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: site.locale,
    type: "website",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: site.description,
    images: [ogImage.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.channelName,
    alternateName: site.name,
    url: site.url,
    email: site.email,
    sameAs: [site.instagram, site.tiktok, site.youtube],
  };

  return (
    <html lang="tr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
        />
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-ink"
        >
          İçeriğe geç
        </a>
        <SiteHeader />
        <Toaster>
          <main id="icerik" className="flex-1">
            {children}
          </main>
        </Toaster>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
