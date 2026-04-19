/**
 * lib/api.ts — AnimeWatch Hymn
 *
 * Strategy:
 *  METADATA  → Jikan API v4 (MyAnimeList mirror, public, no auth)
 *  STREAMING → iframe embed via 2embed.cc / miruro.tv (MAL ID based)
 *
 * Routing IDs are plain MAL integer IDs (no encoding needed).
 * Episode IDs use format: "{mal_id}-episode-{number}"
 */

import {
  AnimeDetails,
  AnimeSummary,
  Episode,
  HomeFeed,
  ProviderResult,
  SearchFilters,
  SearchPayload,
  StreamingLink,
  WatchPayload,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const JIKAN_BASE = "https://api.jikan.moe/v4";

const PROVIDER_META = {
  id: "jikan-mal" as const,
  label: "MyAnimeList (Jikan)",
  baseUrl: JIKAN_BASE,
  watchCategory: "sub" as const,
};

// Build embed URLs from MAL ID + episode number
function buildEmbedUrl(malId: number, episode: number): string {
  return `https://2embed.cc/embed/mal/${malId}/${episode}`;
}

function buildFallbackEmbedUrl(malId: number, episode: number): string {
  return `https://www.miruro.tv/watch?id=${malId}&ep=${episode}`;
}

// ---------------------------------------------------------------------------
// Episode ID encoding (format: "{malId}-episode-{number}")
// ---------------------------------------------------------------------------

export function encodeEpisodeId(malId: number | string, episodeNumber: number): string {
  return `${malId}-episode-${episodeNumber}`;
}

export function decodeEpisodeId(episodeId: string): { malId: number; episodeNumber: number } {
  const match = episodeId.match(/^(\d+)-episode-(\d+)$/);
  if (match) {
    return { malId: Number(match[1]), episodeNumber: Number(match[2]) };
  }
  // Fallback: try to parse as "malId-ep-N"
  const fallback = episodeId.match(/^(\d+)/);
  return { malId: fallback ? Number(fallback[1]) : 0, episodeNumber: 1 };
}

// For anime IDs, Jikan uses plain MAL integer IDs
export function encodeId(malId: number | string): string {
  return String(malId);
}

export function decodeId(id: string): number {
  return parseInt(id, 10) || 0;
}

// ---------------------------------------------------------------------------
// In-memory server cache
// ---------------------------------------------------------------------------

const _cache = new Map<string, { ts: number; data: unknown }>();

function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < ttlMs) return Promise.resolve(hit.data as T);
  return fn().then((data) => {
    _cache.set(key, { ts: Date.now(), data });
    return data;
  });
}

// ---------------------------------------------------------------------------
// Fetch helper — Jikan rate limit: 3 req/sec, 60 req/min
// ---------------------------------------------------------------------------

async function fetchJikan<T = unknown>(path: string): Promise<T> {
  const url = `${JIKAN_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  const text = await res.text();

  if (res.status === 429) {
    throw new Error("Jikan rate limit hit — silakan coba lagi sebentar");
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} dari Jikan: ${path}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Non-JSON response dari Jikan: ${path}`);
  }
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

function normalizeImage(images?: any): string {
  return (
    images?.jpg?.large_image_url ||
    images?.jpg?.image_url ||
    images?.webp?.image_url ||
    "https://placehold.co/600x900/18181b/f4f4f5?text=Anime"
  );
}

function normalizeJikanAnime(m: any): AnimeSummary {
  return {
    id: encodeId(m.mal_id),
    title: m.title_english || m.title || "Unknown",
    image: normalizeImage(m.images),
    episodeCount: m.episodes ?? undefined,
    rating: m.score ? String(m.score) : undefined,
  };
}

// ---------------------------------------------------------------------------
// getHomeFeed — current season anime
// ---------------------------------------------------------------------------

export async function getHomeFeed(): Promise<ProviderResult<HomeFeed>> {
  try {
    const d = await cached("home:jikan:season", 10 * 60_000, () =>
      fetchJikan<{ data: any[]; pagination: any }>("/seasons/now?limit=24")
    );

    const data = Array.isArray(d.data) ? d.data : [];
    const all = data.map(normalizeJikanAnime);

    // Spotlight: top-scored airing
    const spotlight = [...data]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 6)
      .map(normalizeJikanAnime);

    return {
      provider: PROVIDER_META,
      data: {
        recent: all.slice(0, 20),
        trending: all.slice(0, 12),
        spotlight,
      },
    };
  } catch (e) {
    console.warn("[api] Jikan home failed:", (e as Error).message);
    return {
      provider: PROVIDER_META,
      data: { recent: [], trending: [], spotlight: [] },
    };
  }
}

// ---------------------------------------------------------------------------
// searchAnime
// ---------------------------------------------------------------------------

export async function searchAnime(filters: SearchFilters): Promise<ProviderResult<SearchPayload>> {
  const { q } = filters;

  if (!q?.trim()) {
    return {
      provider: PROVIDER_META,
      data: { results: [], featured: [], totalPages: 1, currentPage: 1 },
    };
  }

  try {
    const d = await fetchJikan<{ data: any[]; pagination: any }>(
      `/anime?q=${encodeURIComponent(q)}&limit=20&sfw=true`
    );

    const results = Array.isArray(d.data) ? d.data.map(normalizeJikanAnime) : [];

    return {
      provider: PROVIDER_META,
      data: {
        results,
        featured: results.slice(0, 8),
        currentPage: 1,
        totalPages: d.pagination?.last_visible_page ?? 1,
      },
    };
  } catch (e) {
    console.warn("[api] Jikan search failed:", (e as Error).message);
    return {
      provider: PROVIDER_META,
      data: { results: [], featured: [], totalPages: 1, currentPage: 1 },
    };
  }
}

