/**
 * Validate, dedupe, and merge new creators into data/seed-data.json.
 * Usage: node scripts/bulk-add-creators.js [path-to-batch.json]
 */
import fs from "node:fs";
import path from "node:path";

const seedPath = path.resolve("data", "seed-data.json");
const resolvedBatch = process.argv[2]?.endsWith(".json")
  ? path.resolve(process.argv[2])
  : path.resolve("data", "new-creators.json");

const REQUIRED = ["name", "username", "bio", "language", "subscription_price", "sexy_score"];

const SIGNAL_TEMPLATES = {
  celebrity: {
    direct_engagement_score: 38,
    agency_risk_score: 78,
    activity_pattern_score: 42,
    voice_consistency_score: 52,
    scale_penalty_score: 88,
    confidence: 68,
    human_verified: false,
    ai_detection_flags: ["management_team", "generic_template"],
    response_time_avg: 3600,
    message_personalization_score: 48,
    response_consistency: 62,
  },
  toptier: {
    direct_engagement_score: 28,
    agency_risk_score: 88,
    activity_pattern_score: 35,
    voice_consistency_score: 45,
    scale_penalty_score: 92,
    confidence: 72,
    human_verified: false,
    ai_detection_flags: ["management_team", "identical_patterns"],
    response_time_avg: 1200,
    message_personalization_score: 40,
    response_consistency: 75,
  },
  midtier: {
    direct_engagement_score: 58,
    agency_risk_score: 48,
    activity_pattern_score: 62,
    voice_consistency_score: 66,
    scale_penalty_score: 55,
    confidence: 58,
    human_verified: false,
    ai_detection_flags: [],
    response_time_avg: 2100,
    message_personalization_score: 62,
    response_consistency: 48,
  },
  personal: {
    direct_engagement_score: 82,
    agency_risk_score: 18,
    activity_pattern_score: 76,
    voice_consistency_score: 80,
    scale_penalty_score: 32,
    confidence: 70,
    human_verified: true,
    ai_detection_flags: [],
    response_time_avg: 1680,
    message_personalization_score: 78,
    response_consistency: 34,
  },
  niche: {
    direct_engagement_score: 72,
    agency_risk_score: 28,
    activity_pattern_score: 70,
    voice_consistency_score: 74,
    scale_penalty_score: 38,
    confidence: 64,
    human_verified: true,
    ai_detection_flags: [],
    response_time_avg: 1920,
    message_personalization_score: 74,
    response_consistency: 36,
  },
};

function jitter(base, range = 8) {
  return Math.min(100, Math.max(0, base + Math.floor(Math.random() * range * 2 - range)));
}

function applyTemplate(creator) {
  const tier = creator.tier ?? "midtier";
  const tpl = SIGNAL_TEMPLATES[tier] ?? SIGNAL_TEMPLATES.midtier;
  const existing = creator.authenticity_signals ?? creator.signals ?? {};

  const signals = {
    direct_engagement_score: jitter(existing.direct_engagement_score ?? tpl.direct_engagement_score, 6),
    agency_risk_score: jitter(existing.agency_risk_score ?? tpl.agency_risk_score, 6),
    activity_pattern_score: jitter(existing.activity_pattern_score ?? tpl.activity_pattern_score, 6),
    voice_consistency_score: jitter(existing.voice_consistency_score ?? tpl.voice_consistency_score, 6),
    scale_penalty_score: jitter(existing.scale_penalty_score ?? tpl.scale_penalty_score, 6),
    confidence: jitter(existing.confidence ?? tpl.confidence, 5),
    human_verified: existing.human_verified ?? tpl.human_verified,
    ai_detection_flags: existing.ai_detection_flags ?? [...tpl.ai_detection_flags],
    response_time_avg: existing.response_time_avg ?? tpl.response_time_avg,
    message_personalization_score:
      existing.message_personalization_score ?? tpl.message_personalization_score,
    response_consistency: existing.response_consistency ?? tpl.response_consistency,
    research_notes:
      existing.research_notes ??
      `[Editorial estimate] ${creator.public_source ?? "Public social bios and press coverage"}.`,
    sources: existing.sources ?? [],
  };

  const { tier: _t, signals: _s, authenticity_signals: _a, ...rest } = creator;
  return {
    ...rest,
    authenticity_signals: signals,
    reviews:
      creator.reviews ??
      [
        {
          rating: tier === "personal" || tier === "niche" ? 4 : 3,
          comment: `[Community estimate] Public fan discourse suggests ${tier === "celebrity" || tier === "toptier" ? "mixed personal engagement at scale" : "personable replies when active online"}.`,
          reviewer_name: "Public_Sentiment",
        },
        {
          rating: tier === "personal" ? 5 : tier === "celebrity" ? 3 : 4,
          comment: `[Editorial estimate] Profile built from ${creator.public_source ?? "public promotional pages"} — not a verified DM audit.`,
          reviewer_name: "Editorial_Estimate",
        },
      ],
    avatar_url: `/avatars/${creator.username}.jpg`,
  };
}

function validate(creator, index) {
  for (const field of REQUIRED) {
    if (creator[field] === undefined || creator[field] === "") {
      throw new Error(`Creator #${index + 1} (${creator.username ?? "?"}) missing ${field}`);
    }
  }
  if (!/^[a-z0-9._-]+$/i.test(creator.username)) {
    throw new Error(`Invalid username: ${creator.username}`);
  }
}

const seed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
const batch = JSON.parse(fs.readFileSync(resolvedBatch, "utf-8"));

const existingUsernames = new Set(seed.map((c) => c.username.toLowerCase()));
const batchUsernames = new Set();
const merged = [];
let skipped = 0;

for (let i = 0; i < batch.length; i++) {
  const raw = batch[i];
  validate(raw, i);
  const key = raw.username.toLowerCase();

  if (existingUsernames.has(key)) {
    console.log(`SKIP (exists): ${raw.username}`);
    skipped++;
    continue;
  }
  if (batchUsernames.has(key)) {
    console.log(`SKIP (duplicate in batch): ${raw.username}`);
    skipped++;
    continue;
  }

  batchUsernames.add(key);
  merged.push(applyTemplate(raw));
}

const result = [...seed, ...merged];
fs.writeFileSync(seedPath, JSON.stringify(result, null, 2) + "\n");

console.log(
  `\nMerged ${merged.length} new creators (${skipped} skipped). Total: ${result.length}`
);
