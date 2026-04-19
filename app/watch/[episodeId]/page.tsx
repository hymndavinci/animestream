import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EpisodeList } from "../../../components/episode-list";
import { ProviderBadge } from "../../../components/provider-badge";
import { VideoPlayer } from "../../../components/video-player";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { getAnimeDetails, getWatchPayload } from "../../../lib/api";
import type { ProviderMeta, ProviderResult, WatchPayload, AnimeDetails } from "@/lib/types";

export default async function WatchPage({
  params,
  searchParams
}: {
  params: { episodeId: string };
  searchParams: { animeId?: string };
}) {
  const episodeId = decodeURIComponent(params.episodeId);
  const animeId = searchParams.animeId ? decodeURIComponent(searchParams.animeId) : undefined;

  // Attempt to load watch payload and anime details; fall back to demo stream if providers fail
  let watchResult: ProviderResult<WatchPayload> | null = null;
  try {
    watchResult = await getWatchPayload(episodeId, animeId);
  } catch {}

  let animeDetails: ProviderResult<AnimeDetails> | null = null;
  if (animeId) {
    try {
      animeDetails = await getAnimeDetails(animeId);
    } catch {}
  }

  const provider = watchResult?.provider ?? { label: 'Fallback' } as ProviderMeta;
  const data = watchResult?.data ?? {
    title: 'Demo Stream',
    image: 'https://placehold.co/800x450/0f1720/ffffff?text=Demo',
    streamingLinks: [{ url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", quality: "720p", isM3U8: true }],
    episodeId,
    episodeNumber: 1
  } as WatchPayload;

  const title = (animeDetails?.data?.title && data.episodeNumber 
    ? `${animeDetails.data.title} - Episode ${data.episodeNumber}` 
    : data.title) as string;

  return (
    <main className="page-shell space-y-8">
      <ProviderBadge label={provider.label} />
      <div className="flex justify-between gap-4">
        <Link href={animeId ? `/anime/${encodeURIComponent(animeId)}` : "/"}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
      <VideoPlayer
        title={title}
        poster={animeDetails?.data?.image ?? data.image}
        links={data.streamingLinks}
        animeId={animeId}
        episodeId={episodeId}
        episodeNumber={data.episodeNumber}
        providerLabel={provider.label}
        embedUrl={data.embedUrl}
      />
      {animeDetails?.data?.episodes?.length ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Queue</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Episode navigation</h2>
          </div>
          <EpisodeList
            animeId={animeDetails.data.id}
            episodes={animeDetails.data.episodes}
            activeEpisodeId={episodeId}
          />
        </section>
      ) : null}
    </main>
  );
}
