import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
