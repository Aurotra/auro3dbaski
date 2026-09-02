import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#070B14",
          color: "#F4EFE6",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 8,
            width: "100%",
            background: "linear-gradient(90deg, #8B2DFF, #D14BFF, #3AF0E8, #B6FF4A)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 6,
              color: "#3AF0E8",
            }}
          >
            AURO 3D BASKI
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              lineHeight: 0.9,
              marginTop: 24,
            }}
          >
            Katman katman.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#C9D4E0",
              marginTop: 28,
            }}
          >
            {site.tagline} · Denizli
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#8B9BB0" }}>
          {site.domain}
        </div>
      </div>
    ),
    { ...size },
  );
}
