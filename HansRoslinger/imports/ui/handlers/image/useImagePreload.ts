// useImagePreload.ts
// Lightweight in-memory image preloader to avoid repeated network fetches
import { useEffect, useRef } from "react";

const imgCache = new Map<string, HTMLImageElement>();

function preload(url: string) {
  if (!url || imgCache.has(url)) return;
  const img = new Image();
  img.src = url;
  img.decoding = "async";
  img.loading = "eager";
  imgCache.set(url, img);
}

export function useImagePreload(urls: string[]) {
  const prev = useRef<string[]>([]);
  useEffect(() => {
    // Preload new URLs
    urls.forEach((u) => preload(u));
    prev.current = urls;
  }, [urls.join("|")]);
}

export function isCached(url: string): boolean {
  return imgCache.has(url);
}
