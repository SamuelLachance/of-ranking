import fs from "node:fs";
import path from "node:path";

const seedPath = path.resolve("data", "seed-data.json");
const outputPath = path.resolve("data", "creators.json");

const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

const AUTHENTICITY_DIMENSION_WEIGHTS = {
  direct_engagement: 0.25,
  agency_risk_inverted: 0.25,
  activity_pattern: 0.2,
  voice_consistency: 0.15,
  scale_penalty_inverted: 0.15,
};

const TIER_THRESHOLDS = {
  verified_human: 80,
  likely_human: 60,
  uncertain: 40,
  likely_managed: 20,
};

const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const round1 = (v) => Math.round(v * 10) / 10;

function reviewScoreFromRatings(reviews) {
  if (reviews.length === 0) return 50;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return clamp(((avg - 1) / 4) * 100);
}

function getTierFromScore(score) {
  if (score >= TIER_THRESHOLDS.verified_human) return "verified_human";
  if (score >= TIER_THRESHOLDS.likely_human) return "likely_human";
  if (score >= TIER_THRESHOLDS.uncertain) return "uncertain";
  if (score >= TIER_THRESHOLDS.likely_managed) return "likely_managed";
  return "bot_risk";
}

function signalDisagreementPenalty(dim) {
  const humanSignals = [
    dim.direct_engagement_score,
    dim.activity_pattern_score,
    dim.voice_consistency_score,
    100 - dim.agency_risk_score,
    100 - dim.scale_penalty_score,
  ];
  const spread = Math.max(...humanSignals) - Math.min(...humanSignals);
  if (spread > 50) return 18;
  if (spread > 35) return 10;
  if (spread > 25) return 5;
  return 0;
}

function getConfidenceMargin(confidence) {
  return Math.round((100 - confidence) * 0.12);
}

function calculateAuthenticityScore(dim) {
  const w = AUTHENTICITY_DIMENSION_WEIGHTS;
  let raw =
    dim.direct_engagement_score * w.direct_engagement +
    (100 - dim.agency_risk_score) * w.agency_risk_inverted +
    dim.activity_pattern_score * w.activity_pattern +
    dim.voice_consistency_score * w.voice_consistency +
    (100 - dim.scale_penalty_score) * w.scale_penalty_inverted;

  const flagPenalty = Math.min(25, (dim.ai_detection_flags?.length ?? 0) * 4);
  raw -= flagPenalty;

  if (dim.human_verified && dim.direct_engagement_score >= 70) {
    raw += 5;
  }

  return clamp(round1(raw));
}

function resolveConfidence(dim, score) {
  let confidence = clamp(dim.confidence);
  confidence -= signalDisagreementPenalty(dim);
  confidence += Math.min(8, (dim.sources?.length ?? 0) * 2);
  if (dim.human_verified && dim.direct_engagement_score >= 75) confidence += 5;
  if (score >= 80 && dim.agency_risk_score >= 70) confidence -= 12;
  if (score <= 30 && dim.agency_risk_score <= 30) confidence -= 10;
  return clamp(Math.round(confidence));
}

function calculateOverallScore(review, sexy, nude, authenticity) {
  return round1(
    clamp(review * 0.2 + sexy * 0.15 + nude * 0.25 + authenticity * 0.4)
  );
}

function buildSignalsFromSeed(creator, id) {
  const raw = creator.authenticity_signals ?? creator.signals ?? {};
  const dim = {
    direct_engagement_score: raw.direct_engagement_score ?? 50,
    agency_risk_score: raw.agency_risk_score ?? 50,
    activity_pattern_score: raw.activity_pattern_score ?? 50,
    voice_consistency_score: raw.voice_consistency_score ?? 50,
    scale_penalty_score: raw.scale_penalty_score ?? 50,
    confidence: raw.confidence ?? 50,
    tier: raw.tier ?? "uncertain",
    research_notes: raw.research_notes ?? "",
    sources: raw.sources ?? [],
    human_verified: Boolean(raw.human_verified),
    ai_detection_flags: raw.ai_detection_flags ?? [],
    response_time_avg: raw.response_time_avg ?? 1800,
    message_personalization_score: raw.message_personalization_score ?? 50,
    response_consistency: raw.response_consistency ?? 50,
  };

  const score = calculateAuthenticityScore(dim);
  const confidence = resolveConfidence(dim, score);
  const margin = getConfidenceMargin(confidence);
  const tier =
    dim.tier && dim.tier !== "uncertain" ? dim.tier : getTierFromScore(score);

  return {
    creator_id: id,
    direct_engagement_score: dim.direct_engagement_score,
    agency_risk_score: dim.agency_risk_score,
    activity_pattern_score: dim.activity_pattern_score,
    voice_consistency_score: dim.voice_consistency_score,
    scale_penalty_score: dim.scale_penalty_score,
    confidence,
    tier,
    research_notes: dim.research_notes,
    sources: dim.sources,
    human_verified: dim.human_verified,
    ai_detection_flags: dim.ai_detection_flags,
    response_time_avg: dim.response_time_avg,
    message_personalization_score: dim.message_personalization_score,
    response_consistency: dim.response_consistency,
    last_checked: new Date().toISOString(),
    _computed_score: score,
    _computed_margin: margin,
  };
}

const creators = seedData.map((creator, index) => {
  const id = index + 1;
  const avatarUrl =
    creator.avatar_url ??
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(creator.username)}`;
  const createdAt =
    creator.created_at ??
    new Date(Date.now() - Math.floor(Math.random() * 365) * 86400000).toISOString();
  const now = new Date().toISOString();

  const built = buildSignalsFromSeed(creator, id);
  const {
    _computed_score: authenticityScore,
    _computed_margin: authenticityMargin,
    ...signals
  } = built;

  const reviews = creator.reviews.map((review, reviewIndex) => ({
    id: id * 100 + reviewIndex + 1,
    creator_id: id,
    rating: review.rating,
    comment: review.comment,
    reviewer_name: review.reviewer_name,
    created_at: now,
  }));

  const reviewScore = reviewScoreFromRatings(reviews);

  const nudeScore = clamp(creator.nude_score ?? 50);

  const scores = {
    creator_id: id,
    review_score: round1(reviewScore),
    sexy_score: creator.sexy_score,
    nude_score: nudeScore,
    authenticity_score: authenticityScore,
    authenticity_confidence: signals.confidence,
    authenticity_margin: authenticityMargin,
    authenticity_tier: signals.tier,
    overall_rank_score: calculateOverallScore(
      reviewScore,
      creator.sexy_score,
      nudeScore,
      authenticityScore
    ),
    last_calculated: now,
  };

  return {
    id,
    name: creator.name,
    username: creator.username,
    bio: creator.bio,
    avatar_url: avatarUrl,
    language: creator.language,
    subscription_price: creator.subscription_price,
    created_at: createdAt,
    public_source: creator.public_source ?? null,
    nude_score_notes: creator.nude_score_notes ?? null,
    reviews,
    scores,
    signals,
  };
});

const bundle = {
  generated_at: new Date().toISOString(),
  disclaimer:
    "Editorial estimate from public signals only. Scores reflect publicly available marketing information, press coverage, and documented fan discourse — not verified DM audits or live platform telemetry. We do not scrape OnlyFans.",
  methodology_version: "2.1-nude-score",
  creators,
};

fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2));
console.log(`Generated ${creators.length} creators → ${outputPath}`);
