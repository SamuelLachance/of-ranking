/**
 * Fetches verified creator portrait photos.
 * Priority: overrides → unavatar.io → Wikipedia → Wikimedia Commons → Bing (--allow-bing) → Dicebear.
 */
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import {
  UA,
  dicebearUrl,
  fetchWikimediaCommonsImage,
  fetchWikipediaImage,
  isTrustedWikimedia,
  loadExistingOverrides,
  probeImageUrl,
  unavatarCandidates,
  validateImageBuffer,
} from "./avatar-utils.mjs";

const avatarsDir = path.resolve("public", "avatars");
const metaPath = path.resolve("data", "avatar-meta.json");
const seedPath = path.resolve("data", "seed-data.json");
const overridesPath = path.resolve("data", "avatar-overrides.json");

const force = process.argv.includes("--force");
const allowBing = process.argv.includes("--allow-bing");

const OVERRIDES = loadExistingOverrides(overridesPath);

const URL_REJECT =
  /cartoon|anime|illustration|clipart|logo|favicon|placeholder|coloring|minecraft|dobrik|gollum|group.?photo|class.?photo|school.?children|children.?class|armbruster|limoandhearse|pinimg\.com/i;

function buildQueries(name, username) {
  return [
    `"${name}" site:wikipedia.org portrait filetype:jpg`,
    `"${name}" onlyfans creator portrait`,
    `"${name}" influencer headshot`,
    `"${username}" onlyfans portrait`,
  ];
}

function filterImageUrls(urls) {
  return urls.filter(
    (u) =>
      !u.includes("gstatic.com") &&
      !u.includes("google.com") &&
      !u.includes("bing.com/th/id") &&
      !u.includes("facebook_sharing") &&
      !u.endsWith(".gif") &&
      !u.endsWith(".svg") &&
      !u.includes("favicon")
  );
}

function extractBingUrls(html) {
  const urls = new Set();
  for (const m of html.matchAll(/murl&quot;:&quot;(https?:[^&]+?)&quot;/g)) {
    urls.add(m[1]);
  }
  for (const m of html.matchAll(/"murl":"(https?:[^"\\]+)"/g)) {
    urls.add(m[1]);
  }
  return filterImageUrls([...urls]);
}

