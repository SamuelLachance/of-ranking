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

const SORT_VALUES = [
  "overall",
  "authenticity",
  "authenticity_confidence",
  "reviews",
  "sexy",
] as const;

const TIER_VALUES = [
  "verified_human",
  "likely_human",
  "uncertain",
  "likely_managed",
  "bot_risk",
] as const;

function parseFilters(searchParams: URLSearchParams): RankingFilters {
  const sortParam = searchParams.get("sortBy");
  const sortBy = SORT_VALUES.includes(sortParam as (typeof SORT_VALUES)[number])
    ? (sortParam as RankingFilters["sortBy"])
    : "overall";

  const tierParam = searchParams.get("authenticityTier");
  const authenticityTier = TIER_VALUES.includes(
    tierParam as (typeof TIER_VALUES)[number]
  )
    ? (tierParam as RankingFilters["authenticityTier"])
    : undefined;

  return {
    language: searchParams.get("language") || undefined,
    authenticityTier,
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
