export type ProviderId =
  | "anilist"
  | "jikan"
  | "jikan-mal"
  | "kitsu"
  | "siputzx-otakudesu"
  | "cinetaro";

export interface Episode {
  id: string;
  number: number;
  title: string;
  isFiller?: boolean;
}

export interface StreamingLink {
  url: string;
  quality: string;
  isM3U8: boolean;
  /** If true, render as <iframe> instead of native video player */
  isEmbed?: boolean;
}

export interface AnimeSummary {
  id: string;
  malId?: number;
  anilistId?: number;
  title: string;
  image: string;
  description?: string;
  type?: string;
  rating?: string;
  duration?: string;
  subCount?: number;
  dubCount?: number;
  episodeCount?: number;
}

export interface AnimeDetails extends AnimeSummary {
  synopsis?: string;
  genres: string[];
  status?: string;
  releaseDate?: string;
  episodes: Episode[];
  /** Cinetaro embed URL — ready to drop into <iframe src> */
  embedUrl?: string;
}

export interface WatchPayload {
  id: string;
  title: string;
  image: string;
  animeId?: string;
  anilistId?: number;
  episodeId: string;
  episodeNumber?: number;
  episodes: Episode[];
  streamingLinks: StreamingLink[];
  /** Cinetaro embed URL as fallback — ready to drop into <iframe src> */
  embedUrl?: string;
}

export interface ProviderMeta {
  id: ProviderId;
  label: string;
  baseUrl: string;
  watchCategory?: "sub" | "dub" | "raw";
}

export interface ProviderResult<T> {
  provider: ProviderMeta;
  data: T;
}

export interface HomeFeed {
  recent: AnimeSummary[];
  trending: AnimeSummary[];
  spotlight: AnimeSummary[];
}

export interface SearchFilters {
  q: string;
  page?: number;
  type?: string;
  status?: string;
  language?: "sub" | "dub";
}

export interface SearchPayload {
  results: AnimeSummary[];
  featured: AnimeSummary[];
  totalPages?: number;
  currentPage?: number;
}
