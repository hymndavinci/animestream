import Link from "next/link";
import { Search } from "lucide-react";

import { SearchBar } from "@/components/search-bar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-blue-900/20 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            A
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Anime<span className="text-blue-500">Watch</span>
            </h1>
          </div>
        </Link>
        <div className="flex w-full flex-1 justify-center max-w-2xl">
          <div className="w-full hidden lg:block">
            <SearchBar />
          </div>
        </div>
        <Link
          href="/search"
          className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 lg:hidden transition hover:bg-blue-500/20"
        >
          <Search className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
