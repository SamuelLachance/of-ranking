/**
 * Shared avatar research utilities for build-avatar-overrides and fetch-avatars.
 */
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const MIN_BYTES = 20 * 1024;
export const MIN_BYTES_TRUSTED = 5 * 1024;

export const URL_REJECT =
  /cartoon|anime|illustration|clipart|logo|favicon|placeholder|coloring|minecraft|dobrik|gollum|group.?photo|class.?photo|school.?children|children.?class|armbruster|limoandhearse|pinimg\.com/i;

export const TRUSTED_HOST =
  /(?:^|\.)unavatar\.io$|(?:^|\.)wikimedia\.org$|(?:^|\.)wikipedia\.org$/i;

/** Pre-verified Wikimedia portrait URLs (no API needed) */
export const KNOWN_PORTRAITS = {
  amouranth: {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Amouranth_at_DreamHack_Atlanta_2024.jpg",
    source: "Wikipedia — Amouranth",
  },
  bellathorne: {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Bella_Thorne_OnlyFans_3.jpg",
    source: "Wikipedia — Bella Thorne",
  },
  realbhadbhabie: {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Bhad_Bhabie_passport.jpg",
    source: "Wikipedia — Bhad Bhabie",
  },
  iggyazalea: {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/93/Iggy_Azalea%2C_Main_Stage_EXIT_Festival_2022_1_%28cropped2%29.jpg",
    source: "Wikipedia — Iggy Azalea",
  },
  tanamongeau: {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Tana_Mongeau_in_Six_Feet_Above_podcast_02-24_-_2.png",
    source: "Wikipedia — Tana Mongeau",
  },
  miakhalifa: {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Mia_Khalifa_in_2019.png",
    source: "Wikipedia — Mia Khalifa",
  },
  carmenelectra: {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Carmen_Electra_2013.jpg",
    source: "Wikipedia — Carmen Electra",
  },
  tyga: {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/98/Tyga_-_Openair_Frauenfeld_2019_02.jpg",
    source: "Wikipedia — Tyga",
  },
  denisersichards: {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/19/Denise_Richards_and_Kellie_Martin_2012_%28cropped%29.jpg",
    source: "Wikipedia — Denise Richards",
  },
  rubirose: {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Rubi_Rose.jpg",
    source: "Wikipedia — Rubi Rose",
  },
  anitta: {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Anitta_for_Attractive_Mindset_podcast_02.jpg",
    source: "Wikipedia — Anitta (singer)",
  },
  sophieraiin: {
    url: "https://unavatar.io/tiktok/sophieraiin",
    source: "TikTok @sophieraiin via unavatar.io",
  },
  corinnakopf: {
    url: "https://unavatar.io/twitch/corinnakopf",
    source: "Twitch @corinnakopf via unavatar.io",
  },
};

/** Wikipedia page titles for API lookup */
export const WIKI_TITLES = {
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
  piamia: "Pia_Mia",
  samisheen: "Sami_Sheen",
  keyalves: "Key_Alves",
  "tatizaqui.ofc": "Tati_Zaqui",
  shannakress: "Shanna_Kress",
  siljeofficial: "Silje_Norendal",
  kazumisworld: "Kazumi_(actress)",
  solazola: "Solazola",
  quqco: "Quqco",
  buffpup: "Buffpup",
  mcmirella: "MC_Mirella",
  astridnelsia: "Astrid_Nelsia",
  romimalaspina: "Romina_Malaspina",
  paolhard: "Paola_Hard",
  lynaritaa: "Lyna_Perez",
};

/** Preferred unavatar platform per creator username */
export const UNAVATAR_PLATFORM = {
  sophieraiin: "tiktok",
  corinnakopf: "twitch",
  amouranth: "twitch",
  neekolul: "twitch",
  ironmouse: "twitch",
  filian: "twitch",
  projektmelody: "twitch",
  f1nn5ter: "twitch",
  hannahowo: "twitter",
  peachjars: "twitch",
  morgpie: "twitch",
  indiefoxx: "twitch",
  buffpup: "twitch",
  quqco: "twitch",
  gracecharis: "youtube",
  megnutt02: "tiktok",
  skylarmaexo: "tiktok",
  bonnieblue: "twitter",
  faithlianne: "instagram",
  lilianaheartsss: "instagram",
  sommerray: "instagram",
  jordynwoods: "instagram",
  camillaxaraujo: "instagram",
  salicerose: "instagram",
  katyaelisehenrysworld: "instagram",
  cintiacossio: "instagram",
  keyalves: "instagram",
  "tatizaqui.ofc": "instagram",
  mcmirella: "instagram",
  astridnelsia: "instagram",
  romimalaspina: "instagram",
};

/** Social handles when they differ from OF username */
export const SOCIAL_HANDLES = {
  sophieraiin: { tiktok: "sophieraiin" },
  corinnakopf: { twitch: "corinnakopf" },
  whitney: { twitter: "whitneycummings" },
  lilyallenftse500: { twitter: "lilyallen" },
  coco: { instagram: "coco" },
  iamcardib: { twitter: "iamcardib" },
  bellathorneoff: { instagram: "bellathorne" },
  carmenelectravip: { instagram: "carmenelectra" },
  djkhaledandfatjoe: { twitter: "djkhaled" },
  "tatizaqui.ofc": { instagram: "tatizaqui" },
  francety: { instagram: "francety" },
  misslavoie: { instagram: "misslavoie" },
  georginnalatinaa: { instagram: "georginnalatinaa" },
  victoryaxo: { instagram: "victoryaxo" },
  misstiff: { instagram: "misstiff" },
  gem101: { instagram: "gem101uk" },
  piamia: { instagram: "piamia" },
  samisheen: { instagram: "samisheen" },
  elenakamperi: { instagram: "elenakamperi" },
  "juli.annee": { instagram: "juli.annee" },
  lynaritaa: { instagram: "lynaritaa" },
  paolhard: { instagram: "paolhard" },
  kazumisworld: { twitter: "kazumisworld" },
  cobie: { twitter: "cobiesmolders" },
  waifumiia: { twitter: "waifumiia" },
  littlepuck: { twitter: "littlepuck" },
  mewslut: { twitter: "mewslut" },
  meowriza: { twitter: "meowriza" },
};

