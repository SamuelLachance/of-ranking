"use client";

import { Filter, Globe } from "lucide-react";
import { TIER_LABELS } from "@/lib/ranking";
import type { AuthenticityTier, RankingFilters } from "@/lib/types";

type RankingsFiltersProps = {
  languages: string[];
  filters: RankingFilters;
};

const TIER_OPTIONS: AuthenticityTier[] = [
  "verified_human",
  "likely_human",
  "uncertain",
  "likely_managed",
  "bot_risk",
];

export default function RankingsFilters({
  languages,
  filters,
}: RankingsFiltersProps) {
  return (
    <form
      method="get"
      className="glass-card grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-7"
    >
      <div className="space-y-1.5">
        <label htmlFor="language" className="text-xs uppercase tracking-widest text-white/50">
          Language
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <Globe className="h-4 w-4 shrink-0 text-purple-300" />
          <select
            id="language"
            name="language"
            defaultValue={filters.language ?? ""}
            className="w-full bg-transparent text-sm text-white outline-none"
          >
            <option value="">All languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="authenticityTier" className="text-xs uppercase tracking-widest text-white/50">
          Authenticity Tier
        </label>
        <select
          id="authenticityTier"
          name="authenticityTier"
          defaultValue={filters.authenticityTier ?? ""}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="">All tiers</option>
          {TIER_OPTIONS.map((tier) => (
            <option key={tier} value={tier}>
              {TIER_LABELS[tier]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="minAuthenticity" className="text-xs uppercase tracking-widest text-white/50">
          Min Authenticity
        </label>
        <input
          id="minAuthenticity"
          name="minAuthenticity"
          type="range"
          min={0}
          max={100}
          step={5}
          defaultValue={filters.minAuthenticity ?? 0}
          className="w-full accent-purple-500"
        />
        <p className="text-xs text-white/40">
          {filters.minAuthenticity ?? 0}% minimum
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="minPrice" className="text-xs uppercase tracking-widest text-white/50">
          Min Price ($)
        </label>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          min={0}
          step={0.5}
          defaultValue={filters.minPrice ?? ""}
          placeholder="0"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="maxPrice" className="text-xs uppercase tracking-widest text-white/50">
          Max Price ($)
        </label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min={0}
          step={0.5}
          defaultValue={filters.maxPrice ?? ""}
          placeholder="Any"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="minNude" className="text-xs uppercase tracking-widest text-white/50">
          Min Content Openness
        </label>
        <input
          id="minNude"
          name="minNude"
          type="range"
          min={0}
          max={100}
          step={5}
          defaultValue={filters.minNude ?? 0}
          className="w-full accent-fuchsia-500"
        />
        <p className="text-xs text-white/40">
          {filters.minNude ?? 0}% minimum
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sortBy" className="text-xs uppercase tracking-widest text-white/50">
          Sort By
        </label>
        <select
          id="sortBy"
          name="sortBy"
          defaultValue={filters.sortBy ?? "overall"}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="overall">Overall Rank</option>
          <option value="authenticity">Authenticity Score</option>
          <option value="authenticity_confidence">Authenticity Confidence</option>
          <option value="reviews">Reviews</option>
          <option value="sexy">Sexy Score</option>
          <option value="nude">Content Openness</option>
        </select>
      </div>

      <div className="flex items-end lg:col-span-7">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Filter className="h-4 w-4" />
          Apply Filters
        </button>
      </div>
    </form>
  );
}
