"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ContinueWatchingItem, readContinueWatching } from "@/lib/watch-history";

export function ContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    setItems(readContinueWatching().slice(0, 6));
  }, []);

  if (!items.length) return null;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Resume</p>
        <h2 className="text-2xl font-semibold text-white">Continue watching</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.episodeId}
            href={`/watch/${encodeURIComponent(item.episodeId)}${item.animeId ? `?animeId=${encodeURIComponent(item.animeId)}` : ""}`}
            className="flex gap-4 rounded-[1.75rem] border border-white/5 bg-white/[0.03] p-4 transition hover:border-sky-400/20 hover:bg-white/[0.06]"
          >
            <img src={item.image} alt={item.title} className="h-24 w-16 rounded-2xl object-cover" />
            <div className="min-w-0">
              <p className="line-clamp-2 font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm text-zinc-400">Episode {item.episodeNumber ?? "?"}</p>
              {item.providerLabel ? <p className="mt-1 text-xs text-zinc-500">{item.providerLabel}</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
