import { AnimeCard } from "@/components/anime-card";
import { ProviderBadge } from "@/components/provider-badge";
import { SearchBar } from "@/components/search-bar";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { searchAnime } from "@/lib/api";

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q?.trim() ?? "";

  if (!query) {
    return (
      <main className="page-shell space-y-8">
        <section className="space-y-4 rounded-[2.5rem] border border-white/5 bg-white/[0.03] p-8">
          <Badge variant="muted">Search</Badge>
          <SectionHeader
            eyebrow="Discover"
            title="Find a series, movie, or the next episode to queue"
            description="Search results become filter-ready as soon as a provider answers."
          />
          <div className="max-w-2xl">
            <SearchBar initialQuery={query} />
          </div>
        </section>
      </main>
    );
  }

  try {
    const { provider, data } = await searchAnime({ q: query, page: Number(searchParams.page ?? "1") });

    return (
      <main className="page-shell space-y-8">
        <ProviderBadge label={provider.label} />
        <section className="space-y-4 rounded-[2.5rem] border border-white/5 bg-white/[0.03] p-8">
          <Badge variant="muted">Results</Badge>
          <SectionHeader
            eyebrow="Search"
            title={`Results for "${query}"`}
            description={`${data.results.length} anime cards returned from the current source.`}
          />
          <div className="max-w-2xl">
            <SearchBar initialQuery={query} />
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="page-shell space-y-8">
        <section className="space-y-4 rounded-[2.5rem] border border-amber-400/20 bg-amber-400/10 p-8">
          <Badge variant="muted">Search Unavailable</Badge>
          <SectionHeader
            eyebrow="Search"
            title={`Search is temporarily unavailable for "${query}"`}
            description="Every configured provider failed during this request."
          />
          <div className="max-w-2xl">
            <SearchBar initialQuery={query} />
          </div>
          <p className="text-xs text-amber-100/80">{(error as Error).message}</p>
        </section>
      </main>
    );
  }
}
