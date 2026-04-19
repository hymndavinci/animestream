import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EpisodeList } from "@/components/episode-list";
import { ProviderBadge } from "@/components/provider-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAnimeDetails } from "@/lib/api";

export default async function AnimeDetailPage({ params }: { params: { id: string } }) {
  try {
    const { provider, data } = await getAnimeDetails(decodeURIComponent(params.id));
    const firstEpisode = data.episodes[0];

    return (
      <main className="page-shell space-y-8">
        <ProviderBadge label={provider.label} />
        <section className="grid gap-8 rounded-[2.5rem] border border-white/5 bg-white/[0.03] p-6 lg:grid-cols-[320px,1fr] lg:p-8">
          <img
            src={data.image}
            alt={data.title}
            className="aspect-[3/4] w-full rounded-[2rem] object-cover shadow-glow"
          />
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge>{data.type ?? "TV"}</Badge>
              {data.status ? <Badge variant="secondary">{data.status}</Badge> : null}
              {data.releaseDate ? <Badge variant="muted">{data.releaseDate}</Badge> : null}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Anime Detail</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">{data.title}</h1>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
              {data.synopsis ?? "This provider did not return a synopsis for the selected anime."}
            </p>
            <div className="flex flex-wrap gap-2">
              {data.genres.map((genre) => (
                <Badge key={genre} variant="muted">
                  {genre}
                </Badge>
              ))}
            </div>
            {firstEpisode ? (
              <Link href={`/watch/${encodeURIComponent(firstEpisode.id)}?animeId=${encodeURIComponent(data.id)}`}>
                <Button size="lg" className="gap-2">
                  Start watching
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
          </div>
        </section>
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Episodes</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Browse the full episode list</h2>
          </div>
          <EpisodeList animeId={data.id} episodes={data.episodes} />
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="page-shell">
        <section className="rounded-[2.5rem] border border-amber-400/20 bg-amber-400/10 p-8">
          <Badge variant="muted">Anime Unavailable</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-white">This anime could not be loaded right now.</h1>
          <p className="mt-4 text-sm text-amber-100/90">{(error as Error).message}</p>
        </section>
      </main>
    );
  }
}
