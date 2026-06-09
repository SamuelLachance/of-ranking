/**
 * Fetches creator profile photos via image search (parallel).
 * Tries Google Images first; falls back to Bing + Wikipedia when Google blocks bots.
 * Saves to public/avatars/<username>.jpg — no OnlyFans scraping.
 */
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const avatarsDir = path.resolve("public", "avatars");
const seedPath = path.resolve("data", "seed-data.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Wikipedia page titles for REST API lookup */
const WIKI_TITLES = {
  amouranth: "Amouranth",
  corinnakopf: "Corinna_Kopf",
  bellathorne: "Bella_Thorne",
  realbhadbhabie: "Bhad_Bhabie",
  iggyazalea: "Iggy_Azalea",
  tanamongeau: "Tana_Mongeau",
  miakhalifa: "Mia_Khalifa",
  carmenelectra: "Carmen_Electra",
  tyga: "Tyga",
  denisersichards: "Denise_Richards",
  rubirose: "Rubi_Rose",
  anitta: "Anitta_(singer)",
  pietro_boselli: "Pietro_Boselli",
};

function dicebearUrl(username) {
  return `https://api.dicebear.com/7.x/personas/jpeg?seed=${encodeURIComponent(username)}&size=400`;
}

function wikiThumbToLarge(url) {
  return url.replace(/\/thumb\/(.+)\/\d+px-[^/]+$/, "/$1");
}

function buildQueries(name) {
  return [
    `"${name}" onlyfans portrait`,
    `"${name}" headshot`,
    `${name} portrait photo`,
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

function extractGoogleUrls(html) {
  const urls = new Set();
  for (const m of html.matchAll(/"ou":"(https?:[^"\\]+)"/g)) {
    urls.add(m[1].replace(/\\u003d/g, "=").replace(/\\u0026/g, "&"));
  }
  return filterImageUrls([...urls]);
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

async function searchGoogleImages(queries) {
  for (const query of queries) {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&hl=en`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
      });
      if (!res.ok) continue;
      const urls = extractGoogleUrls(await res.text());
      if (urls.length) return { urls, engine: "google", query };
    } catch {
      /* try next query */
    }
  }
  return { urls: [], engine: "google" };
}

async function searchBingImages(queries) {
  for (const query of queries) {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:photo-photo&first=1`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
      });
      if (!res.ok) continue;
      const urls = extractBingUrls(await res.text());
      if (urls.length) return { urls, engine: "bing", query };
    } catch {
      /* try next query */
    }
  }
  return { urls: [], engine: "bing" };
}

async function fetchWikipediaImage(username) {
  const title = WIKI_TITLES[username];
  if (!title) return null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { "User-Agent": "of-ranking-avatar-fetch/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.thumbnail?.source) return null;
    return wikiThumbToLarge(data.thumbnail.source);
  } catch {
    return null;
  }
}

async function downloadImage(url, outPath, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept: "image/*,*/*",
          Referer: new URL(url).origin + "/",
        },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 800) throw new Error(`Too small (${buffer.length}b)`);
      fs.writeFileSync(outPath, buffer);
      return buffer.length;
    } catch (err) {
      lastErr = err;
      await sleep(400 * (i + 1));
    }
  }
  throw lastErr;
}

async function tryDownloadCandidates(urls, outPath) {
  for (const imgUrl of urls.slice(0, 6)) {
    try {
      const size = await downloadImage(imgUrl, outPath);
      return { url: imgUrl, size };
    } catch {
      /* next candidate */
    }
  }
  return null;
}

async function fetchCreatorAvatar(creator, index) {
  const { username, name } = creator;
  const outPath = path.join(avatarsDir, `${username}.jpg`);
  const queries = buildQueries(name);
  const attempts = [];

  await sleep(index * 120);

  const google = await searchGoogleImages(queries);
  if (google.urls.length) {
    const hit = await tryDownloadCandidates(google.urls, outPath);
    if (hit) {
      return { username, ok: true, source: "google", ...hit };
    }
    attempts.push("google:download failed");
  } else {
    attempts.push("google:no results (bot block)");
  }

  const wikiUrl = await fetchWikipediaImage(username);
  if (wikiUrl) {
    try {
      const size = await downloadImage(wikiUrl, outPath);
      return { username, ok: true, source: "wikipedia", url: wikiUrl, size, fallback: true };
    } catch (err) {
      attempts.push(`wikipedia:${err.message}`);
    }
  }

  const bing = await searchBingImages(queries);
  if (bing.urls.length) {
    const hit = await tryDownloadCandidates(bing.urls, outPath);
    if (hit) {
      return {
        username,
        ok: true,
        source: "bing",
        query: bing.query,
        fallback: true,
        ...hit,
      };
    }
    attempts.push("bing:download failed");
  } else {
    attempts.push("bing:no results");
  }

  const dicebear = dicebearUrl(username);
  try {
    const size = await downloadImage(dicebear, outPath);
    return {
      username,
      ok: true,
      source: "dicebear",
      url: dicebear,
      size,
      fallback: true,
      attempts,
    };
  } catch (err) {
    return { username, ok: false, attempts: [...attempts, `dicebear:${err.message}`] };
  }
}

const CONCURRENCY = 15;

async function runPool(items, worker, limit) {
  const results = new Array(items.length);
  let next = 0;

  async function runWorker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, runWorker)
  );
  return results;
}

async function main() {
  const start = Date.now();
  fs.mkdirSync(avatarsDir, { recursive: true });

  const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  const missing = seedData.filter(
    (c) => !fs.existsSync(path.join(avatarsDir, `${c.username}.jpg`))
  );

  console.log(
    `Fetching ${missing.length} avatars (${seedData.length - missing.length} cached), concurrency ${CONCURRENCY}...\n`
  );

  const results =
    missing.length > 0
      ? await runPool(missing, fetchCreatorAvatar, CONCURRENCY)
      : [];

  let ok = 0;
  let google = 0;
  let fallback = 0;
  const failures = [];

  for (const result of results) {
    if (result.ok) {
      ok++;
      if (result.source === "google") google++;
      else fallback++;
      const tag = result.fallback ? ` [fallback: ${result.source}]` : "";
      console.log(`✓ ${result.username} (${result.size}b, ${result.source})${tag}`);
    } else {
      failures.push(result);
      console.error(`✗ ${result.username}: ${result.attempts.join("; ")}`);
    }
  }

  for (const creator of seedData) {
    creator.avatar_url = `/avatars/${creator.username}.jpg`;
  }
  fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2) + "\n");

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\nDone in ${elapsed}s: ${ok}/${missing.length} fetched (${google} Google, ${fallback} fallback), ${failures.length} failed, ${seedData.length - missing.length} cached`
  );
  process.exit(0);
}

main();
