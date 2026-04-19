import Link from "next/link";

import { Episode } from "@/lib/types";

export function EpisodeList({
  animeId,
  episodes,
  activeEpisodeId
}: {
  animeId?: string;
  episodes: Episode[];
  activeEpisodeId?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {episodes.map((episode) => {
        const active = episode.id === activeEpisodeId;
        return (
          <Link
            key={episode.id}
            href={`/watch/${encodeURIComponent(episode.id)}${animeId ? `?animeId=${encodeURIComponent(animeId)}` : ""}`}
            className={[
              "rounded-3xl border p-4 transition",
              active
                ? "border-pink-400/30 bg-pink-400/10 text-white"
                : "border-white/5 bg-white/[0.03] text-zinc-200 hover:border-sky-400/20 hover:bg-white/[0.06]"
            ].join(" ")}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Episode {episode.number || "?"}</p>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold">{episode.title}</h3>
            {episode.isFiller ? <p className="mt-2 text-xs text-amber-300">Filler episode</p> : null}
          </Link>
        );
      })}
    </div>
  );
}
