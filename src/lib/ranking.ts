/**
 * Multi-factor ranking algorithm for OnlyFans creators.
 *
 * Overall formula (weights sum to 1.0):
 *   overall = (review_score × 0.30) + (sexy_score × 0.25) + (authenticity_score × 0.45)
 *
 * Authenticity is the primary differentiator — it detects human vs bot/AI interaction
 * patterns from stored signals (simulated in this demo; not live API integration).
 */

import type {
  AuthenticitySignals,
  CreatorWithDetails,
  RankedCreator,
  RankingFilters,
  Review,
  Scores,
} from "./types";

export const WEIGHTS = {
  review: 0.3,
  sexy: 0.25,
  authenticity: 0.45,
} as const;

export const AUTHENTICITY_THRESHOLDS = {
  humanVerified: 80,
  medium: 50,
} as const;

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

/** Scale average 1–5 star rating to 0–100. */
export function reviewScoreFromRatings(reviews: Review[]): number {
  if (reviews.length === 0) return 50;
  const avg =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return clamp(((avg - 1) / 4) * 100);
}

/**
 * Score response timing: humans reply in minutes–hours with natural variance.
 * Instant (<5s) or perfectly uniform timing suggests automation.
 */
function scoreResponseTiming(
  avgSeconds: number,
  consistency: number
): number {
  let score = 50;

  if (avgSeconds < 5) {
    score -= 35;
  } else if (avgSeconds < 30) {
    score -= 15;
  } else if (avgSeconds >= 120 && avgSeconds <= 7200) {
    score += 25;
  } else if (avgSeconds > 7200) {
    score += 10;
  }

  // consistency 0–100: higher = more bot-like uniformity
  score += (100 - consistency) * 0.35;
  return clamp(score);
}

/** Penalize generic/template patterns encoded in AI detection flags. */
function scoreAiFlags(flagsJson: string): number {
  let flags: string[] = [];
  try {
    flags = JSON.parse(flagsJson) as string[];
  } catch {
    return 70;
  }

  const penalties: Record<string, number> = {
    instant_response: 18,
    generic_template: 15,
    always_online: 12,
    perfect_grammar: 10,
    identical_patterns: 14,
    no_sleep_pattern: 10,
    copy_paste_detected: 16,
  };

  let score = 100;
  for (const flag of flags) {
    score -= penalties[flag] ?? 8;
  }
  return clamp(score);
}

/**
 * Calculate Human Authenticity Score (0–100) from behavioral signals.
 *
 * Human indicators (rewarded):
 *   - Variable response times, personalized messages, natural typos/casual tone,
 *     clear offline periods, unique voice, community verification.
 *
 * Bot/AI indicators (penalized via flags and low-variance metrics):
 *   - Instant replies, templates, 24/7 availability, perfect grammar, identical patterns.
 */
export function calculateAuthenticityScore(
  signals: AuthenticitySignals
): number {
  const timingScore = scoreResponseTiming(
    signals.response_time_avg,
    signals.response_consistency
  );
  const personalizationScore = clamp(signals.message_personalization_score);
  const aiFlagScore = scoreAiFlags(signals.ai_detection_flags);
  const verifiedBonus = signals.human_verified ? 8 : 0;

  const raw =
    timingScore * 0.28 +
    personalizationScore * 0.32 +
    aiFlagScore * 0.25 +
    (100 - signals.response_consistency) * 0.15 +
    verifiedBonus;

  return clamp(Math.round(raw * 10) / 10);
}

/** Compute sexy score (0–100) — in demo data this is pre-seeded; extensible for ML later. */
export function normalizeSexyScore(value: number): number {
  return clamp(value);
}

/** Apply weighted formula to produce overall rank score. */
export function calculateOverallScore(scores: {
  review_score: number;
  sexy_score: number;
  authenticity_score: number;
}): number {
  const overall =
    scores.review_score * WEIGHTS.review +
    scores.sexy_score * WEIGHTS.sexy +
    scores.authenticity_score * WEIGHTS.authenticity;

  return clamp(Math.round(overall * 10) / 10);
}

/** Recalculate all score fields for a creator from reviews + authenticity signals. */
export function buildScores(
  creatorId: number,
  reviews: Review[],
  signals: AuthenticitySignals,
  sexyScore: number
): Scores {
  const review_score = reviewScoreFromRatings(reviews);
  const authenticity_score = calculateAuthenticityScore(signals);
  const sexy_score = normalizeSexyScore(sexyScore);
  const overall_rank_score = calculateOverallScore({
    review_score,
    sexy_score,
    authenticity_score,
  });

  return {
    creator_id: creatorId,
    review_score,
    sexy_score,
    authenticity_score,
    overall_rank_score,
    last_calculated: new Date().toISOString(),
  };
}