export const USERNAME_REJECT = {
  corinnakopf: /dobrik|david/i,
  sophieraiin: /cartoon|minecraft|coloring|school|children|anime/i,
  djkhaledandfatjoe: /fat.?joe/i,
};

export function wikiThumbToLarge(url) {
  return url.replace(/\/thumb\/(.+)\/\d+px-[^/]+$/, "/$1");
}

export function dicebearUrl(username) {
  return `https://api.dicebear.com/7.x/initials/jpeg?seed=${encodeURIComponent(username)}&size=400&backgroundColor=ec4899,8b5cf6`;
}

export function isTrustedUrl(url) {
  try {
    return TRUSTED_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function isTrustedWikimedia(url) {
  return /wikimedia\.org|wikipedia\.org/i.test(url);
}

export function readImageDimensions(buffer) {
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

export function validateImageBuffer(buffer, url, username, { trusted = false, relaxed = false } = {}) {
  const minBytes = trusted && isTrustedWikimedia(url) ? MIN_BYTES_TRUSTED : MIN_BYTES;

  if (!relaxed && buffer.length < minBytes) {
    return { ok: false, reason: `too small (${buffer.length}b, min ${minBytes}b)` };
  }

  const lower = url.toLowerCase();
  if (!trusted && URL_REJECT.test(lower)) {
    return { ok: false, reason: "URL matches reject pattern" };
  }

  const userReject = USERNAME_REJECT[username];
  if (userReject?.test(lower)) {
    return { ok: false, reason: "URL blocked for this creator" };
  }

  if (!trusted && !relaxed) {
    const dims = readImageDimensions(buffer);
    if (dims?.width && dims?.height) {
      if (dims.width > dims.height * 1.4) {
        return { ok: false, reason: `landscape ratio ${dims.width}x${dims.height}` };
      }
    }
  }

  return { ok: true };
}

export function unavatarCandidates(username) {
  const preferred = UNAVATAR_PLATFORM[username];
  const handles = SOCIAL_HANDLES[username] ?? {};
  const platforms = ["twitter", "instagram", "tiktok", "youtube", "twitch"];
  const seen = new Set();
  const urls = [];

  const add = (platform, handle) => {
    const key = `${platform}:${handle}`;
    if (seen.has(key)) return;
    seen.add(key);
    urls.push({
      url: `https://unavatar.io/${platform}/${encodeURIComponent(handle)}`,
      source: `${platform} @${handle} via unavatar.io`,
    });
  };

  if (preferred) add(preferred, handles[preferred] ?? username);
  for (const [platform, handle] of Object.entries(handles)) add(platform, handle);
  for (const p of platforms) add(p, username);

  return urls;
}

export async function fetchWikipediaImage(username) {
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
    return {
      url: wikiThumbToLarge(page.thumbnail.source),
      source: `Wikipedia — ${title.replace(/_/g, " ")}`,
    };
  } catch {
    return null;
  }
}

export async function fetchWikimediaCommonsImage(name) {
  try {
    const search = `"${name}" portrait`;
    const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json`;
    const res = await fetch(api, { headers: { "User-Agent": "of-ranking-avatar-fetch/1.0" } });
    const data = await res.json();
    const pages = data.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      const info = page.imageinfo?.[0];
      if (!info?.url) continue;
      const mime = info.mime ?? "";
      if (!/^image\/(jpeg|png|webp)$/i.test(mime)) continue;
      if (/logo|icon|flag|map|signature/i.test(info.url)) continue;
      return {
        url: info.url,
        source: `Wikimedia Commons — ${page.title?.replace(/^File:/, "") ?? name}`,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function probeImageUrl(url, username, { trusted = false, retries = 4 } = {}) {
  try {
    let res;
    for (let attempt = 0; attempt < retries; attempt++) {
      res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept: "image/*,*/*",
          Referer: new URL(url).origin + "/",
        },
        redirect: "follow",
      });

      if (res.status === 429 && attempt < retries - 1) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      break;
    }

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!/^image\/(jpeg|png|webp)$/i.test(contentType)) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const finalUrl = res.url || url;
    const isTrusted = trusted || isTrustedUrl(finalUrl) || isTrustedWikimedia(finalUrl);
    const validation = validateImageBuffer(buffer, finalUrl, username, {
      trusted: isTrusted && isTrustedWikimedia(finalUrl),
    });
    if (!validation.ok) return null;

    return { url: finalUrl, size: buffer.length, buffer };
  } catch {
    return null;
  }
}

export function loadExistingOverrides(overridesPath) {
  if (!fs.existsSync(overridesPath)) return {};
  const raw = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
  const { _comment, ...rest } = raw;
  return rest;
}

export function loadSeedData(seedPath) {
  return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
}
