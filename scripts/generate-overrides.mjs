import fs from "node:fs";

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
  danniiharwood: "Danni_Harwood",
  ariellaferrera: "Ariella_Ferrera",
  projektmelody: "Projekt_Melody",
  filian: "Filian_(streamer)",
};

function wikiLarge(url) {
  return url.replace(/\/thumb\/(.+)\/\d+px-[^/]+$/, "/$1");
}

async function fetchWikiImage(title) {
  const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800&pilicense=any`;
  const res = await fetch(api, { headers: { "User-Agent": "of-ranking/1.0" } });
  const text = await res.text();
  if (text.startsWith("You are")) return null;
  const data = JSON.parse(text);
  const page = Object.values(data.query?.pages || {})[0];
  if (page?.missing || !page?.thumbnail?.source) return null;
  return wikiLarge(page.thumbnail.source);
}

const overrides = {
  _comment: "Verified portrait URLs. Wikipedia/Wikimedia preferred; unavatar uses public social profile photos.",
  corinnakopf: {
    url: "https://unavatar.io/twitch/corinnakopf",
    source: "Twitch public profile photo via unavatar.io",
  },
  sophieraiin: {
    url: "https://unavatar.io/tiktok/sophieraiin",
    source: "TikTok public profile photo via unavatar.io",
  },
};

for (const [username, title] of Object.entries(WIKI_TITLES)) {
  if (overrides[username]) continue;
  await new Promise((r) => setTimeout(r, 350));
  const url = await fetchWikiImage(title);
  if (url) {
    overrides[username] = { url, source: `Wikipedia — ${title.replace(/_/g, " ")}` };
    console.log(`+ ${username}`);
  } else {
    console.log(`- ${username}`);
  }
}

fs.writeFileSync("data/avatar-overrides.json", JSON.stringify(overrides, null, 2) + "\n");
console.log(`\nWrote ${Object.keys(overrides).length - 1} overrides`);
