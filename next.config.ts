import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `auro3dmap/` alt klasörü kendi package-lock.json'ına sahip ayrı bir
  // proje (Vercel'de bağımsız deploy edilir) — Next'in yanlışlıkla üst
  // dizinde bir workspace root'u algılamasını önlemek için sabitliyoruz.
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopier.app", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/posters/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/map", destination: "https://auro3dmap.vercel.app" },
      {
        source: "/map/:path*",
        destination: "https://auro3dmap.vercel.app/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.auro3dbaski.com" }],
        destination: "https://auro3dbaski.com/:path*",
        permanent: true,
      },
      {
        source: "/hizmetler",
        destination: "/ozel-uretim",
        permanent: true,
      },
      {
        source: "/teklif",
        destination: "/ozel-uretim",
        permanent: true,
      },
      {
        source: "/malzemeler",
        destination: "/ozel-uretim",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
