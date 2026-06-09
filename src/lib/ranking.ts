/**
 * Multi-factor ranking algorithm for OnlyFans creators.
 *
 * Overall formula (weights sum to 1.0):
 *   overall = (review_score × 0.30) + (sexy_score × 0.25) + (authenticity_score × 0.45)
 *
 * Authenticity uses a five-dimension model derived from public research signals.
 * Scores are editorial estimates — not verified DM audits.
 */

import type {
  AuthenticityDimensionScores,
  AuthenticitySignals,
  AuthenticityTier,
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

/** Dimension weights within the authenticity composite (sum to 1.0). */
export const AUTHENTICITY_DIMENSION_WEIGHTS = {
  direct_engagement: 0.25,
  agency_risk_inverted: 0.25,
  activity_pattern: 0.2,
  voice_consistency: 0.15,
  scale_penalty_inverted: 0.15,
} as const;

export const AUTHENTICITY_TIER_THRESHOLDS = {
  verified_human: 80,
  likely_human: 60,
  uncertain: 40,
  likely_managed: 20,
} as const;

/** @deprecated Use AUTHENTICITY_TIER_THRESHOLDS */
export const AUTHENTICITY_THRESHOLDS = {
  humanVerified: AUTHENTICITY_TIER_THRESHOLDS.verified_human,
  medium: AUTHENTICITY_TIER_THRESHOLDS.uncertain,
} as const;

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Scale average 1–5 star rating to 0–100. */
export function reviewScoreFromRatings(reviews: Review[]): number {
  if (reviews.length === 0) return 50;
  const avg =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return clamp(((avg - 1) / 4) * 100);
}

export function getAuthenticityTierFromScore(
  score: number
): AuthenticityTier {
  if (score >= AUTHENTICITY_TIER_THRESHOLDS.verified_human)
    return "verified_human";
  if (score >= AUTHENTICITY_TIER_THRESHOLDS.likely_human) return "likely_human";
  if (score >= AUTHENTICITY_TIER_THRESHOLDS.uncertain) return "uncertain";
  if (score >= AUTHENTICITY_TIER_THRESHOLDS.likely_managed)
    return "likely_managed";
  return "bot_risk";
}

/** Penalize conflicting dimension signals — reduces confidence. */
function signalDisagreementPenalty(dimensions: AuthenticityDimensionScores): number {
  const humanSignals = [
    dimensions.direct_engagement_score,
    dimensions.activity_pattern_score,
    dimensions.voice_consistency_score,
    100 - dimensions.agency_risk_score,
    100 - dimensions.scale_penalty_score,
  ];
  const spread = Math.max(...humanSignals) - Math.min(...humanSignals);
  if (spread > 50) return 18;
  if (spread > 35) return 10;
  if (spread > 25) return 5;
  return 0;
}

/** Bayesian-style confidence margin for display (± points). */
export function getConfidenceMargin(confidence: number): number {
  return Math.round((100 - confidence) * 0.12);
}

/**
 * Calculate Human Authenticity Score (0–100) from multi-dimensional public signals.
 */
export function calculateAuthenticityScore(
  dimensions: AuthenticityDimensionScores
): number {
  const w = AUTHENTICITY_DIMENSION_WEIGHTS;
  let raw =
    dimensions.direct_engagement_score * w.direct_engagement +
    (100 - dimensions.agency_risk_score) * w.agency_risk_inverted +
    dimensions.activity_pattern_score * w.activity_pattern +
    dimensions.voice_consistency_score * w.voice_consistency +
    (100 - dimensions.scale_penalty_score) * w.scale_penalty_inverted;

  const flagPenalty = Math.min(
    25,
    (dimensions.ai_detection_flags?.length ?? 0) * 4
  );
  raw -= flagPenalty;

  if (
    dimensions.human_verified &&
    dimensions.direct_engagement_score >= 70
  ) {
    raw += 5;
  }

  return clamp(round1(raw));
}

export function resolveAuthenticityConfidence(
  dimensions: AuthenticityDimensionScores,
  score: number
): number {
  let confidence = clamp(dimensions.confidence);
  confidence -= signalDisagreementPenalty(dimensions);

  const sourceBonus = Math.min(8, (dimensions.sources?.length ?? 0) * 2);
  confidence += sourceBonus;

  if (dimensions.human_verified && dimensions.direct_engagement_score >= 75) {
    confidence += 5;
  }

  if (score >= 80 && dimensions.agency_risk_score >= 70) {
    confidence -= 12;
  }
  if (score <= 30 && dimensions.agency_risk_score <= 30) {
    confidence -= 10;
  }

  return clamp(Math.round(confidence));
}

export function buildAuthenticityResult(
  dimensions: AuthenticityDimensionScores
): {
  score: number;
  confidence: number;
  margin: number;
  tier: AuthenticityTier;
} {
  const score = calculateAuthenticityScore(dimensions);
  const confidence = resolveAuthenticityConfidence(dimensions, score);
  const margin = getConfidenceMargin(confidence);
  const tier =
    dimensions.tier && dimensions.tier !== "uncertain"
      ? dimensions.tier
      : getAuthenticityTierFromScore(score);

  return { score, confidence, margin, tier };
}

/** Compute sexy score (0–100) — pre-seeded in demo data. */
export function normalizeSexyScore(value: number): number {
  return clamp(value);
}

export function calculateOverallScore(scores: {
  review_score: number;
  sexy_score: number;
  authenticity_score: number;
}): number {
  const overall =
    scores.review_score * WEIGHTS.review +
    scores.sexy_score * WEIGHTS.sexy +
    scores.authenticity_score * WEIGHTS.authenticity;

  return clamp(round1(overall));
}

export function buildScores(
  creatorId: number,
  reviews: Review[],
  signals: AuthenticitySignals,
  sexyScore: number
): Scores {
  const review_score = reviewScoreFromRatings(reviews);
  const { score, confidence, margin, tier } = buildAuthenticityResult(signals);
  const sexy_score = normalizeSexyScore(sexyScore);
  const overall_rank_score = calculateOverallScore({
    review_score,
    sexy_score,
    authenticity_score: score,
  });

  return {
    creator_id: creatorId,
    review_score,
    sexy_score,
    authenticity_score: score,
    authenticity_confidence: confidence,
    authenticity_margin: margin,
    authenticity_tier: tier,
    overall_rank_score,
    last_calculated: new Date().toISOString(),
  };
}

/** @deprecated Use getAuthenticityTierFromScore — kept for UI migration */
export function getAuthenticityTier(
  score: number
): "high" | "medium" | "low" {
  if (score >= AUTHENTICITY_TIER_THRESHOLDS.verified_human) return "high";
  if (score >= AUTHENTICITY_TIER_THRESHOLDS.uncertain) return "medium";
  return "low";
}

export const TIER_LABELS: Record<AuthenticityTier, string> = {
  verified_human: "Verified Human",
  likely_human: "Likely Human",
  uncertain: "Uncertain",
  likely_managed: "Likely Managed",
  bot_risk: "Bot Risk",
};

export const TIER_DESCRIPTIONS: Record<AuthenticityTier, string> = {
  verified_human:
    "Strong public evidence of direct, personal fan engagement.",
  likely_human:
    "Multiple signals suggest the creator likely replies personally.",
  uncertain:
    "Mixed or insufficient public signals — score has wider uncertainty.",
  likely_managed:
    "Celebrity scale or disclosed management suggests outsourced chatting.",
  bot_risk:
    "Documented chatter use, agency patterns, or automation red flags.",
};

export function getAuthenticityLabel(score: number): string {
  return TIER_LABELS[getAuthenticityTierFromScore(score)];
}

export function formatAuthenticityWithInterval(
  score: number,
  margin: number
): string {
  return `${score.toFixed(0)} ± ${margin}`;
}

const FLAG_MESSAGES: Record<string, string> = {
  instant_response: "Consistently instant replies (<5 seconds).",
  generic_template: "Generic or copy-paste template responses detected.",
  always_online: "24/7 availability with no offline periods.",
  perfect_grammar: "Perfect grammar in every message — unusual for casual DMs.",
  identical_patterns: "Identical response structures across conversations.",
  no_sleep_pattern: "Activity shows no sleep or rest periods.",
  copy_paste_detected: "Duplicate messages sent to multiple subscribers.",
  chatter_disclosed: "Creator publicly admitted using third-party chatters.",
  management_team: "Disclosed management or talent agency handling operations.",
  mass_dm_campaign: "Documented mass DM promo campaigns reported by fans.",
};

export function getAuthenticityInsights(
  signals: AuthenticitySignals,
  score: number
): { positive: string[]; concerns: string[] } {
  const positive: string[] = [];
  const concerns: string[] = [];

  if (signals.direct_engagement_score >= 75) {
    positive.push(
      "Strong direct engagement evidence from public statements or fan testimonials."
    );
  } else if (signals.direct_engagement_score < 40) {
    concerns.push(
      "Little public evidence that the creator personally handles messages."
    );
  }

  if (signals.agency_risk_score >= 70) {
    concerns.push(
      "High agency/chatter risk — management teams or chatting services documented."
    );
  } else if (signals.agency_risk_score <= 30) {
    positive.push(
      "No public evidence of outsourced chatting agencies or management firms."
    );
  }

  if (signals.activity_pattern_score >= 70) {
    positive.push(
      "Public activity rhythms suggest natural human schedules (streams, sleep gaps)."
    );
  } else if (signals.activity_pattern_score < 40) {
    concerns.push(
      "Activity patterns appear unnaturally consistent or always-online."
    );
  }

  if (signals.voice_consistency_score >= 75) {
    positive.push(
      "Personality and voice align across public social platforms and fan reports."
    );
  } else if (signals.voice_consistency_score < 45) {
    concerns.push(
      "Promo voice differs from reported DM tone — possible templated replies."
    );
  }

  if (signals.scale_penalty_score >= 75) {
    concerns.push(
      "Mega-celebrity scale makes personal DM replies to all subscribers statistically unlikely."
    );
  } else if (signals.scale_penalty_score <= 35) {
    positive.push(
      "Moderate subscriber scale consistent with solo creator operation."
    );
  }

  if (signals.human_verified) {
    positive.push(
      "Human-verified override: creator publicly states they reply personally."
    );
  }

  for (const flag of signals.ai_detection_flags ?? []) {
    concerns.push(FLAG_MESSAGES[flag] ?? `Red flag: ${flag.replace(/_/g, " ")}`);
  }

  if (score >= 80 && positive.length === 0) {
    positive.push("Strong overall authenticity profile across all dimensions.");
  }

  return { positive, concerns };
}

export function getDimensionBreakdown(signals: AuthenticitySignals) {
  return [
    {
      key: "direct_engagement",
      label: "Direct Engagement",
      value: signals.direct_engagement_score,
      weight: AUTHENTICITY_DIMENSION_WEIGHTS.direct_engagement,
      color: "green" as const,
    },
    {
      key: "agency_risk",
      label: "Agency Risk (inverted)",
      value: 100 - signals.agency_risk_score,
      weight: AUTHENTICITY_DIMENSION_WEIGHTS.agency_risk_inverted,
      color: "cyan" as const,
    },
    {
      key: "activity_pattern",
      label: "Activity Pattern",
      value: signals.activity_pattern_score,
      weight: AUTHENTICITY_DIMENSION_WEIGHTS.activity_pattern,
      color: "purple" as const,
    },
    {
      key: "voice_consistency",
      label: "Voice Consistency",
      value: signals.voice_consistency_score,
      weight: AUTHENTICITY_DIMENSION_WEIGHTS.voice_consistency,
      color: "pink" as const,
    },
    {
      key: "scale_penalty",
      label: "Scale Fit (inverted)",
      value: 100 - signals.scale_penalty_score,
      weight: AUTHENTICITY_DIMENSION_WEIGHTS.scale_penalty_inverted,
      color: "yellow" as const,
    },
  ];
}

export function sortCreators(
  creators: CreatorWithDetails[],
  sortBy: RankingFilters["sortBy"] = "overall"
): CreatorWithDetails[] {
  const keyMap = {
    overall: (c: CreatorWithDetails) => c.scores.overall_rank_score,
    authenticity: (c: CreatorWithDetails) => c.scores.authenticity_score,
    authenticity_confidence: (c: CreatorWithDetails) =>
      c.scores.authenticity_confidence,
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
      filters.authenticityTier &&
      creator.scores.authenticity_tier !== filters.authenticityTier
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
    avgAuthenticity: round1(avgAuthenticity),
    languages: getLanguages(creators),
    humanVerifiedCount: creators.filter(
      (c) => c.scores.authenticity_score >= AUTHENTICITY_TIER_THRESHOLDS.verified_human
    ).length,
    verifiedHumanCount: creators.filter(
      (c) => c.scores.authenticity_tier === "verified_human"
    ).length,
  };
}
