/**
 * Fetches verified creator portrait photos.
 * Priority: manual overrides → Wikipedia API → Bing Images → unavatar.io → Dicebear.
 * Validates images before saving (size, aspect ratio, URL heuristics).
 */
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const avatarsDir = path.resolve("public", "avatars");
const seedPath = path.resolve("data", "seed-data.json");
const overridesPath = path.resolve("data", "avatar-overrides.json");

const force = process.argv.includes("--force");
const MIN_BYTES = 15 * 1024;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** @type {Record<string, { url: string; source?: string }>} */
const OVERRIDES = fs.existsSync(overridesPath)
  ? JSON.parse(fs.readFileSync(overridesPath, "utf-8"))
  : {};

/** Wikipedia page titles for REST/API lookup */
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
  sophieraiin: "Sophie_Rain",
  blacchyna: "Blac_Chyna",
  belledelphine: "Belle_Delphine",
  amberrose: "Amber_Rose",
  tylerposey: "Tyler_Posey",
  treysongz: "Trey_Songz",
  lanarhoades: "Lana_Rhoades",
  madisonbeer: "Madison_Beer",
  amandabynes: "Amanda_Bynes",
  iamcardib: "Cardi_B",
  neekolul: "Neekolul",
  lilyallenftse500: "Lily_Allen",
  dreadematteo: "Drea_de_Matteo",
  jordynwoods: "Jordyn_Woods",
  sommerray: "Sommer_Ray",
  angelawhite: "Angela_White",
  rileyreid: "Riley_Reid",
  abelladanger: "Abella_Danger",
  whitney: "Whitney_Cummings",
  sonjamorgan: "Sonja_Morgan",
  ericamena: "Erica_Mena",
  coco: "Coco_Austin",
  austinmahone: "Austin_Mahone",
  f1nn5ter: "F1NN5TER",
  ironmouse: "Ironmouse",
  evaelfie: "Eva_Elfie",
  autumnfalls: "Autumn_Falls",
  emilywillis: "Emily_Willis",
  vinasky: "Vina_Sky",
  renogold: "Reno_Gold",
  danniiharwood: "Danni_Harwood",
  milamondell: "Mila_Mondell",
  claramorgane: "Clara_Morgane",
  anissakate: "Anissa_Kate",
  sabrinasabrok: "Sabrina_Sabrok",
  mathildtantot: "Mathilde_Tantot",
  paulinetantot: "Pauline_Tantot",
  martinavismara: "Martina_Vismara",
  bernardtomic: "Bernard_Tomic",
  vanessasierra: "Vanessa_Sierra",
  jemwolfie: "Jem_Wolfie",
  larsapippen: "Larsa_Pippen",
  lottiemossof: "Lottie_Moss",
  shannamoakler: "Shanna_Moakler",
  meganbartonhanson: "Megan_Barton-Hanson",
  iamsafaree: "Safaree",
  alexadamsxxx: "Alex_Adams_(actor)",
  chloesaxon: "Chloe_Saxon",
  salicerose: "Salice_Rose",
  lilianaheartsss: "Liliana_Hearts",
  cintiacossio: "Cintia_Cossio",
  aidacortesll: "Aida_Cortes",
  katyaelisehenrysworld: "Katya_Elise_Henry",
  camillaxaraujo: "Camilla_Araújo",
  candetinelli: "Cande_Tinelli",
  djkhaledandfatjoe: "DJ_Khaled",
  hannahowo: "Hannah_Owo",
  bonnieblue: "Bonnie_Blue",
  yinyleon: "Yiny_Leon",
  trukait: "Tru_Kait",
  victoryaxo: "Victoryaxo",
  azul_hermosa: "Azul_Hermosa",
  nessaoriley: "Nessa_O'Reilly",
  fitbryceadams: "Bryce_Adams",
  megnutt02: "Megan_Nutt",
  gracecharis: "Grace_Charis",
  indiefoxx: "Indiefoxx",
  morgpie: "Morgpie",
  emilyblack: "Emily_Black",
  faithlianne: "Faith_Lianne",
  arikytsya: "Ari_Kytsya",
  peachjars: "PeachJars",
  skylarmaexo: "Skylar_Mae",
  ariellaferrera: "Ariella_Ferrera",
  projektmelody: "Projekt_Melody",
  filian: "Filian_(streamer)",
};

