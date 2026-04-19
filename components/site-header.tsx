import Link from "next/link";
import { Search } from "lucide-react";

import { SearchBar } from "@/components/search-bar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-400 to-sky-400 text-lg font-black text-zinc-950">
            A
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Anime Streaming</p>
            <h1 className="text-xl font-semibold text-white">AnimeWatch Hymn</h1>
          </div>
        </Link>
        <div className="hidden w-full max-w-xl lg:block">
          <SearchBar />
        </div>
        <Link
          href="/search"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-100 lg:hidden"
        >
          <Search className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
