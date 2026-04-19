import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  currentPage,
  totalPages,
  query,
}: {
  currentPage: number;
  totalPages: number;
  query: string;
}) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    return `/search?q=${encodeURIComponent(query)}&page=${page}`;
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-12 mb-4">
      <Link
        href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-[#1a1f2e] text-zinc-300 transition hover:bg-blue-600 hover:text-white ${
          currentPage <= 1 ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-200">
          Page <span className="text-blue-400">{currentPage}</span> of {totalPages}
        </span>
      </div>

      <Link
        href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-[#1a1f2e] text-zinc-300 transition hover:bg-blue-600 hover:text-white ${
          currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
