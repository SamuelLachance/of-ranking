import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const seedPath = path.resolve("data", "seed-data.json");
const dbPath = path.resolve("data", "creators.db");

const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

const db = new Database(dbPath);

db.exec(`
  DROP TABLE IF EXISTS reviews;
  DROP TABLE IF EXISTS scores;
  DROP TABLE IF EXISTS authenticity_signals;
  DROP TABLE IF EXISTS creators;

  CREATE TABLE creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    bio TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    language TEXT NOT NULL,
    subscription_price REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
  );

  CREATE TABLE scores (
    creator_id INTEGER PRIMARY KEY,
    review_score REAL NOT NULL DEFAULT 0,
    sexy_score REAL NOT NULL DEFAULT 0,
    authenticity_score REAL NOT NULL DEFAULT 0,
    overall_rank_score REAL NOT NULL DEFAULT 0,
    last_calculated TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
  );

  CREATE TABLE authenticity_signals (
    creator_id INTEGER PRIMARY KEY,
    response_time_avg REAL NOT NULL,
    message_personalization_score REAL NOT NULL,
    response_consistency REAL NOT NULL,
    ai_detection_flags TEXT NOT NULL DEFAULT '[]',
    human_verified INTEGER NOT NULL DEFAULT 0,
    last_checked TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
  );
`);

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
  const aiFlagScore = scoreAiFlags(signals.ai_detection_flags);
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

const insertCreator = db.prepare(`
  INSERT INTO creators (name, username, bio, avatar_url, language, subscription_price, created_at)
  VALUES (@name, @username, @bio, @avatar_url, @language, @subscription_price, @created_at)
`);

const insertReview = db.prepare(`
  INSERT INTO reviews (creator_id, rating, comment, reviewer_name, created_at)
  VALUES (@creator_id, @rating, @comment, @reviewer_name, @created_at)
`);

const insertScores = db.prepare(`
  INSERT INTO scores (creator_id, review_score, sexy_score, authenticity_score, overall_rank_score, last_calculated)
  VALUES (@creator_id, @review_score, @sexy_score, @authenticity_score, @overall_rank_score, @last_calculated)
`);

const insertSignals = db.prepare(`
  INSERT INTO authenticity_signals (
    creator_id, response_time_avg, message_personalization_score,
    response_consistency, ai_detection_flags, human_verified, last_checked
  ) VALUES (
    @creator_id, @response_time_avg, @message_personalization_score,
    @response_consistency, @ai_detection_flags, @human_verified, @last_checked
  )
`);

const seed = db.transaction((creators) => {
  for (const creator of creators) {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`;
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 180) * 86400000
    ).toISOString();

    const result = insertCreator.run({
      name: creator.name,
      username: creator.username,
      bio: creator.bio,
      avatar_url: avatarUrl,
      language: creator.language,
      subscription_price: creator.subscription_price,
      created_at: createdAt,
    });

    const creatorId = result.lastInsertRowid;
    const now = new Date().toISOString();

    for (const review of creator.reviews) {
      insertReview.run({
        creator_id: creatorId,
        rating: review.rating,
        comment: review.comment,
        reviewer_name: review.reviewer_name,
        created_at: now,
      });
    }

    const signals = {
      ...creator.signals,
      ai_detection_flags: creator.signals.ai_detection_flags ?? [],
    };

    insertSignals.run({
      creator_id: creatorId,
      response_time_avg: signals.response_time_avg,
      message_personalization_score: signals.message_personalization_score,
      response_consistency: signals.response_consistency,
      ai_detection_flags: JSON.stringify(signals.ai_detection_flags),
      human_verified: signals.human_verified ? 1 : 0,
      last_checked: now,
    });

    const reviewScore = reviewScoreFromRatings(creator.reviews);
    const authenticityScore = calculateAuthenticityScore(signals);
    const overallScore = calculateOverallScore(
      reviewScore,
      creator.sexy_score,
      authenticityScore
    );

    insertScores.run({
      creator_id: creatorId,
      review_score: Math.round(reviewScore * 10) / 10,
      sexy_score: creator.sexy_score,
      authenticity_score: authenticityScore,
      overall_rank_score: overallScore,
      last_calculated: now,
    });
  }
});

seed(seedData);

console.log(`Seeded ${seedData.length} creators into ${dbPath}`);
