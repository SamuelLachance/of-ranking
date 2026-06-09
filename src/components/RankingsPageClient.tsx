"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import CreatorsGrid from "@/components/CreatorsGrid";
import RankingsFilters from "@/components/RankingsFilters";
import { getLanguages, rankCreators } from "@/lib/ranking";
import type { CreatorWithDetails, RankingFilters } from "@/lib/types";

const PAGE_SIZE = 24;

type RankingsPageClientProps = {
  allCreators: CreatorWithDetails[];
};

function parseFilters(searchParams: URLSearchParams): RankingFilters {
  const sortValues = [
    "overall",
    "authenticity",
    "authenticity_confidence",
    "reviews",
    "sexy",
    "nude",
  ] as const;
  const sortParam = searchParams.get("sortBy");
  const sortBy = sortValues.includes(sortParam as (typeof sortValues)[number])
    ? (sortParam as RankingFilters["sortBy"])
    : "overall";

  return {
    language: searchParams.get("language") || undefined,
    minAuthenticity: searchParams.get("minAuthenticity")
      ? Number(searchParams.get("minAuthenticity"))
      : undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    minNude: searchParams.get("minNude")
      ? Number(searchParams.get("minNude"))
      : undefined,
    sortBy,
  };
}

export default function RankingsPageClient({
  allCreators,
}: RankingsPageClientProps) {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseFilters(searchParams),
    [searchParams]
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const languages = getLanguages(allCreators);
  const ranked = rankCreators(allCreators, filters);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
    );
  }, [ranked, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <>
      <RankingsFilters languages={languages} filters={filters} />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name or @username…"
          aria-label="Search creators"
          className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-purple-500/50"
        />
      </div>

      <p className="text-sm text-white/50">
        Showing {paged.length} of {filtered.length} creators
        {filtered.length !== allCreators.length &&
          ` (filtered from ${allCreators.length})`}
        {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
      </p>

      <CreatorsGrid creators={paged} />

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm text-white/50">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
