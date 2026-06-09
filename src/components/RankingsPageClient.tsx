"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import CreatorsGrid from "@/components/CreatorsGrid";
import RankingsFilters from "@/components/RankingsFilters";
import { getLanguages, rankCreators } from "@/lib/ranking";
import type { CreatorWithDetails, RankingFilters } from "@/lib/types";

type RankingsPageClientProps = {
  allCreators: CreatorWithDetails[];
};

function parseFilters(searchParams: URLSearchParams): RankingFilters {
  const sortValues = ["overall", "authenticity", "reviews", "sexy"] as const;
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
  const languages = getLanguages(allCreators);
  const ranked = rankCreators(allCreators, filters);

  return (
    <>
      <RankingsFilters languages={languages} filters={filters} />
      <p className="text-sm text-white/50">
        Showing {ranked.length} of {allCreators.length} creators
      </p>
      <CreatorsGrid creators={ranked} />
    </>
  );
}
