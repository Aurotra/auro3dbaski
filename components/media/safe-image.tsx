"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

/** Koyu atölye zeminine yakın 1×1 — LCP bozmadan blur. */
export const INK_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkKC8vRwABhQEgvZ2S9wAAAABJRU5ErkJggg==";

const FALLBACK_SRC = "/images/workshop/lambalar.webp";

type Props = Omit<ImageProps, "onError" | "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  fallbackSrc = FALLBACK_SRC,
  alt,
  placeholder = "blur",
  blurDataURL = INK_BLUR,
  ...rest
}: Props) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
    />
  );
}