async function searchBingImages(queries) {
  const all = [];
  for (const query of queries) {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:photo-photo&first=1`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
      });
      if (!res.ok) continue;
      const urls = extractBingUrls(await res.text());
      all.push(...urls);
      if (all.length >= 8) break;
      await sleep(300);
    } catch {
      /* try next query */
    }
  }
  return [...new Set(all)];
}

async function downloadCandidate(url, outPath, username, rejections, { trusted = false, relaxed = false } = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "image/*,*/*",
        Referer: new URL(url).origin + "/",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      rejections.push({ url, reason: `HTTP ${res.status}` });
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!/^image\/(jpeg|png|webp)$/i.test(contentType)) {
      rejections.push({ url, reason: `not an image (${contentType})` });
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const finalUrl = res.url || url;
    const isWiki = trusted || isTrustedWikimedia(finalUrl);
    const validation = validateImageBuffer(buffer, finalUrl, username, { trusted: isWiki, relaxed });
    if (!validation.ok) {
      rejections.push({ url: finalUrl, reason: validation.reason });
      return null;
    }

    if (!isWiki && URL_REJECT.test(finalUrl.toLowerCase())) {
      rejections.push({ url: finalUrl, reason: "URL matches reject pattern" });
      return null;
    }

    fs.writeFileSync(outPath, buffer);
    return { url: finalUrl, size: buffer.length };
  } catch (err) {
    rejections.push({ url, reason: err.message });
    return null;
  }
}

async function tryDownloadCandidates(urls, outPath, username, rejections, limit = 5, trusted = false, relaxed = false) {
  for (const imgUrl of urls.slice(0, limit)) {
    const hit = await downloadCandidate(imgUrl, outPath, username, rejections, { trusted, relaxed });
    if (hit) return hit;
  }
  return null;
}

async function fetchCreatorAvatar(creator, index) {
  const { username, name } = creator;
  const outPath = path.join(avatarsDir, `${username}.jpg`);
  const rejections = [];
  const queries = buildQueries(name, username);

  await sleep(index * 80);

  const override = OVERRIDES[username];
  if (override?.url) {
    const trusted =
      override.url.includes("unavatar.io") ||
      override.url.includes("wikimedia.org") ||
      override.url.includes("wikipedia.org") ||
      override.fallback;
    const hit = await tryDownloadCandidates([override.url], outPath, username, rejections, 1, trusted, override.fallback);
    if (hit) {
      return {
        username,
        ok: true,
        source: override.fallback ? "fallback" : "override",
        fallback: Boolean(override.fallback),
        label: override.source || "avatar-overrides.json",
        rejections,
        ...hit,
      };
    }
  }

  const unavatarUrls = unavatarCandidates(username).map((c) => c.url);
  const unavatarHit = await tryDownloadCandidates(unavatarUrls, outPath, username, rejections, 6, true);
  if (unavatarHit) {
    return { username, ok: true, source: "unavatar", rejections, ...unavatarHit };
  }

  const wiki = await fetchWikipediaImage(username);
  if (wiki?.url) {
    const hit = await tryDownloadCandidates([wiki.url], outPath, username, rejections, 1, true);
    if (hit) {
      return { username, ok: true, source: "wikipedia", rejections, ...hit };
    }
  }

  const commons = await fetchWikimediaCommonsImage(name);
  if (commons?.url) {
    const hit = await tryDownloadCandidates([commons.url], outPath, username, rejections, 1, true);
    if (hit) {
      return { username, ok: true, source: "wikimedia", rejections, ...hit };
    }
  }

  if (allowBing) {
    const bingUrls = await searchBingImages(queries);
    if (bingUrls.length) {
      const hit = await tryDownloadCandidates(bingUrls, outPath, username, rejections, 5);
      if (hit) {
        return { username, ok: true, source: "bing", rejections, ...hit };
      }
    }
  }

  const dicebear = dicebearUrl(username);
  const hit = await tryDownloadCandidates([dicebear], outPath, username, rejections, 1, false, true);
  if (hit) {
    return {
      username,
      ok: true,
      source: "fallback",
      fallback: true,
      rejections,
      ...hit,
    };
  }

  return { username, ok: false, rejections };
}

const CONCURRENCY = 8;

async function runPool(items, worker, limit) {
  const results = new Array(items.length);
  let next = 0;

  async function runWorker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
  return results;
}

async function main() {
  const start = Date.now();
  fs.mkdirSync(avatarsDir, { recursive: true });

  const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  const targets = force
    ? seedData
    : seedData.filter((c) => !fs.existsSync(path.join(avatarsDir, `${c.username}.jpg`)));

  console.log(
    `${force ? "Force re-fetching" : "Fetching"} ${targets.length} avatars (${seedData.length - targets.length} cached), concurrency ${CONCURRENCY}${allowBing ? ", Bing enabled" : ""}...\n`
  );

  const results =
    targets.length > 0 ? await runPool(targets, fetchCreatorAvatar, CONCURRENCY) : [];

  let ok = 0;
  const sourceCounts = {};
  let fallbackCount = 0;
  const failures = [];
  const meta = {};

  for (const result of results) {
    if (result.rejections?.length) {
      for (const r of result.rejections) {
        console.log(`  ⊘ ${result.username}: rejected ${r.url?.slice(0, 90)} — ${r.reason}`);
      }
    }

    if (result.ok) {
      ok++;
      sourceCounts[result.source] = (sourceCounts[result.source] || 0) + 1;
      if (result.fallback) fallbackCount++;

      meta[result.username] = {
        source: result.source,
        fallback: Boolean(result.fallback),
        url: result.url,
        size: result.size,
      };

      const tag = result.fallback ? " [fallback]" : "";
      console.log(`✓ ${result.username} (${result.size}b, ${result.source})${tag}`);
    } else {
      failures.push(result);
      console.error(`✗ ${result.username}: all sources failed`);
    }
  }

  for (const creator of seedData) {
    creator.avatar_url = `/avatars/${creator.username}.jpg`;
    const m = meta[creator.username];
    if (m) {
      creator.avatar_source = m.source;
      creator.avatar_fallback = m.fallback;
      creator.avatar_verified = !m.fallback && m.source !== "bing";
    } else if (fs.existsSync(path.join(avatarsDir, `${creator.username}.jpg`))) {
      const prev = OVERRIDES[creator.username];
      creator.avatar_source = prev?.fallback ? "fallback" : "override";
      creator.avatar_fallback = Boolean(prev?.fallback);
      creator.avatar_verified = !prev?.fallback;
    }
  }

  fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2) + "\n");

  if (Object.keys(meta).length) {
    const existingMeta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, "utf-8"))
      : {};
    fs.writeFileSync(metaPath, JSON.stringify({ ...existingMeta, ...meta }, null, 2) + "\n");
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const breakdown = Object.entries(sourceCounts)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ");
  console.log(
    `\nDone in ${elapsed}s: ${ok}/${targets.length} fetched (${breakdown}), ${fallbackCount} fallback, ${failures.length} failed, ${seedData.length - targets.length} cached`
  );
  process.exit(failures.length > 0 ? 1 : 0);
}

main();