export function getAuthenticityTier(score: number): "high" | "medium" | "low" {
  if (score >= AUTHENTICITY_THRESHOLDS.humanVerified) return "high";
  if (score >= AUTHENTICITY_THRESHOLDS.medium) return "medium";
  return "low";
}

export function getAuthenticityLabel(score: number): string {
  const tier = getAuthenticityTier(score);
  if (tier === "high") return "Human Verified";
  if (tier === "medium") return "Likely Human";
  return "Authenticity Concerns";
}

export function getAuthenticityInsights(
  signals: AuthenticitySignals,
  score: number
): { positive: string[]; concerns: string[] } {
  const positive: string[] = [];
  const concerns: string[] = [];
  let flags: string[] = [];

  try {
    flags = JSON.parse(signals.ai_detection_flags) as string[];
  } catch {
    flags = [];
  }

  if (signals.response_time_avg >= 120) {
    positive.push("Response times show natural human delay (minutes to hours).");
  } else if (signals.response_time_avg < 5) {
    concerns.push("Near-instant replies suggest automated responses.");
  }

  if (signals.message_personalization_score >= 75) {
    positive.push("Messages reference subscriber history and feel personalized.");
  } else if (signals.message_personalization_score < 40) {
    concerns.push("Responses appear generic or template-like.");
  }

  if (signals.response_consistency < 40) {
    positive.push("Response timing varies naturally — typical of a real person.");
  } else if (signals.response_consistency > 75) {
    concerns.push("Unusually consistent response patterns detected.");
  }

  if (signals.human_verified) {
    positive.push("Community-verified as interacting directly with subscribers.");
  }

  const flagMessages: Record<string, string> = {
    instant_response: "Consistently instant replies (<5 seconds).",
    generic_template: "Generic or copy-paste template responses detected.",
    always_online: "24/7 availability with no offline periods.",
    perfect_grammar: "Perfect grammar in every message — unusual for casual DMs.",
    identical_patterns: "Identical response structures across conversations.",
    no_sleep_pattern: "Activity shows no sleep or rest periods.",
    copy_paste_detected: "Duplicate messages sent to multiple subscribers.",
  };

  for (const flag of flags) {
    concerns.push(flagMessages[flag] ?? `AI signal detected: ${flag}`);
  }

  if (score >= 80 && positive.length === 0) {
    positive.push("Strong overall authenticity profile across all signals.");
  }

  return { positive, concerns };
}

export function sortCreators(
  creators: CreatorWithDetails[],
  sortBy: RankingFilters["sortBy"] = "overall"
): CreatorWithDetails[] {
  const keyMap = {
    overall: (c: CreatorWithDetails) => c.scores.overall_rank_score,
    authenticity: (c: CreatorWithDetails) => c.scores.authenticity_score,
    reviews: (c: CreatorWithDetails) => c.scores.review_score,
    sexy: (c: CreatorWithDetails) => c.scores.sexy_score,
  };

  const getter = keyMap[sortBy ?? "overall"];
  return [...creators].sort((a, b) => getter(b) - getter(a));
}

export function filterCreators(
  creators: CreatorWithDetails[],
  filters: RankingFilters
): CreatorWithDetails[] {
  return creators.filter((creator) => {
    if (filters.language && creator.language !== filters.language) return false;
    if (
      filters.minAuthenticity !== undefined &&
      creator.scores.authenticity_score < filters.minAuthenticity
    ) {
      return false;
    }
    if (
      filters.minPrice !== undefined &&
      creator.subscription_price < filters.minPrice
    ) {
      return false;
    }
    if (
      filters.maxPrice !== undefined &&
      creator.subscription_price > filters.maxPrice
    ) {
      return false;
    }
    return true;
  });
}

export function rankCreators(
  creators: CreatorWithDetails[],
  filters: RankingFilters = {}
): RankedCreator[] {
  const filtered = filterCreators(creators, filters);
  const sorted = sortCreators(filtered, filters.sortBy);
  return sorted.map((creator, index) => ({ ...creator, rank: index + 1 }));
}

export function getLanguages(creators: CreatorWithDetails[]): string[] {
  return Array.from(new Set(creators.map((c) => c.language))).sort();
}

export function getPlatformStats(creators: CreatorWithDetails[]) {
  const avgAuthenticity =
    creators.length === 0
      ? 0
      : creators.reduce((sum, c) => sum + c.scores.authenticity_score, 0) /
        creators.length;

  return {
    totalCreators: creators.length,
    avgAuthenticity: Math.round(avgAuthenticity * 10) / 10,
    languages: getLanguages(creators),
    humanVerifiedCount: creators.filter(
      (c) => c.scores.authenticity_score >= AUTHENTICITY_THRESHOLDS.humanVerified
    ).length,
  };
}