/** Preferred unavatar platform per creator username */
const UNAVATAR_PLATFORM = {
  sophieraiin: "tiktok",
  corinnakopf: "twitch",
};

const URL_REJECT =
  /cartoon|anime|illustration|clipart|logo|favicon|placeholder|coloring|minecraft|dobrik|gollum|group.?photo|class.?photo|school.?children|children.?class|armbruster|limoandhearse|pinimg\.com/i;

const USERNAME_REJECT = {
  corinnakopf: /dobrik|david/i,
  sophieraiin: /cartoon|minecraft|coloring|school|children|anime/i,
};

function wikiThumbToLarge(url) {
  return url.replace(/\/thumb\/(.+)\/\d+px-[^/]+$/, "/$1");
}

function dicebearUrl(username) {
  return `https://api.dicebear.com/7.x/personas/jpeg?seed=${encodeURIComponent(username)}&size=400`;
}

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

function readImageDimensions(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }

  if (
    buffer.slice(0, 8).toString("ascii") === "\x89PNG\r\n\x1a\n" &&
    buffer.length >= 24
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (buffer.length >= 30 && buffer.slice(0, 4).toString("ascii") === "RIFF") {
    return {
      width: buffer.readUInt16LE(26) + 1,
      height: buffer.readUInt16LE(28) + 1,
    };
  }

  return null;
}

function validateImage(buffer, url, username, rejections) {
  if (buffer.length < MIN_BYTES) {
    rejections.push({ url, reason: `too small (${buffer.length}b, min ${MIN_BYTES}b)` });
    return false;
  }

  const lower = url.toLowerCase();
  if (URL_REJECT.test(lower)) {
    rejections.push({ url, reason: "URL matches reject pattern (cartoon/logo/group/etc.)" });
    return false;
  }

  const userReject = USERNAME_REJECT[username];
  if (userReject?.test(lower)) {
    rejections.push({ url, reason: "URL blocked for this creator" });
    return false;
  }

  const dims = readImageDimensions(buffer);
  if (dims?.width && dims?.height) {
    if (dims.width > dims.height * 2.2) {
      rejections.push({
        url,
        reason: `landscape group-shot ratio ${dims.width}x${dims.height}`,
      });
      return false;
    }
    if (dims.height < dims.width * 0.55) {
      rejections.push({
        url,
        reason: `not portrait-oriented ${dims.width}x${dims.height}`,
      });
      return false;
    }
  }

  return true;
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

async function fetchWikipediaImage(username) {
  const title = WIKI_TITLES[username];
  if (!title) return null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800&pilicense=any`,
      { headers: { "User-Agent": "of-ranking-avatar-fetch/1.0" } }
    );
    const text = await res.text();
    if (text.startsWith("You are")) return null;
    const data = JSON.parse(text);
    const page = Object.values(data.query?.pages || {})[0];
    if (page?.missing || !page?.thumbnail?.source) return null;
    return wikiThumbToLarge(page.thumbnail.source);
  } catch {
    return null;
  }
}

function unavatarCandidates(username) {
  const preferred = UNAVATAR_PLATFORM[username];
  const platforms = preferred
    ? [preferred, "instagram", "twitter", "youtube", "tiktok", "twitch"]
    : ["instagram", "twitter", "youtube", "tiktok", "twitch"];
  const seen = new Set();
  const urls = [];
  for (const p of platforms) {
    if (seen.has(p)) continue;
    seen.add(p);
    urls.push(`https://unavatar.io/${p}/${encodeURIComponent(username)}`);
  }
  return urls;
}

