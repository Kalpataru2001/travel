// src/hooks/useDestinationImage.ts
// React hook that resolves a destination image with graceful 3-tier fallback.
// Returns placeholder immediately, then upgrades to real image asynchronously.

import { useState, useEffect } from 'react';
import { resolveDestinationImage, getPicsumUrl } from '../utils/images';

export function useDestinationImage(keyword: string, width = 600, height = 400) {
  // Start with the guaranteed picsum URL synchronously
  const [src, setSrc] = useState<string>(() => getPicsumUrl(keyword || 'travel', width, height));
  const [isLoading, setIsLoading] = useState(true);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    if (!keyword) return;

    let cancelled = false;
    setIsLoading(true);
    setIsReal(false);
    // Reset to picsum while resolving
    setSrc(getPicsumUrl(keyword, width, height));

    resolveDestinationImage(keyword)
      .then((resolvedUrl) => {
        if (!cancelled) {
          setSrc(resolvedUrl);
          setIsLoading(false);
          // If it's not a picsum URL, it's a real photo
          setIsReal(!resolvedUrl.includes('picsum.photos'));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [keyword, width, height]);

  return { src, isLoading, isReal };
}
