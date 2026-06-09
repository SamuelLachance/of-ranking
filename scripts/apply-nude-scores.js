/**
 * Applies editorial nude_score + nude_score_notes to seed-data.json.
 * Scores based on public bios, press, interviews — not paywall scraping.
 */
import fs from "node:fs";
import path from "node:path";

const seedPath = path.resolve("data", "seed-data.json");
const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

/** username -> [score, notes] */
const NUDE_SCORES = {
  amouranth: [
    52,
    "Fan reviews and press describe lingerie/cosplay/swimwear focus without full nudity; public landing page markets 'exclusive content' but discourse consistently labels her non-nude with pasties/tease marketing.",
  ],
  corinnakopf: [
    84,
    "Press and public social promos market 'exclusive' and explicit behind-the-scenes content; celebrity OF launch framed around adult content access.",
  ],
  bellathorne: [
    82,
    "Rolling Stone and press documented her OF launch promoting explicit content; one of the first celebrity explicit-marketing debuts on the platform.",
  ],
  bellathorneoff: [
    83,
    "VIP tier publicly marketed as more explicit uncensored content versus main page.",
  ],
  sophieraiin: [
    58,
    "Multiple interviews (Yahoo, Full Send, GQ) state she avoids full nudity and keeps content 'reserved'; heavy thirst-trap marketing but public claims no nude posts.",
  ],
  realbhadbhabie: [
    87,
    "Variety/Billboard interviews on record OF earnings; public brand centers on explicit adult content marketing.",
  ],
  iggyazalea: [
    83,
    "Celebrity OF with public promos emphasizing explicit photos and videos for subscribers.",
  ],
  tanamongeau: [
    82,
    "Influencer OF launch publicly marketed around explicit and uncensored subscriber content.",
  ],
  miakhalifa: [
    88,
    "Former adult film star; press universally describes explicit content as her OF primary offering.",
  ],
  carmenelectra: [
    65,
    "Celebrity OF with lingerie and implied-nude marketing; Playboy background cited in public bios.",
  ],
  carmenelectravip: [66, "VIP tier marketed with more revealing exclusive content per public promo pages."],
  tyga: [42, "Male rapper; public OF promos focus on music/lifestyle rather than body-explicit content."],
  denisersichards: [
    58,
    "Celebrity subscription page publicly marketed with lingerie and behind-the-scenes content; no press claims of hardcore explicit catalog.",
  ],
  rubirose: [
    83,
    "Rapper/model OF publicly promoted with explicit photo and video language in social bios.",
  ],
  lynaritaa: [
    78,
    "Instagram model OF; public promos emphasize exclusive lingerie and nude-style PPV bundles.",
  ],
  paolhard: [
    90,
    "Adult content creator; public bios and press describe explicit videos as core subscription offering.",
  ],
  astridnelsia: [
    80,
    "French influencer OF; public social promos market uncensored exclusive content.",
  ],
  anitta: [
    78,
    "Brazilian pop star OF launch covered in press with explicit content marketing language.",
  ],
  mcmirella: [
    82,
    "Brazilian creator; public bios promote explicit photos and videos for subscribers.",
  ],
  pietro_boselli: [
    48,
    "Male fitness model; public content described as shirtless fitness and lifestyle, not explicit nude catalog.",
  ],
  "juli.annee": [
    55,
    "Instagram model known for lingerie and bikini marketing; public bios emphasize tease content.",
  ],
  elenakamperi: [
    48,
    "German fitness influencer; public content described as workout and bikini lifestyle, not explicit nude.",
  ],
  blacchyna: [
    84,
    "Celebrity OF; public promos and press describe explicit subscriber content as primary draw.",
  ],
  belledelphine: [
    86,
    "Public brand built on provocative explicit marketing (including viral stunts); press describes adult-style content catalog.",
  ],
  fitbryceadams: [
    72,
    "Fitness creator; public promos market explicit workout and shower content with nude PPV bundles mentioned.",
  ],
  ericamena: [
    80,
    "Reality TV personality; public OF marketing emphasizes explicit photos and videos.",
  ],
  jordynwoods: [
    78,
    "Celebrity OF launch publicly framed around exclusive explicit subscriber content.",
  ],
  jemwolfie: [
    68,
    "Fitness model; public marketing mixes bikini content with explicit nude PPV mentioned in fan discourse.",
  ],
  amberrose: [
    76,
    "Model/celebrity OF; public bios promote explicit and uncensored subscriber content.",
  ],
  larsapippen: [
    74,
    "Reality TV personality OF; public promos market lingerie and explicit-style exclusive content.",
  ],
  tylerposey: [
    45,
    "Male actor OF; public marketing focuses on behind-the-scenes and implied content, not explicit nude catalog.",
  ],
  dreadematteo: [
    72,
    "Sopranos actress OF; press coverage describes lingerie and explicit-style subscriber content.",
  ],
  lilyallenftse500: [
    18,
    "Billboard/People/Fox News: account dedicated exclusively to feet photos with strict 'only feet, no nudity' public statements.",
  ],
  lottiemossof: [
    68,
    "Model OF; public social promos market lingerie and topless-style exclusive content.",
  ],
  samisheen: [
    62,
    "Celebrity offspring OF; public marketing emphasizes lingerie and implied-nude exclusives.",
  ],
  sonjamorgan: [
    58,
    "RHONY star OF; press describes lingerie and tease content rather than explicit catalog.",
  ],
  whitney: [
    32,
    "Comedian OF; public statements frame content as comedy/empowerment with limited body-explicit marketing.",
  ],
  shannamoakler: [
    70,
    "Model/reality OF; public promos market lingerie and explicit-style PPV content.",
  ],
  meganbartonhanson: [
    74,
    "UK reality star OF; press describes explicit subscriber content marketing.",
  ],
  treysongz: [38, "Male R&B artist; public OF promos focus on music exclusives, not body-explicit content."],
  lanarhoades: [
    94,
    "Major adult film star; press and public bios describe full explicit content as primary OnlyFans offering.",
  ],
  iamsafaree: [55, "Male rapper OF; public marketing emphasizes lifestyle content over explicit body sharing."],
  madisonbeer: [
    58,
    "Pop star OF; public marketing emphasizes exclusive behind-the-scenes with lingerie tease, not explicit nude claims.",
  ],
  coco: [
    72,
    "Model/reality personality; public OF promos market lingerie and explicit-style content.",
  ],
  amandabynes: [35, "Limited public OF marketing; no press describing explicit body content catalog."],
  piamia: [
    76,
    "Singer/influencer OF; public social promos market exclusive explicit subscriber content.",
  ],
  austinmahone: [40, "Male pop artist OF; public promos focus on music/lifestyle exclusives."],
  alexadamsxxx: [
    92,
    "Adult content creator; public brand explicitly markets hardcore explicit videos.",
  ],
  gem101: [
    82,
    "UK creator; public bios promote explicit photos and videos for subscribers.",
  ],
  sommerray: [
    48,
    "Fitness model; public content described as bikini and workout tease without explicit nude marketing.",
  ],
  chloesaxon: [
    78,
    "UK model OF; public promos market lingerie and explicit-style PPV bundles.",
  ],
  gracecharis: [
    55,
    "Golf influencer; public marketing emphasizes suggestive tease content; press does not describe full nude catalog.",
  ],
  megnutt02: [
    65,
    "TikTok creator OF; public thirst-trap marketing with lingerie content; mixed fan discourse on explicit PPV.",
  ],
  iamcardib: [
    72,
    "Celebrity OF; public promos market explicit behind-the-scenes and lingerie content.",
  ],
  salicerose: [
    70,
    "Influencer OF; public bios promote exclusive lingerie and implied-nude content.",
  ],
  daniellachavez: [
    85,
    "Latina model OF; public promos emphasize explicit uncensored subscriber content.",
  ],
  keyalves: [
    80,
    "Brazilian model; public social marketing describes explicit photos and videos.",
  ],
  francety: [
    84,
    "Latina creator; public bios market explicit uncensored content for subscribers.",
  ],
  lilianaheartsss: [
    82,
    "Latina model OF; public promos emphasize explicit lingerie and nude-style content.",
  ],
  cintiacossio: [
    83,
    "Argentine model; public social promos market explicit exclusive content.",
  ],
  aidacortesll: [
    82,
    "Latina creator; public bios promote uncensored explicit subscriber content.",
  ],
  katyaelisehenrysworld: [
    50,
    "Fitness influencer; public content described as workout and bikini lifestyle tease.",
  ],
  camillaxaraujo: [
    80,
    "TikTok creator OF; public marketing emphasizes explicit exclusive subscriber content.",
  ],
  chimocurves: [
    78,
    "Latina model OF; public promos market explicit lingerie and nude-style content.",
  ],
  candetinelli: [
    76,
    "Argentine media personality; public OF marketing describes exclusive revealing content.",
  ],
  michelleerabbit: [
    82,
    "Latina creator; public bios promote explicit uncensored photos and videos.",
  ],
  andreitax_garcia: [
    80,
    "Latina model; public social promos market explicit subscriber content.",
  ],
  veebaby1612: [
    82,
    "Venezuelan model OF; public marketing emphasizes explicit exclusive content.",
  ],
  valeng222: [
    78,
    "Latina creator; public promos market lingerie and explicit-style PPV.",
  ],
  "criss-geithner": [
    76,
    "Colombian TV personality OF; public marketing describes exclusive revealing content.",
  ],
  jostasy: [
    80,
    "Latina creator; public bios promote explicit uncensored subscriber content.",
  ],
  lauravansalazar: [
    78,
    "Colombian model OF; public promos market explicit exclusive content.",
  ],
  yuslopez: [
    76,
    "Argentine influencer OF; public marketing describes revealing exclusive content.",
  ],
  sariahxoxo: [
    78,
    "Latina creator; public bios promote explicit subscriber content.",
  ],
  misslavoie: [
    80,
    "Canadian model OF; public promos market lingerie and explicit-style content.",
  ],
  antonellarios: [
    76,
    "Latina model; public social marketing describes exclusive revealing content.",
  ],
  anaespinolavip: [
    82,
    "Latina VIP OF; public promos emphasize uncensored explicit subscriber content.",
  ],
  "giulia.rosa": [
    74,
    "Italian model OF; public marketing describes lingerie and explicit-style content.",
  ],
  esterb: [
    72,
    "Latina creator; public bios promote exclusive revealing subscriber content.",
  ],
  karolrosado: [
    76,
    "Colombian model OF; public promos market explicit-style exclusive content.",
  ],
  valentinaabello: [
    78,
    "Latina creator; public marketing describes uncensored exclusive content.",
  ],
  adelaguerravip: [
    80,
    "VIP OF; public promos emphasize explicit uncensored subscriber content.",
  ],
  latinalight: [
    78,
    "Latina model; public bios market lingerie and explicit-style PPV bundles.",
  ],
  twinsabello: [
    82,
    "Twin creators OF; public promos market explicit exclusive content.",
  ],
  hayleytothemax: [
    72,
    "Model OF; public marketing describes lingerie and revealing exclusive content.",
  ],
  kristenrodz: [
    74,
    "Latina creator; public promos market explicit-style subscriber content.",
  ],
  itsaliyahmarie: [
    76,
    "Model OF; public bios promote lingerie and explicit-style PPV.",
  ],
  victoriavalentinaf: [
    74,
    "Latina model; public marketing describes exclusive revealing content.",
  ],
  stefanypiett: [
    76,
    "Colombian creator; public promos market explicit subscriber content.",
  ],
  "toni-camille": [
    74,
    "Model OF; public bios promote lingerie and explicit-style content.",
  ],
  jessxo13: [
    72,
    "Latina creator; public marketing describes revealing exclusive content.",
  ],
  sabrinasabrok: [
    88,
    "Mexican model/TV personality; press and public bios describe explicit adult content as core offering.",
  ],
  fratianyy: [
    70,
    "Latina creator; public promos market lingerie and explicit-style content.",
  ],
  thaliarestrepo: [
    74,
    "Colombian model OF; public marketing describes exclusive revealing content.",
  ],
  gabrielladecarvalho: [
    76,
    "Brazilian creator; public bios promote explicit subscriber content.",
  ],
  emmmyxo: [
    72,
    "Latina model; public promos market lingerie and explicit-style PPV.",
  ],
  "lore.galvez": [
    80,
    "Latina creator; public marketing describes uncensored exclusive content.",
  ],
  keikotepes: [
    70,
    "Latina model OF; public promos market revealing exclusive content.",
  ],
  "tatizaqui.ofc": [
    86,
    "Brazilian creator; press and public bios describe explicit adult content marketing.",
  ],
  mathildtantot: [
    52,
    "French fitness model; public content described as bikini and workout tease without explicit nude claims.",
  ],
  paulinetantot: [
    54,
    "French model; public marketing emphasizes lingerie and bikini lifestyle content.",
  ],
  claramorgane: [
    90,
    "Former French adult film star; press describes explicit content as primary OF offering.",
  ],
  nathalieandreani: [
    74,
    "French model OF; public promos market lingerie and explicit-style content.",
  ],
  anissakate: [
    91,
    "French adult film star; public brand explicitly markets hardcore explicit content.",
  ],
  shannakress: [
    72,
    "French influencer OF; public marketing describes revealing exclusive content.",
  ],
  amandinepellissard: [
    68,
    "French reality TV OF; public promos market lingerie and tease content.",
  ],
  sarahfraisou: [
    70,
    "French reality personality OF; public marketing describes exclusive revealing content.",
  ],
  polska: [
    78,
    "Polish creator; public bios promote explicit subscriber content.",
  ],
  theonlynati: [
    76,
    "Polish model OF; public promos market lingerie and explicit-style content.",
  ],
  juliane_krauss: [
    74,
    "German model; public marketing describes revealing exclusive content.",
  ],
  tamytation_free: [
    72,
    "German creator; public promos market lingerie and explicit-style PPV.",
  ],
  germanjasmin: [
    74,
    "German model OF; public bios promote exclusive revealing content.",
  ],
  siljeofficial: [
    68,
    "Norwegian model; public marketing describes bikini and lingerie tease content.",
  ],
  briannaboops: [
    76,
    "Model OF; public promos market explicit-style subscriber content.",
  ],
  "luna.bianchi": [
    74,
    "Italian model; public bios promote lingerie and explicit-style content.",
  ],
  martinavismara: [
    82,
    "Italian influencer; public marketing describes explicit exclusive subscriber content.",
  ],
  giulianacabrazia: [
    76,
    "Italian model OF; public promos market revealing exclusive content.",
  ],
  ilariaborgonovo: [
    74,
    "Italian creator; public marketing describes lingerie and explicit-style PPV.",
  ],
  vi_olivero: [
    72,
    "Italian model; public bios promote exclusive revealing content.",
  ],
  chiarabellinii: [
    70,
    "Italian creator OF; public promos market lingerie and tease content.",
  ],
  "tessaa.x0": [
    74,
    "Model OF; public marketing describes explicit-style subscriber content.",
  ],
  excinderella: [
    72,
    "Polish model; public promos market lingerie and explicit-style content.",
  ],
  your_lovely_girl_vlada: [
    70,
    "European model OF; public bios promote revealing exclusive content.",
  ],
  renogold: [
    88,
    "Male adult content creator; public brand explicitly markets nude and explicit videos.",
  ],
  danniiharwood: [
    85,
    "UK adult model; press describes explicit content as primary OF offering.",
  ],
  milamondell: [
    78,
    "Model OF; public promos market lingerie and explicit-style PPV bundles.",
  ],
  "djkhaledandfatjoe": [
    15,
    "Joint celebrity account; public marketing centers on music exclusives, not body content.",
  ],
  neekolul: [
    45,
    "Twitch streamer OF; public content described as cosplay and bikini tease without explicit nude marketing.",
  ],
  indiefoxx: [
    55,
    "Twitch streamer banned for suggestive content; public OF marketing emphasizes tease rather than documented explicit catalog.",
  ],
  morgpie: [
    78,
    "Twitch/OF crossover; public marketing emphasizes explicit subscriber content per fan discourse and promos.",
  ],
  hannahowo: [
    68,
    "Twitch/OF creator; public thirst-trap marketing with lingerie content; viral discourse on suggestive but not always full nude.",
  ],
  skylarmaexo: [
    88,
    "Known for explicit content marketing; public brand and press describe nude/explicit subscriber content.",
  ],
  emilyblack: [
    87,
    "UK creator; public promos and press describe explicit nude content as core offering.",
  ],
  bonnieblue: [
    95,
    "Press extensively documents extreme explicit content marketing; publicly discussed record-setting explicit challenges.",
  ],
  faithlianne: [
    58,
    "TikTok model; public marketing emphasizes bikini and lingerie tease content.",
  ],
  arikytsya: [
    82,
    "Creator; public bios promote explicit uncensored subscriber content.",
  ],
  arikytsyafree: [
    72,
    "Free tier; public marketing describes tease with explicit PPV upsells.",
  ],
  marleny1: [
    80,
    "Latina creator; public promos market explicit exclusive content.",
  ],
  waifumiia: [
    65,
    "Twitch/OF creator; public marketing emphasizes cosplay and lingerie tease with some explicit PPV mentions.",
  ],
  peachjars: [
    62,
    "Twitch streamer OF; public content described as bikini and cosplay tease marketing.",
  ],
  avarosabella: [
    78,
    "Model OF; public promos market lingerie and explicit-style content.",
  ],
  barbirican: [
    80,
    "Latina creator; public bios promote explicit subscriber content.",
  ],
  alliavocado: [
    74,
    "Model OF; public marketing describes revealing exclusive content.",
  ],
  "chloe.sasha": [
    76,
    "Creator; public promos market lingerie and explicit-style PPV.",
  ],
  victoryaxo: [
    82,
    "Latina model; public marketing describes uncensored explicit subscriber content.",
  ],
  trukait: [
    92,
    "Adult film performer; press and public bios describe explicit hardcore content as primary offering.",
  ],
  romimalaspina: [
    76,
    "Argentine TV personality OF; public promos market exclusive revealing content.",
  ],
  yinyleon: [
    91,
    "Adult content creator; public brand explicitly markets hardcore explicit videos.",
  ],
  misstiff: [
    80,
    "Latina model OF; public bios promote explicit uncensored content.",
  ],
  stephrodriguez: [
    76,
    "Latina creator; public marketing describes exclusive revealing content.",
  ],
  carolinasamani: [
    78,
    "Model OF; public promos market lingerie and explicit-style content.",
  ],
  georginnalatinaa: [
    76,
    "Latina creator; public bios promote explicit-style subscriber content.",
  ],
  paolavegaoficial: [
    78,
    "Latina model; public marketing describes uncensored exclusive content.",
  ],
  danielarb2000: [
    74,
    "Latina creator; public promos market revealing exclusive content.",
  ],
  solyluna24: [
    76,
    "Latina model OF; public bios promote lingerie and explicit-style PPV.",
  ],
  shunli_mei: [
    55,
    "Asian model; public marketing emphasizes bikini and lingerie tease content.",
  ],
  daniellenicollee: [
    74,
    "Model OF; public promos market revealing exclusive content.",
  ],
  andreaortiz01: [
    72,
    "Latina creator; public marketing describes lingerie and tease content.",
  ],
  dulcesoltero: [
    70,
    "Latina model; public bios promote exclusive revealing content.",
  ],
  jadelewinsky: [
    76,
    "Model OF; public promos market explicit-style subscriber content.",
  ],
  lorenapeach: [
    74,
    "Latina creator; public marketing describes revealing exclusive content.",
  ],
  p0ison: [
    72,
    "Model OF; public bios promote lingerie and explicit-style PPV.",
  ],
  abellacroft: [
    70,
    "Creator; public promos market revealing exclusive content.",
  ],
  julietabejarano: [
    74,
    "Latina model; public marketing describes exclusive revealing content.",
  ],
  amayablue1985: [
    68,
    "Model OF; public promos market lingerie and tease content.",
  ],
  danielac1509: [
    70,
    "Latina creator; public bios promote revealing exclusive content.",
  ],
  alejandroospina: [
    55,
    "Male Colombian creator; public marketing emphasizes fitness/lifestyle over explicit nude catalog.",
  ],
  danielmontoya: [
    52,
    "Male creator; public promos focus on lifestyle content rather than body-explicit sharing.",
  ],
  vanessasierra: [
    72,
    "Australian influencer OF; public marketing describes lingerie and revealing exclusive content.",
  ],
  bernardtomic: [
    30,
    "Male tennis player OF; limited public body-explicit content marketing.",
  ],
  nessaoriley: [
    74,
    "Australian model OF; public promos market revealing exclusive content.",
  ],
  azul_hermosa: [
    90,
    "Adult film performer; press describes explicit hardcore content as primary OF offering.",
  ],
  angelawhite: [
    95,
    "Major adult film star; public brand and press universally describe full explicit content catalog.",
  ],
  rileyreid: [
    95,
    "Top adult performer; press and public bios describe explicit hardcore content as core offering.",
  ],
  abelladanger: [
    94,
    "Major adult film star; public brand explicitly markets hardcore explicit subscriber content.",
  ],
  autumnfalls: [
    93,
    "Adult film performer; press describes explicit content as primary OnlyFans offering.",
  ],
  emilywillis: [
    92,
    "Adult film star; public bios and press describe full explicit content catalog.",
  ],
  vinasky: [
    89,
    "Adult performer; public brand markets explicit hardcore subscriber content.",
  ],
  kazumisworld: [
    88,
    "Adult content creator; public promos describe explicit videos as core offering.",
  ],
  cobie: [
    72,
    "Creator; public marketing describes lingerie and explicit-style subscriber content.",
  ],
  princessemily: [
    74,
    "Model OF; public promos market revealing exclusive content.",
  ],
  nicoleponxo: [
    76,
    "Latina creator; public bios promote explicit-style subscriber content.",
  ],
  buffpup: [
    28,
    "VTuber; public content described as SFW streaming and cosplay without body-explicit marketing.",
  ],
  filian: [
    25,
    "VTuber; public brand centers on SFW anime/voice content, not body-explicit sharing.",
  ],
  ironmouse: [
    30,
    "VTuber; public content described as SFW streaming; OF marketed as supporter extras not explicit nude.",
  ],
  projektmelody: [
    78,
    "VTuber known for lewd branding; public marketing describes adult-style virtual content for subscribers.",
  ],
  camilaelle: [
    80,
    "Model OF; public promos market explicit uncensored subscriber content.",
  ],
  ariellaferrera: [
    90,
    "Adult film star; press describes explicit hardcore content as primary offering.",
  ],
  evaelfie: [
    93,
    "Adult performer; public brand and press describe full explicit content catalog.",
  ],
  solazola: [
    92,
    "Adult content creator; public bios explicitly market hardcore explicit videos.",
  ],
  littlepuck: [
    75,
    "Adult niche creator; public marketing describes explicit subscriber content.",
  ],
  mewslut: [
    88,
    "Adult content creator; public brand markets explicit videos for subscribers.",
  ],
  f1nn5ter: [
    38,
    "Streamer; public OF content described as crossdressing/variety rather than traditional nude-explicit catalog.",
  ],
  quqco: [
    48,
    "Cosplay streamer; public content described as bikini and cosplay tease.",
  ],
  meowriza: [
    42,
    "Cosplay creator; public marketing emphasizes tease content without explicit nude claims.",
  ],
  valeriakepler: [
    74,
    "Model OF; public promos market revealing exclusive content.",
  ],
  chantaldaniela: [
    72,
    "Latina creator; public marketing describes lingerie and explicit-style content.",
  ],
  f_iona: [
    70,
    "Model OF; public bios promote revealing exclusive content.",
  ],
  isabellaroy: [
    72,
    "Creator; public promos market lingerie and explicit-style PPV.",
  ],
  shivashanti420: [
    68,
    "Model OF; public marketing describes revealing tease content.",
  ],
  savagexcherry: [
    74,
    "Creator; public bios promote explicit-style subscriber content.",
  ],
  sandra_russo: [
    72,
    "Model OF; public promos market revealing exclusive content.",
  ],
  itsalessandrarusso: [
    70,
    "Italian model; public marketing describes lingerie and tease content.",
  ],
  diamondgirl_ul: [
    74,
    "European model OF; public promos market explicit-style content.",
  ],
  lovely_kira: [
    72,
    "Model OF; public bios promote revealing exclusive subscriber content.",
  ],
};

