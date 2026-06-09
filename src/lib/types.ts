export type Language =
  | "English"
  | "French"
  | "Spanish"
  | "Portuguese"
  | "German";

export type Creator = {
  id: number;
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
  language: Language | string;
  subscription_price: number;
  created_at: string;
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
  overall_rank_score: number;
  last_calculated: string;
};

export type AuthenticitySignals = {
  creator_id: number;
  response_time_avg: number;
  message_personalization_score: number;
  response_consistency: number;
  ai_detection_flags: string;
  human_verified: boolean;
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
  sortBy?: "overall" | "authenticity" | "reviews" | "sexy";
};

export type PlatformStats = {
  totalCreators: number;
  avgAuthenticity: number;
  languages: string[];
  humanVerifiedCount: number;
};