async function downloadCandidate(url, outPath, username, rejections, retries = 4) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept: "image/*,*/*",
          Referer: new URL(url).origin + "/",
        },
        redirect: "follow",
      });

      if (res.status === 429 && attempt < retries - 1) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        rejections.push({ url, reason: `not an image (${contentType})` });
        return null;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      if (!validateImage(buffer, res.url || url, username, rejections)) return null;

      fs.writeFileSync(outPath, buffer);
      return { url: res.url || url, size: buffer.length };
    } catch (err) {
      lastErr = err;
      if (attempt < retries - 1) await sleep(800 * (attempt + 1));
    }
  }
  rejections.push({ url, reason: lastErr?.message || "download failed" });
  return null;
}

async function tryDownloadCandidates(urls, outPath, username, rejections, limit = 5) {
  for (const imgUrl of urls.slice(0, limit)) {
    const hit = await downloadCandidate(imgUrl, outPath, username, rejections);
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
    const hit = await tryDownloadCandidates([override.url], outPath, username, rejections, 1);
    if (hit) {
      return {
        username,
        ok: true,
        source: "override",
        label: override.source || "avatar-overrides.json",
        rejections,
        ...hit,
      };
    }
  }

  const wikiUrl = await fetchWikipediaImage(username);
  if (wikiUrl) {
    const hit = await tryDownloadCandidates([wikiUrl], outPath, username, rejections, 1);
    if (hit) {
      return { username, ok: true, source: "wikipedia", rejections, ...hit };
    }
  }

  const bingUrls = await searchBingImages(queries);
  if (bingUrls.length) {
    const hit = await tryDownloadCandidates(bingUrls, outPath, username, rejections, 5);
    if (hit) {
      return { username, ok: true, source: "bing", rejections, ...hit };
    }
  }

  const unavatarUrls = unavatarCandidates(username);
  const unavatarHit = await tryDownloadCandidates(unavatarUrls, outPath, username, rejections, 5);
  if (unavatarHit) {
    return { username, ok: true, source: "unavatar", rejections, ...unavatarHit };
  }

  const dicebear = dicebearUrl(username);
  try {
    const hit = await downloadCandidate(dicebear, outPath, username, rejections);
    if (hit) {
      return {
        username,
        ok: true,
        source: "dicebear",
        fallback: true,
        rejections,
        ...hit,
      };
    }
  } catch (err) {
    rejections.push({ url: dicebear, reason: err.message });
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
    `${force ? "Force re-fetching" : "Fetching"} ${targets.length} avatars (${seedData.length - targets.length} cached), concurrency ${CONCURRENCY}...\n`
  );

  const results =
    targets.length > 0 ? await runPool(targets, fetchCreatorAvatar, CONCURRENCY) : [];

  let ok = 0;
  let overrideCount = 0;
  let wikiCount = 0;
  let bingCount = 0;
  let unavatarCount = 0;
  let fallback = 0;
  const failures = [];

  for (const result of results) {
    if (result.rejections?.length) {
      for (const r of result.rejections) {
        console.log(`  ⊘ ${result.username}: rejected ${r.url?.slice(0, 90)} — ${r.reason}`);
      }
    }

    if (result.ok) {
      ok++;
      if (result.source === "override") overrideCount++;
      else if (result.source === "wikipedia") wikiCount++;
      else if (result.source === "bing") bingCount++;
      else if (result.source === "unavatar") unavatarCount++;
      else fallback++;

      const tag = result.fallback ? " [fallback]" : "";
      console.log(`✓ ${result.username} (${result.size}b, ${result.source})${tag}`);
    } else {
      failures.push(result);
      console.error(`✗ ${result.username}: all sources failed`);
    }
  }

  for (const creator of seedData) {
    creator.avatar_url = `/avatars/${creator.username}.jpg`;
  }
  fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2) + "\n");

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\nDone in ${elapsed}s: ${ok}/${targets.length} fetched (${overrideCount} override, ${wikiCount} wiki, ${bingCount} bing, ${unavatarCount} unavatar, ${fallback} dicebear), ${failures.length} failed, ${seedData.length - targets.length} cached`
  );
  process.exit(failures.length > 0 ? 1 : 0);
}

main();