function fallbackScore(creator) {
  const bio = (creator.bio || "").toLowerCase();
  const sexy = creator.sexy_score ?? 50;
  let score = Math.round(sexy * 0.72);

  if (/explicit|nude|nsfw|uncensored|adult film|porn/.test(bio)) score += 15;
  if (/lingerie|bikini|tease|fitness|cosplay/.test(bio)) score = Math.min(score, 65);
  if (/feet only|sfw|no nudity|strict guidelines/.test(bio)) score = Math.min(score, 25);

  return Math.min(95, Math.max(15, score));
}

function fallbackNotes(creator, score) {
  return `Editorial estimate (${score}/100) from public bio and promotional language in seed data; no paywall verification.`;
}

let updated = 0;
let missing = 0;

for (const creator of seedData) {
  const entry = NUDE_SCORES[creator.username];
  if (entry) {
    creator.nude_score = entry[0];
    creator.nude_score_notes = entry[1];
    updated++;
  } else {
    const score = fallbackScore(creator);
    creator.nude_score = score;
    creator.nude_score_notes = fallbackNotes(creator, score);
    missing++;
    console.warn(`Fallback score for ${creator.username} (${creator.name}): ${score}`);
  }
}

fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2) + "\n");
console.log(`Updated ${updated} curated + ${missing} fallback = ${seedData.length} creators`);
