import { AnimeCard } from "@/components/anime-card";
import { Suspense } from "react";
import { ContinueWatching } from "@/components/continue-watching";
import { ProviderBadge } from "@/components/provider-badge";
import { getHomeFeed, getTopAiringAnime } from "@/lib/api";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function HomePage() {
  try {
    const [{ provider, data: homeData }, { data: topData }] = await Promise.all([
      getHomeFeed(),
      getTopAiringAnime()
    ]);

    return (
      <main className="page-shell space-y-12">
        <ProviderBadge label={provider.label} />
        
        <Suspense fallback={<div className="h-48 w-full rounded-2xl bg-[#1a1f2e] animate-pulse" />}>
          <ContinueWatching />
        </Suspense>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-4">
            <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-3">On-Going Anime</h2>
            <Link href="/search" className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {homeData.recent.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-4">
            <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-3">Anime Populer</h2>
            <Link href="/search" className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {topData.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="page-shell space-y-8">
        <section className="rounded-3xl border border-red-900/20 bg-red-900/10 p-8">
          <h1 className="text-2xl font-bold text-red-400">Gagal memuat beranda</h1>
          <p className="mt-4 max-w-3xl text-sm text-zinc-300">
            Terjadi masalah saat mencoba menghubungi API Jikan. Silakan refresh halaman ini.
          </p>
          <p className="mt-4 text-xs text-zinc-500">{(error as Error).message}</p>
        </section>
      </main>
    );
  }
}
