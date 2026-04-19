import Link from "next/link";
import { Play, Star } from "lucide-react";

import { AnimeSummary } from "../lib/types";
import { formatEpisodeLabel } from "../lib/utils";

export function AnimeCard({ anime }: { anime: AnimeSummary }) {
  return (
    <Link
      href={`/anime/${encodeURIComponent(anime.id)}`}
      className="group overflow-hidden rounded-[1.75rem] border border-white/5 bg-white/[0.03] transition hover:-translate-y-1 hover:border-pink-400/20 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={anime.image}
          alt={anime.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/5 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-zinc-950/70 px-3 py-1 text-xs text-zinc-200">
            {anime.type ?? "TV"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/70 px-3 py-1 text-xs text-zinc-200">
            <Star className="h-3.5 w-3.5 text-amber-300" />
            {anime.rating ?? "HD"}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-400/10 px-3 py-1 text-xs font-medium text-pink-100">
          <Play className="h-3.5 w-3.5" />
          {formatEpisodeLabel(anime.episodeCount ?? anime.subCount)}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-white">{anime.title}</h3>
        <p className="line-clamp-2 text-sm text-zinc-400">
          {anime.description ?? "Open the detail page to browse episodes and start watching."}
        </p>
      </div>
    </Link>
  );
}