// ---------------------------------------------------------------------------
// getAnimeDetails — also fetches episode list
// ---------------------------------------------------------------------------

export async function getAnimeDetails(id: string): Promise<ProviderResult<AnimeDetails>> {
  const malId = decodeId(id);

  // Fetch detail and episodes page 1 in parallel
  const [detailRes, ep1Res] = await Promise.allSettled([
    cached(`detail:${malId}`, 15 * 60_000, () =>
      fetchJikan<{ data: any }>(`/anime/${malId}/full`)
    ),
    cached(`episodes:${malId}:1`, 15 * 60_000, () =>
      fetchJikan<{ data: any[]; pagination: any }>(`/anime/${malId}/episodes?page=1`)
    ),
  ]);

  if (detailRes.status === "rejected") {
    console.warn("[api] Jikan detail failed:", detailRes.reason?.message);
    throw detailRes.reason;
  }

  const m = detailRes.value.data ?? {};
  let epData: any[] = ep1Res.status === "fulfilled" ? (ep1Res.value.data ?? []) : [];
  let totalEpPages = ep1Res.status === "fulfilled" ? (ep1Res.value.pagination?.last_visible_page ?? 1) : 1;

  // Fetch pages 2 and 3 if available (max 75 ep per page × 3 = 225 ep shown)
  if (totalEpPages > 1) {
    const extraPages = Math.min(totalEpPages, 3);
    const extraFetches = [];
    for (let p = 2; p <= extraPages; p++) {
      extraFetches.push(
        cached(`episodes:${malId}:${p}`, 15 * 60_000, () =>
          fetchJikan<{ data: any[] }>(`/anime/${malId}/episodes?page=${p}`)
        ).catch(() => ({ data: [] }))
      );
    }
    const extra = await Promise.all(extraFetches);
    extra.forEach((r) => { epData = epData.concat(r.data ?? []); });
  }

  const episodes: Episode[] = epData.map((ep: any) => ({
    id: encodeEpisodeId(malId, ep.mal_id),
    number: ep.mal_id,
    title: ep.title || `Episode ${ep.mal_id}`,
  }));

  const genres = Array.isArray(m.genres)
    ? m.genres.map((g: any) => g.name as string)
    : [];

  return {
    provider: PROVIDER_META,
    data: {
      id: encodeId(malId),
      title: m.title_english || m.title || "Unknown",
      image: normalizeImage(m.images),
      synopsis: m.synopsis ?? undefined,
      genres,
      status: m.status ?? undefined,
      releaseDate: m.year ? String(m.year) : undefined,
      episodes,
    },
  };
}

// ---------------------------------------------------------------------------
// getWatchPayload — builds embed URLs from MAL ID + episode number
// ---------------------------------------------------------------------------

export async function getWatchPayload(
  episodeId: string,
  animeId?: string
): Promise<ProviderResult<WatchPayload>> {
  const { malId, episodeNumber } = decodeEpisodeId(episodeId);
  const effectiveMalId = malId || (animeId ? decodeId(animeId) : 0);

  const embedUrl = buildEmbedUrl(effectiveMalId, episodeNumber);
  const fallbackEmbedUrl = buildFallbackEmbedUrl(effectiveMalId, episodeNumber);

  // Streaming links: provide embed URLs as "links" with isEmbed flag
  const streamingLinks: StreamingLink[] = [
    { url: embedUrl, quality: "2embed", isM3U8: false, isEmbed: true },
    { url: `https://vidsrc.to/embed/anime/${effectiveMalId}/${episodeNumber}`, quality: "vidsrc.to", isM3U8: false, isEmbed: true },
    { url: `https://vidsrc.me/embed/anime/${effectiveMalId}/${episodeNumber}`, quality: "vidsrc.me", isM3U8: false, isEmbed: true },
    { url: `https://vidsrc.xyz/embed/anime/${effectiveMalId}/${episodeNumber}`, quality: "vidsrc.xyz", isM3U8: false, isEmbed: true },
    { url: `https://embed.su/embed/anime/${effectiveMalId}/${episodeNumber}`, quality: "embed.su", isM3U8: false, isEmbed: true },
    { url: fallbackEmbedUrl, quality: "Miruro", isM3U8: false, isEmbed: true },
  ];

  // Fetch anime detail for sidebar (non-blocking)
  let details: Awaited<ReturnType<typeof getAnimeDetails>>["data"] | null = null;
  const resolvedAnimeId = animeId || encodeId(effectiveMalId);
  if (resolvedAnimeId) {
    try {
      details = (await getAnimeDetails(resolvedAnimeId)).data;
    } catch {}
  }

  return {
    provider: PROVIDER_META,
    data: {
      id: episodeId,
      title: details?.title
        ? `${details.title} — Episode ${episodeNumber}`
        : `Episode ${episodeNumber}`,
      image: details?.image ?? "https://placehold.co/600x900/18181b/f4f4f5?text=Anime",
      animeId: resolvedAnimeId,
      episodeId,
      episodeNumber,
      episodes: details?.episodes ?? [],
      streamingLinks,
      embedUrl,
    },
  };
}
