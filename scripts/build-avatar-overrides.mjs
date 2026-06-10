/**
 * Researches verified portrait URLs for all creators and writes data/avatar-overrides.json.
 * Priority: existing overrides → Wikipedia → unavatar.io → Wikimedia Commons → fallback.
 */
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import {
  KNOWN_PORTRAITS,
  dicebearUrl,
  fetchWikimediaCommonsImage,
  fetchWikipediaImage,
  loadExistingOverrides,
  loadSeedData,
  probeImageUrl,
  unavatarCandidates,
} from "./avatar-utils.mjs";

const seedPath = path.resolve("data", "seed-data.json");
const overridesPath = path.resolve("data", "avatar-overrides.json");
const force = process.argv.includes("--force");
const retryFallbacks = process.argv.includes("--retry-fallbacks");

const existing = loadExistingOverrides(overridesPath);
const seedData = loadSeedData(seedPath);

const overrides = {
  _comment:
    "Verified portrait URLs. Wikipedia/Wikimedia preferred; unavatar uses public social profile photos. fallback=true uses Dicebear initials.",
};

let verified = 0;
let fallback = 0;
const uncertain = [];

async function trySource(candidate, username) {
  if (!candidate?.url) return null;
  const trusted =
    candidate.url.includes("wikimedia.org") ||
    candidate.url.includes("wikipedia.org") ||
    candidate.url.includes("unavatar.io");
  const hit = await probeImageUrl(candidate.url, username, { trusted });
  if (!hit) return null;
  return { url: candidate.url, source: candidate.source, size: hit.size };
}

async function researchCreator(creator, index) {
  const { username, name } = creator;

  if (retryFallbacks && existing[username] && !existing[username].fallback) {
    overrides[username] = existing[username];
    verified++;
    console.log(`= ${username} (kept verified)`);
    return;
  }

  if (
    !force &&
    !retryFallbacks &&
    existing[username]?.url &&
    !existing[username]?.fallback
  ) {
    const kept = await trySource(existing[username], username);
    if (kept) {
      overrides[username] = { ...existing[username], ...kept };
      verified++;
      console.log(`= ${username} (kept existing)`);
      return;
    }
  }

  await sleep(retryFallbacks ? 800 : index * 60);

  const known = KNOWN_PORTRAITS[username];
  if (known) {
    const hit = await trySource(known, username);
    if (hit) {
      overrides[username] = hit;
      verified++;
      console.log(`+ ${username} [known]`);
      return;
    }
  }

  // 1. Wikipedia
  const wiki = await fetchWikipediaImage(username);
  if (wiki) {
    const hit = await trySource(wiki, username);
    if (hit) {
      overrides[username] = hit;
      verified++;
      console.log(`+ ${username} [wikipedia]`);
      return;
    }
  }

  // 2. unavatar.io (multiple platforms/handles)
  for (const candidate of unavatarCandidates(username)) {
    const hit = await trySource(candidate, username);
    if (hit) {
      overrides[username] = hit;
      verified++;
      console.log(`+ ${username} [unavatar] ${candidate.source}`);
      return;
    }
    await sleep(400);
  }

  // 3. Wikimedia Commons search by full name
  const commons = await fetchWikimediaCommonsImage(name);
  if (commons) {
    const hit = await trySource(commons, username);
    if (hit) {
      overrides[username] = hit;
      verified++;
      console.log(`+ ${username} [commons]`);
      return;
    }
  }

  // 4. Fallback — Dicebear initials
  overrides[username] = {
    url: dicebearUrl(username),
    source: "Dicebear initials (no verified portrait found)",
    fallback: true,
  };
  fallback++;
  uncertain.push(username);
  console.log(`~ ${username} [fallback]`);
}

async function main() {
  const start = Date.now();
  console.log(`Researching ${seedData.length} creators...\n`);

  for (let i = 0; i < seedData.length; i++) {
    await researchCreator(seedData[i], i);
  }

  fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2) + "\n");

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s`);
  console.log(`Verified: ${verified}/${seedData.length}`);
  console.log(`Fallback: ${fallback}/${seedData.length}`);
  if (uncertain.length) {
    console.log(`\nFallback creators (${uncertain.length}):`);
    console.log(uncertain.join(", "));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
