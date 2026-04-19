"use client";

export interface ContinueWatchingItem {
  animeId?: string;
  episodeId: string;
  title: string;
  image: string;
  episodeNumber?: number;
  providerLabel?: string;
  updatedAt: number;
}

const STORAGE_KEY = "animewatch-continue-watching";

export function readContinueWatching(): ContinueWatchingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ContinueWatchingItem[];
    return Array.isArray(items) ? items.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

export function saveContinueWatching(item: ContinueWatchingItem) {
  if (typeof window === "undefined") return;
  const current = readContinueWatching().filter((entry) => entry.episodeId !== item.episodeId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...current].slice(0, 24)));
}
