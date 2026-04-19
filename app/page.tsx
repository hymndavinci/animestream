import { AnimeCard } from "@/components/anime-card";
import { Suspense } from "react";
import { ContinueWatching } from "@/components/continue-watching";
import { ProviderBadge } from "@/components/provider-badge";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { getHomeFeed } from "@/lib/api";

export default async function HomePage() {
  try {
    const { provider, data } = await getHomeFeed();

    return (
      <main className="page-shell space-y-10">
        <ProviderBadge label={provider.label} />
        <section className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-hero-grid p-6 shadow-glow sm:p-10">
          <div className="max-w-3xl space-y-5">
            <Badge>Auto Fallback Streaming</Badge>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Watch anime with a resilient multi-provider frontend.
            </h1>
            <p className="max-w-2xl text-sm text-zinc-300 sm:text-base">
              The app probes your preferred APIs in order, remembers the last healthy source in local storage,
              and cools failed providers down for five minutes before retrying them.
            </p>
          </div>
        </section>
<Suspense fallback={<div className="h-48 w-full rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800" />}>
  <ContinueWatching />
</Suspense>
        <section className="space-y-5">
          <SectionHeader
            eyebrow="Recent"
            title="Latest episode drops"
            description="Fresh additions from the currently active provider."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.recent.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>
        <section className="space-y-5">
          <SectionHeader
            eyebrow="Trending"
            title="What people are clicking now"
            description="A scrolling-worthy grid pulled from whichever provider responded first."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.trending.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="page-shell space-y-8">
        <section className="rounded-[2.5rem] border border-amber-400/20 bg-amber-400/10 p-8">
          <Badge variant="muted">Provider Status</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-white">All configured APIs are currently unavailable.</h1>
          <p className="mt-4 max-w-3xl text-sm text-amber-50/90">
            The fallback system is working, but every provider in the priority list failed from this environment.
            The UI is still ready, and it will start rendering live data as soon as one of those APIs recovers.
          </p>
          <p className="mt-4 text-xs text-amber-100/80">{(error as Error).message}</p>
        </section>
      </main>
    );
  }
}
