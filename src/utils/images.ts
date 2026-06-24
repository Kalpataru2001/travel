// src/utils/images.ts
// Smart destination photo fetcher with 3-tier fallback:
//   Tier 1: Unsplash API (if VITE_UNSPLASH_ACCESS_KEY is set)
//   Tier 2: Wikimedia Commons API (free, no key required, real destination photos)
//   Tier 3: Lorem Picsum seed (guaranteed, never returns 500)

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;

// In-memory cache: keyword → resolved image URL
const imageCache = new Map<string, string>();

// --------------------------------------------------------------------------
// Tier 3: Picsum fallback (deterministic seed from keyword)
// --------------------------------------------------------------------------
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPicsumUrl(keyword: string, width = 600, height = 400): string {
  const seed = (hashCode(keyword) % 900) + 1; // 1-900 range
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// --------------------------------------------------------------------------
// Tier 2: Wikimedia Commons API (free, no key, real destination photos)
// --------------------------------------------------------------------------
async function fetchWikimediaImage(keyword: string): Promise<string | null> {
  try {
    const searchUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(keyword + ' travel')}&srnamespace=6&srlimit=6&format=json&origin=*`;

    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const results: { title: string }[] = searchData?.query?.search || [];
    if (results.length === 0) return null;

    // Try results in order until we find a photographic image
    for (const result of results) {
      const infoUrl =
        `https://commons.wikimedia.org/w/api.php?action=query` +
        `&titles=${encodeURIComponent(result.title)}&prop=imageinfo` +
        `&iiprop=url|size&iiurlwidth=800&format=json&origin=*`;

      const infoRes = await fetch(infoUrl, { signal: AbortSignal.timeout(4000) });
      if (!infoRes.ok) continue;

      const infoData = await infoRes.json();
      const pages = infoData?.query?.pages || {};
      const firstPage = Object.values(pages)[0] as any;
      const imageUrl: string | undefined =
        firstPage?.imageinfo?.[0]?.thumburl || firstPage?.imageinfo?.[0]?.url;

      // Skip SVG, GIF, diagrams, logos
      if (
        !imageUrl ||
        imageUrl.includes('.svg') ||
        imageUrl.includes('.gif') ||
        imageUrl.includes('.tif')
      ) {
        continue;
      }

      return imageUrl;
    }
    return null;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Tier 1: Unsplash API (requires VITE_UNSPLASH_ACCESS_KEY in .env)
// --------------------------------------------------------------------------
async function fetchUnsplashImage(keyword: string): Promise<string | null> {
  if (!UNSPLASH_KEY) return null;
  try {
    const url =
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}` +
      `&per_page=5&orientation=landscape&client_id=${UNSPLASH_KEY}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null; // gracefully handles 500, 403, 429

    const data = await res.json();
    const results: { urls: { regular: string } }[] = data?.results || [];
    if (results.length === 0) return null;

    return results[0].urls.regular;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Main resolver: returns best image URL using fallback chain
// --------------------------------------------------------------------------
export async function resolveDestinationImage(keyword: string): Promise<string> {
  if (!keyword || keyword.trim() === '') {
    return getPicsumUrl('travel');
  }

  const cacheKey = keyword.trim().toLowerCase();

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Run tiers in order
  const tiers: Array<() => Promise<string | null>> = [
    () => fetchUnsplashImage(keyword),
    () => fetchWikimediaImage(keyword),
  ];

  for (const fetchFn of tiers) {
    try {
      const url = await fetchFn();
      if (url) {
        imageCache.set(cacheKey, url);
        return url;
      }
    } catch {
      // continue to next tier
    }
  }

  const fallback = getPicsumUrl(keyword);
  imageCache.set(cacheKey, fallback);
  return fallback;
}

// --------------------------------------------------------------------------
// Prewarm: fetch all keywords in parallel (call on trip load)
// --------------------------------------------------------------------------
export async function prewarmImageCache(keywords: string[]): Promise<void> {
  const unique = [
    ...new Set(keywords.filter(Boolean).map((k) => k.trim().toLowerCase())),
  ];
  await Promise.allSettled(unique.map((k) => resolveDestinationImage(k)));
}
