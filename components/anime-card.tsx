import Link from "next/link";
import { Star } from "lucide-react";

import { AnimeSummary } from "../lib/types";
import { formatEpisodeLabel } from "../lib/utils";

export function AnimeCard({ anime }: { anime: AnimeSummary }) {
  // Use 'anime.subCount' fallback if episodeCount is missing. (In some versions of types it might exist)
  const eps = anime.episodeCount ?? (anime as any).subCount;

  return (
    <Link
      href={`/anime/${encodeURIComponent(anime.id)}`}
      className="group relative block overflow-hidden rounded-xl border border-white/5 bg-[#1a1f2e] transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] aspect-[2/3]"
    >
      <img
        src={anime.image}
        alt={anime.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent opacity-90 transition duration-300 group-hover:opacity-100" />
      
      {/* Top Left Badge: Episode */}
      <div className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
        {formatEpisodeLabel(eps)}
      </div>

      {/* Top Right Badge: Score */}
      <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
        {anime.rating ?? "N/A"}
      </div>

      {/* Bottom Title */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white drop-shadow-md transition-colors group-hover:text-blue-400">
          {anime.title}
        </h3>
      </div>
    </Link>
  );
}
