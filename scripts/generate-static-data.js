import fs from "node:fs";
import path from "node:path";

const seedPath = path.resolve("data", "seed-data.json");
const outputPath = path.resolve("data", "creators.json");

const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

function reviewScoreFromRatings(reviews) {
  if (reviews.length === 0) return 50;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return Math.min(100, Math.max(0, ((avg - 1) / 4) * 100));
}

function scoreResponseTiming(avgSeconds, consistency) {
  let score = 50;
  if (avgSeconds < 5) score -= 35;
  else if (avgSeconds < 30) score -= 15;
  else if (avgSeconds >= 120 && avgSeconds <= 7200) score += 25;
  else if (avgSeconds > 7200) score += 10;
  score += (100 - consistency) * 0.35;
  return Math.min(100, Math.max(0, score));
}

function scoreAiFlags(flags) {
  const penalties = {
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
  return Math.min(100, Math.max(0, score));
}

function calculateAuthenticityScore(signals) {
  const timingScore = scoreResponseTiming(
    signals.response_time_avg,
    signals.response_consistency
  );
  const personalizationScore = Math.min(
    100,
    Math.max(0, signals.message_personalization_score)
  );
  const aiFlagScore = scoreAiFlags(signals.ai_detection_flags ?? []);
  const verifiedBonus = signals.human_verified ? 8 : 0;

  const raw =
    timingScore * 0.28 +
    personalizationScore * 0.32 +
    aiFlagScore * 0.25 +
    (100 - signals.response_consistency) * 0.15 +
    verifiedBonus;

  return Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10;
}

function calculateOverallScore(review, sexy, authenticity) {
  const overall = review * 0.3 + sexy * 0.25 + authenticity * 0.45;
  return Math.round(Math.min(100, Math.max(0, overall)) * 10) / 10;
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

  const signals = {
    creator_id: id,
    response_time_avg: creator.signals.response_time_avg,
    message_personalization_score: creator.signals.message_personalization_score,
    response_consistency: creator.signals.response_consistency,
    ai_detection_flags: JSON.stringify(creator.signals.ai_detection_flags ?? []),
    human_verified: Boolean(creator.signals.human_verified),
    last_checked: now,
  };

  const reviews = creator.reviews.map((review, reviewIndex) => ({
    id: id * 100 + reviewIndex + 1,
    creator_id: id,
    rating: review.rating,
    comment: review.comment,
    reviewer_name: review.reviewer_name,
    created_at: now,
  }));

  const reviewScore = reviewScoreFromRatings(reviews);
  const authenticityScore = calculateAuthenticityScore({
    ...creator.signals,
    ai_detection_flags: creator.signals.ai_detection_flags ?? [],
  });

  const scores = {
    creator_id: id,
    review_score: Math.round(reviewScore * 10) / 10,
    sexy_score: creator.sexy_score,
    authenticity_score: authenticityScore,
    overall_rank_score: calculateOverallScore(
      reviewScore,
      creator.sexy_score,
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
    reviews,
    scores,
    signals,
  };
});

const bundle = {
  generated_at: new Date().toISOString(),
  disclaimer:
    "Creator profiles use publicly available marketing information only. Scores and reviews are editorial estimates — not verified audits or live platform data.",
  creators,
};

fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2));
console.log(`Generated ${creators.length} creators → ${outputPath}`);
