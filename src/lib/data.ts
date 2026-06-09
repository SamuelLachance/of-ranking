import creatorsBundle from "../../data/creators.json";
import { getPlatformStats as computePlatformStats, rankCreators } from "./ranking";
import type {
  CreatorWithDetails,
  PlatformStats,
  RankingFilters,
  RankedCreator,
} from "./types";

const creators = creatorsBundle.creators as CreatorWithDetails[];

export const DATA_DISCLAIMER = creatorsBundle.disclaimer;
export const DATA_GENERATED_AT = creatorsBundle.generated_at;

export function getAllCreatorsWithDetails(): CreatorWithDetails[] {
  return creators;
}

export function getCreatorById(id: number): CreatorWithDetails | null {
  return creators.find((c) => c.id === id) ?? null;
}

export function getRankedCreators(filters: RankingFilters = {}): RankedCreator[] {
  return rankCreators(creators, filters);
}

export function getPlatformStats(): PlatformStats {
  return computePlatformStats(creators);
}
