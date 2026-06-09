export type Language =
  | "English"
  | "French"
  | "Spanish"
  | "Portuguese"
  | "German";

export type AuthenticityTier =
  | "verified_human"
  | "likely_human"
  | "uncertain"
  | "likely_managed"
  | "bot_risk";

export type Creator = {
  id: number;
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
  language: Language | string;
  subscription_price: number;
  created_at: string;
  public_source?: string | null;
};

export type Review = {
  id: number;
  creator_id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
};

export type Scores = {
  creator_id: number;
  review_score: number;
  sexy_score: number;
  authenticity_score: number;
  authenticity_confidence: number;
  authenticity_margin: number;
  authenticity_tier: AuthenticityTier;
  overall_rank_score: number;
  last_calculated: string;
};

/** Multi-dimensional authenticity signals from public research. */
export type AuthenticityDimensionScores = {
  direct_engagement_score: number;
  agency_risk_score: number;
  activity_pattern_score: number;
  voice_consistency_score: number;
  scale_penalty_score: number;
  confidence: number;
  tier: AuthenticityTier;
  research_notes: string;
  sources: string[];
  human_verified: boolean;
  ai_detection_flags: string[];
};

export type AuthenticitySignals = AuthenticityDimensionScores & {
  creator_id: number;
  /** Legacy timing fields retained for chart compatibility */
  response_time_avg: number;
  message_personalization_score: number;
  response_consistency: number;
  last_checked: string;
};

export type CreatorWithDetails = Creator & {
  scores: Scores;
  signals: AuthenticitySignals;
  reviews: Review[];
};

export type RankedCreator = CreatorWithDetails & {
  rank: number;
};

export type RankingFilters = {
  language?: string;
  minAuthenticity?: number;
  minPrice?: number;
  maxPrice?: number;
  authenticityTier?: AuthenticityTier;
  sortBy?: "overall" | "authenticity" | "authenticity_confidence" | "reviews" | "sexy";
};

export type PlatformStats = {
  totalCreators: number;
  avgAuthenticity: number;
  languages: string[];
  humanVerifiedCount: number;
  verifiedHumanCount: number;
};
