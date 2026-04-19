import { AnimeCard } from "@/components/anime-card";
import { ProviderBadge } from "@/components/provider-badge";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { searchAnime } from "@/lib/api";
import { Pagination } from "@/components/pagination";

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const page = Number(searchParams.page ?? "1");

  if (!query) {
    return (
      <main className="page-shell space-y-8">
        <section className="space-y-4 rounded-3xl border border-blue-900/20 bg-[#1a1f2e]/30 p-8">
          <Badge variant="muted" className="bg-blue-600/20 text-blue-400">Search</Badge>
          <SectionHeader
            eyebrow="Discover"
            title="Find a series, movie, or the next episode to queue"
            description="Use the search bar in the navigation header to start exploring."
          />
        </section>
      </main>
    );
  }

  try {
    const { provider, data } = await searchAnime({ q: query, page });

    return (
      <main className="page-shell space-y-8">
        <ProviderBadge label={provider.label} />
        <section className="space-y-4 rounded-3xl border border-blue-900/20 bg-[#1a1f2e]/30 p-8">
          <Badge variant="muted" className="bg-blue-600/20 text-blue-400">Results</Badge>
          <SectionHeader
            eyebrow="Search"
            title={`Results for "${query}"`}
            description={`Found ${data.results.length} items on page ${page} from the current source.`}
          />
        </section>
        
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {data.results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </section>

        <Pagination currentPage={data.currentPage || 1} totalPages={data.totalPages || 1} query={query} />
      </main>
    );
  } catch (error) {
    return (
      <main className="page-shell space-y-8">
        <section className="space-y-4 rounded-3xl border border-red-900/20 bg-red-900/10 p-8">
          <Badge variant="destructive" className="bg-red-600/20 text-red-400">Search Unavailable</Badge>
          <SectionHeader
            eyebrow="Error"
            title={`Search is temporarily unavailable for "${query}"`}
            description="Every configured provider failed during this request."
          />
          <p className="text-xs text-red-300/80">{(error as Error).message}</p>
        </section>
      </main>
    );
  }
}
