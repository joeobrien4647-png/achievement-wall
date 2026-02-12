import { GRADIENT_PRESETS, TYPE_COLORS } from "./schema";

/**
 * ~55 suggested challenges for the bucket list.
 * Each is a full event object with status: "wishlist".
 * Static IDs (wish-xxx) allow duplicate detection during merge.
 */

const G = GRADIENT_PRESETS;
const now = new Date().toISOString();

function wish(id, name, category, opts) {
  const type = opts.type || "Ultra";
  return {
    id,
    name,
    category,
    distance: opts.distance || null,
    type,
    elevation: opts.elevation || null,
    location: opts.location || "",
    status: "wishlist",
    date: null,
    time: null,
    completions: 0,
    peaks: opts.peaks || [],
    story: "",
    lessons: "",
    conditions: null,
    difficulty: opts.difficulty || 3,
    badge: opts.badge || (type === "Mountain" ? "🏔️" : type === "Urban" ? "🏙️" : "🥾"),
    color: TYPE_COLORS[type],
    heroImage: opts.gradient || G[Math.abs(id.charCodeAt(5)) % G.length],
    photos: [],
    trainingWeeks: [],
    phase: null, week: null, progress: 0, route: "", reasons: [], watchOuts: [],
    targetYear: opts.year || null,
    appeal: opts.appeal || "",
    kitList: [],
    nutritionPlan: "",
    createdAt: now,
    updatedAt: now,
  };
}

export const suggestedChallenges = [
  // ═══════════════════════════════════════
  // UK MOUNTAIN
  // ═══════════════════════════════════════
  wish("wish-nat3p", "National 3 Peaks", "Mountains", {
    type: "Mountain", distance: 42, elevation: 3400,
    location: "Ben Nevis + Scafell Pike + Snowdon",
    difficulty: 5, badge: "⛰️", gradient: G[0],
    appeal: "The holy trinity of UK peaks in 24 hours. Ben Nevis is already done — two more summits to claim the crown.",
  }),
  wish("wish-w3000", "Welsh 3000s", "Mountains", {
    type: "Mountain", distance: 50, elevation: 3500,
    location: "Snowdonia, Wales",
    difficulty: 5, badge: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", gradient: G[1],
    appeal: "All 15 peaks over 3,000ft in Snowdonia in a single push. The ultimate Welsh mountain challenge.",
  }),
  wish("wish-scafe", "Scafell Pike", "Mountains", {
    type: "Mountain", distance: 14, elevation: 978,
    location: "Lake District, England",
    difficulty: 3, badge: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", gradient: G[2],
    peaks: ["Scafell Pike (978m)"],
    appeal: "England's highest peak. With Ben Nevis done, this completes two of three.",
  }),
  wish("wish-snowd", "Snowdon (Yr Wyddfa)", "Mountains", {
    type: "Mountain", distance: 14, elevation: 1085,
    location: "Snowdonia, Wales",
    difficulty: 3, badge: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", gradient: G[3],
    peaks: ["Snowdon (1,085m)"],
    appeal: "Wales's highest. Combined with Ben Nevis and Scafell Pike — that's the full set.",
  }),
  wish("wish-helve", "Helvellyn via Striding Edge", "Mountains", {
    type: "Mountain", distance: 16, elevation: 900,
    location: "Lake District, England",
    difficulty: 4, badge: "🗡️", gradient: G[4],
    peaks: ["Helvellyn (950m)"],
    appeal: "The classic knife-edge scramble. Grade 1 scramble that turns a walk into an adventure.",
  }),
  wish("wish-fandx", "Fan Dance", "Mountains", {
    type: "Mountain", distance: 24, elevation: 1000,
    location: "Brecon Beacons, Wales",
    difficulty: 4, badge: "⚔️", gradient: G[5],
    peaks: ["Pen y Fan (886m)"],
    appeal: "The SAS selection march route. Pen y Fan and back, against the clock. Raw military endurance.",
  }),
  wish("wish-cairn", "Cairngorm 4000ers", "Mountains", {
    type: "Mountain", distance: 35, elevation: 1800,
    location: "Cairngorms, Scotland",
    difficulty: 4, badge: "🏔️", gradient: G[6],
    peaks: ["Ben Macdui (1,309m)", "Braeriach (1,296m)", "Cairn Toul (1,291m)", "Cairn Gorm (1,245m)"],
    appeal: "Scotland's highest plateau. Four peaks over 4,000ft in the most remote terrain in the UK.",
  }),
  wish("wish-conis", "Old Man of Coniston", "Mountains", {
    type: "Mountain", distance: 14, elevation: 803,
    location: "Lake District, England",
    difficulty: 2, badge: "⛰️", gradient: G[7],
    peaks: ["Old Man of Coniston (803m)"],
    appeal: "Iconic Lake District summit with stunning views over Coniston Water. A classic for the collection.",
  }),

  // ═══════════════════════════════════════
  // UK ULTRA WALKING
  // ═══════════════════════════════════════
  wish("wish-thame", "Thames Path 100km", "Endurance", {
    type: "Ultra", distance: 100, location: "London → Henley",
    difficulty: 3, badge: "🌊", gradient: G[2],
    appeal: "Flat but relentless. Following the Thames out of London. A completely different 100km to the Lake District.",
  }),
  wish("wish-r2sto", "Race to the Stones", "Endurance", {
    type: "Ultra", distance: 100, location: "The Ridgeway, England",
    difficulty: 4, badge: "🪨", gradient: G[0],
    appeal: "The UK's biggest ultra along the ancient Ridgeway. Finishes at a 5,000-year-old stone circle.",
  }),
  wish("wish-lykew", "Lyke Wake Walk", "Endurance", {
    type: "Ultra", distance: 61, location: "North York Moors",
    difficulty: 4, badge: "💀", gradient: G[5],
    appeal: "40 miles across the North York Moors in 24 hours. The moors at night are a different world.",
  }),
  wish("wish-iowch", "Isle of Wight Challenge", "Endurance", {
    type: "Ultra", distance: 106, location: "Isle of Wight",
    difficulty: 4, badge: "🏝️", gradient: G[3],
    appeal: "Full island circumnavigation. Coastal paths, chalk cliffs, and you can see where you started from the finish.",
  }),
  wish("wish-jurac", "Jurassic Coast 100", "Endurance", {
    type: "Ultra", distance: 100, location: "Dorset Coast",
    difficulty: 5, badge: "🦕", gradient: G[6],
    appeal: "Brutal elevation along the Dorset coastline. More climbing than most mountain events. Beautiful and savage.",
  }),
  wish("wish-norfo", "Norfolk 100km", "Endurance", {
    type: "Ultra", distance: 100, location: "Norfolk Coast",
    difficulty: 3, badge: "🌾", gradient: G[7],
    appeal: "Flat but mentally relentless — no hills to break the monotony. Pure mental endurance training.",
  }),
  wish("wish-sdw16", "South Downs Way 160km", "Endurance", {
    type: "Ultra", distance: 160, location: "Winchester → Eastbourne",
    difficulty: 5, badge: "🚶", gradient: G[1],
    appeal: "The full South Downs Way end-to-end. You've done 50km of it — this is the complete picture.",
  }),
  wish("wish-cotsw", "Cotswold Way", "Endurance", {
    type: "Ultra", distance: 164, location: "Chipping Campden → Bath",
    difficulty: 4, badge: "🏡", gradient: G[4],
    appeal: "164km through honey-stone villages and rolling Cotswold hills. Quintessentially English.",
  }),

  // ═══════════════════════════════════════
  // UK MULTI-DAY
  // ═══════════════════════════════════════
  wish("wish-whway", "West Highland Way", "Multi-Day", {
    type: "Ultra", distance: 154,
    location: "Milngavie → Fort William, Scotland",
    difficulty: 4, badge: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", gradient: G[0],
    appeal: "Scotland's most famous trail. 154km through lochs, moors, and glens. Finishes at the foot of Ben Nevis.",
  }),
  wish("wish-hadri", "Hadrian's Wall Path", "Multi-Day", {
    type: "Ultra", distance: 135,
    location: "Wallsend → Bowness-on-Solway",
    difficulty: 3, badge: "🏛️", gradient: G[2],
    appeal: "Coast to coast along the Roman wall. 2,000 years of history under your feet.",
  }),
  wish("wish-c2c00", "Coast to Coast", "Multi-Day", {
    type: "Ultra", distance: 309,
    location: "St Bees → Robin Hood's Bay",
    difficulty: 5, badge: "🌊", gradient: G[4],
    appeal: "Wainwright's masterpiece. 309km across England from the Irish Sea to the North Sea. The big one.",
  }),
  wish("wish-pennw", "Pennine Way", "Multi-Day", {
    type: "Ultra", distance: 431,
    location: "Edale → Kirk Yetholm",
    difficulty: 5, badge: "🗻", gradient: G[5],
    appeal: "England's spine. 431km, 16-19 days, and more bog than you'd believe possible. Legendary.",
  }),
  wish("wish-dalew", "Dales Way", "Multi-Day", {
    type: "Ultra", distance: 128,
    location: "Ilkley → Bowness-on-Windermere",
    difficulty: 3, badge: "🥾", gradient: G[1],
    appeal: "Yorkshire Dales to the Lake District. A gentle multi-day that links two of your favourite landscapes.",
  }),
  wish("wish-cumbw", "Cumbria Way", "Multi-Day", {
    type: "Ultra", distance: 112,
    location: "Ulverston → Carlisle",
    difficulty: 3, badge: "🥾", gradient: G[3],
    appeal: "Through the heart of the Lake District. 5 days of lakes, fells, and quiet valleys.",
  }),
  wish("wish-glenw", "Great Glen Way", "Multi-Day", {
    type: "Ultra", distance: 127,
    location: "Fort William → Inverness, Scotland",
    difficulty: 3, badge: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", gradient: G[6],
    appeal: "Along the Great Glen from Fort William (where you climbed Ben Nevis) to Inverness. Loch Ness included.",
  }),

  // ═══════════════════════════════════════
  // UK URBAN
  // ═══════════════════════════════════════
  wish("wish-capri", "London Capital Ring", "Urban", {
    type: "Urban", distance: 126, location: "Inner London orbital",
    difficulty: 3, badge: "🏙️", gradient: G[7],
    appeal: "The full inner London orbital walk. You've done the Northern Line — this is the whole city.",
  }),
  wish("wish-lloop", "London LOOP", "Urban", {
    type: "Urban", distance: 242, location: "Outer London orbital",
    difficulty: 4, badge: "🔄", gradient: G[3],
    appeal: "The outer London orbital. 242km through surprisingly green suburbs. London's secret countryside.",
  }),
  wish("wish-circl", "Circle Line Walk", "Urban", {
    type: "Urban", distance: 27, location: "London Circle Line",
    difficulty: 2, badge: "🟡", gradient: G[5],
    appeal: "Another tube line on foot. Shorter than the Northern Line but denser — proper central London streets.",
  }),
  wish("wish-distr", "District Line Walk", "Urban", {
    type: "Urban", distance: 40, location: "London District Line",
    difficulty: 2, badge: "🟢", gradient: G[4],
    appeal: "The longest tube line walked end-to-end. From Richmond to Upminster across the full width of London.",
  }),
  wish("wish-m2liv", "Manchester to Liverpool", "Urban", {
    type: "Urban", distance: 56, location: "Manchester → Liverpool",
    difficulty: 3, badge: "🏙️", gradient: G[6],
    appeal: "Two great northern cities connected by foot. Industrial canals, suburbs, and the flat Lancashire plain.",
  }),
  wish("wish-edin7", "Edinburgh Seven Hills", "Urban", {
    type: "Urban", distance: 23, location: "Edinburgh, Scotland",
    difficulty: 2, badge: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", gradient: G[0],
    appeal: "Scotland's capital has 7 hills. Summit them all in a single day walk through the city.",
  }),

  // ═══════════════════════════════════════
  // INTERNATIONAL
  // ═══════════════════════════════════════
  wish("wish-tmbla", "Tour du Mont Blanc", "International", {
    type: "Mountain", distance: 170, elevation: 10000,
    location: "France / Italy / Switzerland",
    difficulty: 5, badge: "🏔️", gradient: G[0],
    appeal: "The dream Alpine trek. 170km around Mont Blanc through three countries. The goal after the UK challenges.",
  }),
  wish("wish-camin", "Camino de Santiago", "International", {
    type: "Ultra", distance: 780,
    location: "St-Jean-Pied-de-Port → Santiago, Spain",
    difficulty: 4, badge: "🐚", gradient: G[1],
    appeal: "The pilgrimage. 780km across northern Spain. Not about speed — about the journey changing you.",
  }),
  wish("wish-ebcmp", "Everest Base Camp Trek", "International", {
    type: "Mountain", distance: 130, elevation: 5364,
    location: "Lukla → EBC, Nepal",
    difficulty: 5, badge: "🏔️", gradient: G[2],
    appeal: "Not about distance — about altitude. Standing at the foot of the highest point on Earth.",
  }),
  wish("wish-kilim", "Kilimanjaro", "International", {
    type: "Mountain", distance: 70, elevation: 5895,
    location: "Tanzania, Africa",
    difficulty: 5, badge: "🌍", gradient: G[3],
    appeal: "The highest point in Africa. Walk from rainforest to arctic summit. No technical climbing — pure endurance.",
  }),
  wish("wish-gr20x", "GR20 Corsica", "International", {
    type: "Mountain", distance: 180, elevation: 12000,
    location: "Corsica, France",
    difficulty: 5, badge: "🔥", gradient: G[5],
    appeal: "Europe's toughest long-distance trail. 180km with 12,000m of elevation. Not for the faint-hearted.",
  }),
  wish("wish-laugv", "Laugavegur Trail", "International", {
    type: "Mountain", distance: 55, elevation: 1000,
    location: "Iceland",
    difficulty: 3, badge: "🌋", gradient: G[6],
    appeal: "55km through volcanic landscapes, hot springs, and glaciers. Another planet.",
  }),
  wish("wish-incax", "Inca Trail", "International", {
    type: "Mountain", distance: 43, elevation: 4215,
    location: "Cusco → Machu Picchu, Peru",
    difficulty: 4, badge: "🏛️", gradient: G[7],
    appeal: "The original trek to the lost city. Arriving at Machu Picchu through the Sun Gate at dawn.",
  }),
  wish("wish-torre", "Torres del Paine W Trek", "International", {
    type: "Mountain", distance: 80, elevation: 3000,
    location: "Patagonia, Chile",
    difficulty: 4, badge: "🏔️", gradient: G[4],
    appeal: "The end of the world. Glaciers, granite towers, and Patagonian wind. 80km of raw wilderness.",
  }),
  wish("wish-haute", "Haute Route", "International", {
    type: "Mountain", distance: 180, elevation: 12000,
    location: "Chamonix → Zermatt, Switzerland",
    difficulty: 5, badge: "🇨🇭", gradient: G[0],
    appeal: "Chamonix to Zermatt through the high Alps. 180km of the most spectacular mountain scenery in Europe.",
  }),
  wish("wish-annap", "Annapurna Circuit", "International", {
    type: "Mountain", distance: 230, elevation: 5416,
    location: "Nepal",
    difficulty: 5, badge: "🏔️", gradient: G[1],
    appeal: "The classic Himalayan circuit. Thorong La Pass at 5,416m. Three weeks of the highest mountains on Earth.",
  }),
  wish("wish-kungs", "Kungsleden", "International", {
    type: "Ultra", distance: 440,
    location: "Swedish Lapland",
    difficulty: 4, badge: "🇸🇪", gradient: G[2],
    appeal: "The King's Trail through Arctic Sweden. 440km of midnight sun, reindeer, and total solitude.",
  }),
  wish("wish-tonga", "Tongariro Alpine Crossing", "International", {
    type: "Mountain", distance: 19, elevation: 1000,
    location: "New Zealand",
    difficulty: 3, badge: "🌋", gradient: G[3],
    appeal: "One of the world's greatest day walks. Volcanic craters, emerald lakes, and Mordor landscapes.",
  }),
  wish("wish-overl", "Overland Track", "International", {
    type: "Ultra", distance: 65,
    location: "Tasmania, Australia",
    difficulty: 3, badge: "🇦🇺", gradient: G[4],
    appeal: "65km through Tasmanian wilderness. Ancient forests, mountain plateaus, and no mobile signal.",
  }),
  wish("wish-routb", "Routeburn Track", "International", {
    type: "Mountain", distance: 32,
    location: "South Island, New Zealand",
    difficulty: 3, badge: "🇳🇿", gradient: G[5],
    appeal: "A perfect 2-day alpine crossing through NZ's Southern Alps. Fiordland at its finest.",
  }),
  wish("wish-lycin", "Lycian Way", "International", {
    type: "Ultra", distance: 540,
    location: "Turkey",
    difficulty: 4, badge: "🇹🇷", gradient: G[6],
    appeal: "540km along Turkey's Mediterranean coast. Ancient ruins, turquoise water, and mountain paths.",
  }),
  wish("wish-petra", "Petra to Wadi Rum", "International", {
    type: "Ultra", distance: 80,
    location: "Jordan",
    difficulty: 3, badge: "🏜️", gradient: G[7],
    appeal: "Desert trekking from the ancient city of Petra to the Martian landscape of Wadi Rum.",
  }),
  wish("wish-trollt", "Trolltunga", "International", {
    type: "Mountain", distance: 28, elevation: 800,
    location: "Norway",
    difficulty: 3, badge: "🇳🇴", gradient: G[0],
    appeal: "The iconic troll's tongue rock formation. A long day hike to one of Norway's most dramatic viewpoints.",
  }),
  wish("wish-mfuji", "Mount Fuji", "International", {
    type: "Mountain", distance: 14, elevation: 3776,
    location: "Japan",
    difficulty: 4, badge: "🗻", gradient: G[1],
    peaks: ["Mount Fuji (3,776m)"],
    appeal: "Japan's sacred mountain. Climb through the night to watch sunrise from the summit.",
  }),
  wish("wish-toubk", "Mount Toubkal", "International", {
    type: "Mountain", distance: 30, elevation: 4167,
    location: "Atlas Mountains, Morocco",
    difficulty: 4, badge: "🇲🇦", gradient: G[2],
    peaks: ["Toubkal (4,167m)"],
    appeal: "North Africa's highest peak. Desert mountains, Berber villages, and a proper altitude challenge.",
  }),
  wish("wish-jmuir", "John Muir Trail", "International", {
    type: "Ultra", distance: 340,
    location: "Yosemite → Mt Whitney, California",
    difficulty: 5, badge: "🇺🇸", gradient: G[3],
    appeal: "340km through the Sierra Nevada. America's most famous trail. Finishes at the highest point in the lower 48.",
  }),

  // ═══════════════════════════════════════
  // RUNNING (unlock that Marathon badge)
  // ═══════════════════════════════════════
  wish("wish-halfm", "Half Marathon", "Running", {
    type: "Ultra", distance: 21.1,
    location: "TBC",
    difficulty: 3, badge: "🏃", gradient: G[7],
    appeal: "The gateway to the marathon badge. Walking ultras is harder — but running 21km is a different beast entirely.",
  }),
  wish("wish-marat", "Marathon", "Running", {
    type: "Ultra", distance: 42.2,
    location: "TBC",
    difficulty: 4, badge: "🏃", gradient: G[5],
    appeal: "42.2km. The locked badge on your wall. Whether you run it or walk it — just cross that finish line.",
  }),

  // ═══════════════════════════════════════
  // WILD / EXTREME
  // ═══════════════════════════════════════
  wish("wish-lejog", "Land's End to John O'Groats", "Extreme", {
    type: "Ultra", distance: 1400,
    location: "Cornwall → Scottish Highlands",
    difficulty: 5, badge: "🇬🇧", gradient: G[5],
    appeal: "The full length of Britain on foot. 1,400km. The ultimate UK endurance challenge. Months of walking.",
  }),
  wish("wish-200km", "200km Ultra", "Extreme", {
    type: "Ultra", distance: 200,
    location: "TBC",
    difficulty: 5, badge: "🔥", gradient: G[6],
    appeal: "Double your current max distance. 200km is where ultra becomes something else entirely.",
  }),
  wish("wish-24hr0", "24-Hour Walk Challenge", "Extreme", {
    type: "Ultra", distance: null,
    location: "TBC",
    difficulty: 5, badge: "⏱️", gradient: G[7],
    appeal: "Not about distance — about time. Walk as far as you can in exactly 24 hours. Pure endurance measurement.",
  }),
  wish("wish-bobgr", "Bob Graham Round", "Extreme", {
    type: "Mountain", distance: 106, elevation: 8200,
    location: "Lake District, England",
    difficulty: 5, badge: "👑", gradient: G[0],
    appeal: "42 peaks, 106km, 8,200m of elevation in 24 hours. The most prestigious fell challenge in Britain.",
  }),
  wish("wish-mds00", "Marathon des Sables", "Extreme", {
    type: "Ultra", distance: 250,
    location: "Sahara Desert, Morocco",
    difficulty: 5, badge: "🏜️", gradient: G[3],
    appeal: "250km across the Sahara in 6 stages. Self-supported. The toughest footrace on Earth.",
  }),
  wish("wish-swcp0", "South West Coast Path", "Extreme", {
    type: "Ultra", distance: 1014,
    location: "Minehead → Poole, England",
    difficulty: 5, badge: "🌊", gradient: G[4],
    appeal: "1,014km of coastline. England's longest trail. More elevation than the Himalayas. Do it in sections.",
  }),

  // ═══════════════════════════════════════
  // MOUNTAINS (additional)
  // ═══════════════════════════════════════
  wish("wish-bncmd", "Ben Nevis via CMD Arete", "Mountains", {
    type: "Mountain", distance: 16, elevation: 1345,
    location: "Fort William, Scotland",
    difficulty: 5, badge: "🗡️", gradient: G[2],
    peaks: ["Ben Nevis (1,345m)"],
    appeal: "You've summited Ben Nevis — now return via the knife-edge CMD Arete. The mountain's true face, not the tourist path.",
  }),
  wish("wish-tryfa", "Tryfan", "Mountains", {
    type: "Mountain", distance: 6, elevation: 918,
    location: "Snowdonia, Wales",
    difficulty: 4, badge: "🧗", gradient: G[3],
    peaks: ["Tryfan (918m)"],
    appeal: "The only Snowdonia summit you cannot reach without using your hands. Jump between Adam and Eve at the top if you dare.",
  }),
  wish("wish-grgab", "Great Gable", "Mountains", {
    type: "Mountain", distance: 13, elevation: 899,
    location: "Lake District, England",
    difficulty: 3, badge: "⛰️", gradient: G[5],
    peaks: ["Great Gable (899m)"],
    appeal: "The fell on the Lake District logo. A perfect pyramid with 360-degree views of every major Lakeland summit.",
  }),
  wish("wish-shrpe", "Blencathra via Sharp Edge", "Mountains", {
    type: "Mountain", distance: 12, elevation: 868,
    location: "Lake District, England",
    difficulty: 4, badge: "🗡️", gradient: G[6],
    peaks: ["Blencathra (868m)"],
    appeal: "Sharp Edge makes Striding Edge look tame. A true Grade 1 scramble with serious exposure. Earn this one.",
  }),
  wish("wish-skidd", "Skiddaw", "Mountains", {
    type: "Mountain", distance: 14, elevation: 931,
    location: "Lake District, England",
    difficulty: 2, badge: "⛰️", gradient: G[1],
    peaks: ["Skiddaw (931m)"],
    appeal: "One of Lakeland's big four. A straightforward ascent that rewards with views deep into Scotland on a clear day.",
  }),
  wish("wish-crsfl", "Cross Fell", "Mountains", {
    type: "Mountain", distance: 18, elevation: 893,
    location: "Pennines, England",
    difficulty: 3, badge: "⛰️", gradient: G[4],
    peaks: ["Cross Fell (893m)"],
    appeal: "The highest point in the Pennines. Remote, windswept, and often overlooked. England's forgotten summit.",
  }),
  wish("wish-crbgh", "Crib Goch", "Mountains", {
    type: "Mountain", distance: 12, elevation: 923,
    location: "Snowdonia, Wales",
    difficulty: 5, badge: "🔥", gradient: G[0],
    peaks: ["Crib Goch (923m)"],
    appeal: "Wales's most exposed ridge. A Grade 1 scramble with thousand-foot drops on both sides. Not a walk — an experience.",
  }),
  wish("wish-mamtr", "Mam Tor to Lose Hill Ridge", "Mountains", {
    type: "Mountain", distance: 11, elevation: 517,
    location: "Peak District, England",
    difficulty: 2, badge: "🥾", gradient: G[7],
    peaks: ["Mam Tor (517m)", "Lose Hill (476m)"],
    appeal: "The Great Ridge of the Peak District. A perfect half-day skyline walk with the whole of the Hope Valley at your feet.",
  }),

  // ═══════════════════════════════════════
  // ENDURANCE (additional)
  // ═══════════════════════════════════════
  wish("wish-ridgw", "Ridgeway Challenge", "Endurance", {
    type: "Ultra", distance: 86,
    location: "The Ridgeway, Wiltshire → Buckinghamshire",
    difficulty: 4, badge: "🪨", gradient: G[1],
    appeal: "86km along Britain's oldest road. Five thousand years of footsteps before yours. Ancient and relentless.",
  }),
  wish("wish-peddw", "Peddars Way", "Endurance", {
    type: "Ultra", distance: 75,
    location: "Knettishall Heath → Holme-next-the-Sea, Norfolk",
    difficulty: 3, badge: "🌾", gradient: G[3],
    appeal: "A Roman road through the quiet heart of Norfolk. Flat, straight, and meditative — pure walking for walking's sake.",
  }),
  wish("wish-chilw", "Chiltern Way", "Endurance", {
    type: "Ultra", distance: 133,
    location: "Chiltern Hills, Buckinghamshire",
    difficulty: 4, badge: "🌳", gradient: G[5],
    appeal: "133km through ancient beechwoods and chalk valleys. Close to London but a world away. England's hidden gem.",
  }),
  wish("wish-dwnlk", "Downs Link", "Endurance", {
    type: "Ultra", distance: 60,
    location: "Guildford → Shoreham-by-Sea, Surrey to coast",
    difficulty: 2, badge: "🚂", gradient: G[7],
    appeal: "60km along a disused railway from the Surrey Hills to the sea. Flat, fast, and finishes on the beach.",
  }),
  wish("wish-knavc", "Kennet & Avon Canal", "Endurance", {
    type: "Ultra", distance: 139,
    location: "Reading → Bristol",
    difficulty: 3, badge: "🚢", gradient: G[2],
    appeal: "139km of towpath from Reading to Bristol. Zero navigation, zero elevation, pure forward momentum.",
  }),
  wish("wish-clevw", "Cleveland Way", "Endurance", {
    type: "Ultra", distance: 175,
    location: "Helmsley → Filey, North Yorkshire",
    difficulty: 4, badge: "🌊", gradient: G[4],
    appeal: "From the North York Moors to dramatic coastal cliffs. 175km of Yorkshire at its most wild and beautiful.",
  }),
  wish("wish-ywold", "Yorkshire Wolds Way", "Endurance", {
    type: "Ultra", distance: 127,
    location: "Hessle → Filey Brigg, East Yorkshire",
    difficulty: 3, badge: "🌾", gradient: G[6],
    appeal: "127km through the rolling chalk hills of East Yorkshire. Quiet, pastoral, and surprisingly hilly for the flatlands.",
  }),
  wish("wish-offdy", "Offa's Dyke Path", "Endurance", {
    type: "Ultra", distance: 285,
    location: "Sedbury → Prestatyn, Wales/England border",
    difficulty: 5, badge: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", gradient: G[0],
    appeal: "285km along the ancient earthwork dividing England and Wales. One foot in each country for two weeks straight.",
  }),

  // ═══════════════════════════════════════
  // MULTI-DAY (additional)
  // ═══════════════════════════════════════
  wish("wish-rroyw", "Rob Roy Way", "Multi-Day", {
    type: "Ultra", distance: 127,
    location: "Drymen → Pitlochry, Scotland",
    difficulty: 3, badge: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", gradient: G[2],
    appeal: "Through Rob Roy MacGregor's Highland heartland. Lochs, glens, and whisky distilleries along the way.",
  }),
  wish("wish-speyw", "Speyside Way", "Multi-Day", {
    type: "Ultra", distance: 105,
    location: "Aviemore → Buckie, Scotland",
    difficulty: 2, badge: "🥃", gradient: G[4],
    appeal: "105km following the River Spey through Scotland's whisky country. The most delicious trail in Britain.",
  }),
  wish("wish-pembw", "Pembrokeshire Coast Path", "Multi-Day", {
    type: "Ultra", distance: 299,
    location: "St Dogmaels → Amroth, Wales",
    difficulty: 4, badge: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", gradient: G[6],
    appeal: "299km of the most spectacular coastal scenery in Britain. Wild cliffs, hidden coves, and more seals than people.",
  }),
  wish("wish-norcp", "Norfolk Coast Path", "Multi-Day", {
    type: "Ultra", distance: 84,
    location: "Hunstanton → Hopton-on-Sea, Norfolk",
    difficulty: 2, badge: "🦀", gradient: G[7],
    appeal: "84km of wide skies, salt marshes, and empty beaches. The quietest coastline in England.",
  }),
  wish("wish-glynw", "Glyndwr's Way", "Multi-Day", {
    type: "Ultra", distance: 217,
    location: "Knighton → Welshpool, Wales",
    difficulty: 4, badge: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", gradient: G[1],
    appeal: "217km through the empty green heart of mid-Wales. You might not see another walker for days. True solitude.",
  }),
  wish("wish-hoew0", "Heart of England Way", "Multi-Day", {
    type: "Ultra", distance: 161,
    location: "Milford Common → Bourton-on-the-Water",
    difficulty: 3, badge: "🥾", gradient: G[3],
    appeal: "161km from Staffordshire to the Cotswolds. Through the overlooked middle of England — surprisingly beautiful.",
  }),

  // ═══════════════════════════════════════
  // URBAN (additional)
  // ═══════════════════════════════════════
  wish("wish-piccl", "Piccadilly Line Walk", "Urban", {
    type: "Urban", distance: 71,
    location: "London Piccadilly Line",
    difficulty: 3, badge: "🔵", gradient: G[0],
    appeal: "Heathrow to Cockfosters on foot. 71km crossing London diagonally through some of its most iconic neighbourhoods.",
  }),
  wish("wish-centl", "Central Line Walk", "Urban", {
    type: "Urban", distance: 76,
    location: "London Central Line",
    difficulty: 3, badge: "🔴", gradient: G[5],
    appeal: "The longest tube line walked east-to-west. 76km from Epping Forest to the suburbs of Ruislip.",
  }),
  wish("wish-bakrl", "Bakerloo Line Walk", "Urban", {
    type: "Urban", distance: 23,
    location: "London Bakerloo Line",
    difficulty: 1, badge: "🟤", gradient: G[7],
    appeal: "The shortest tube line walk — perfect for a first line challenge. Elephant & Castle to Harrow in a single afternoon.",
  }),
  wish("wish-bcanl", "Birmingham Canal Walk", "Urban", {
    type: "Urban", distance: 35,
    location: "Birmingham Canal Network",
    difficulty: 2, badge: "🏙️", gradient: G[3],
    appeal: "Birmingham has more canals than Venice. 35km exploring the hidden waterways of England's second city.",
  }),
  wish("wish-l2lcp", "Leeds to Liverpool Canal", "Urban", {
    type: "Urban", distance: 204,
    location: "Leeds → Liverpool",
    difficulty: 4, badge: "🚢", gradient: G[1],
    appeal: "204km of towpath linking two great northern cities. Through the Pennines without climbing a single hill.",
  }),
  wish("wish-glasw", "Glasgow City Walk", "Urban", {
    type: "Urban", distance: 25,
    location: "Glasgow, Scotland",
    difficulty: 1, badge: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", gradient: G[6],
    appeal: "25km through Glasgow's Victorian architecture, street art, and riverside. Scotland's grittiest, most vibrant city on foot.",
  }),

  // ═══════════════════════════════════════
  // INTERNATIONAL (additional)
  // ═══════════════════════════════════════
  wish("wish-dolav", "Dolomites Alta Via 1", "International", {
    type: "Mountain", distance: 120, elevation: 6500,
    location: "Dolomites, Italy",
    difficulty: 4, badge: "🇮🇹", gradient: G[2],
    appeal: "120km through the most dramatic mountain scenery in Europe. Pale limestone towers, rifugios, and Italian coffee at altitude.",
  }),
  wish("wish-pctsc", "Pacific Crest Trail Section", "International", {
    type: "Ultra", distance: 160,
    location: "Sierra Nevada, California, USA",
    difficulty: 5, badge: "🇺🇸", gradient: G[4],
    appeal: "A taste of the legendary PCT through the High Sierra. Snow-capped passes, crystal lakes, and total wilderness.",
  }),
  wish("wish-appsc", "Appalachian Trail Section", "International", {
    type: "Ultra", distance: 160,
    location: "White Mountains, New Hampshire, USA",
    difficulty: 4, badge: "🇺🇸", gradient: G[6],
    appeal: "The White Mountains section — the toughest stretch of America's most famous trail. Rugged, rooty, and real.",
  }),
  wish("wish-olymp", "Mount Olympus", "International", {
    type: "Mountain", distance: 22, elevation: 2918,
    location: "Thessaloniki region, Greece",
    difficulty: 4, badge: "⚡", gradient: G[0],
    peaks: ["Mytikas (2,918m)"],
    appeal: "Home of the Greek gods. A scramble to the summit of mythology itself. Where legend meets limestone.",
  }),
  wish("wish-cinqt", "Cinque Terre Trail", "International", {
    type: "Mountain", distance: 12, elevation: 500,
    location: "Liguria, Italy",
    difficulty: 2, badge: "🇮🇹", gradient: G[1],
    appeal: "12km linking five pastel-coloured villages along the Italian Riviera. Short, sweet, and unforgettable.",
  }),
  wish("wish-tignx", "Tiger's Nest Hike", "International", {
    type: "Mountain", distance: 10, elevation: 900,
    location: "Paro Valley, Bhutan",
    difficulty: 3, badge: "🐯", gradient: G[5],
    appeal: "A monastery clinging to a cliff at 3,120m. The most iconic hike in the Himalayan kingdom of Bhutan.",
  }),
  wish("wish-elbrs", "Mount Elbrus", "International", {
    type: "Mountain", distance: 20, elevation: 5642,
    location: "Caucasus, Russia/Georgia border",
    difficulty: 5, badge: "🏔️", gradient: G[3],
    peaks: ["Elbrus (5,642m)"],
    appeal: "The highest mountain in Europe. A proper high-altitude expedition that bridges trekking and mountaineering.",
  }),
  wish("wish-tblmt", "Table Mountain", "International", {
    type: "Mountain", distance: 11, elevation: 1085,
    location: "Cape Town, South Africa",
    difficulty: 2, badge: "🇿🇦", gradient: G[7],
    peaks: ["Table Mountain (1,085m)"],
    appeal: "Cape Town's flat-topped icon. Skip the cable car, earn the summit, and watch the Atlantic and Indian Oceans meet.",
  }),
  wish("wish-milfd", "Milford Track", "International", {
    type: "Mountain", distance: 53, elevation: 1154,
    location: "Fiordland, New Zealand",
    difficulty: 3, badge: "🇳🇿", gradient: G[2],
    appeal: "53km through New Zealand's Fiordland. Called the finest walk in the world since 1908 — and it still is.",
  }),

  // ═══════════════════════════════════════
  // RUNNING (additional)
  // ═══════════════════════════════════════
  wish("wish-parkr", "Parkrun", "Running", {
    type: "Ultra", distance: 5,
    location: "Local parkrun",
    difficulty: 1, badge: "🏃", gradient: G[3],
    appeal: "5km. Every Saturday morning. Free, timed, and the friendliest running community in the world. Just show up.",
  }),
  wish("wish-10krc", "10K Race", "Running", {
    type: "Ultra", distance: 10,
    location: "TBC",
    difficulty: 2, badge: "🏃", gradient: G[1],
    appeal: "Double the parkrun, double the pain. The 10K is where casual running starts to feel like real racing.",
  }),
  wish("wish-ult50", "Ultra Marathon 50km", "Running", {
    type: "Ultra", distance: 50,
    location: "TBC",
    difficulty: 5, badge: "🔥", gradient: G[0],
    appeal: "Beyond marathon distance. 50km is where running stops being a sport and becomes a conversation with yourself.",
  }),
  wish("wish-c25kg", "Couch to 5K Graduation", "Running", {
    type: "Ultra", distance: 5,
    location: "Local",
    difficulty: 1, badge: "🎓", gradient: G[6],
    appeal: "The first step is the hardest. Nine weeks from zero to 5km. The badge that proves anyone can become a runner.",
  }),

  // ═══════════════════════════════════════
  // EXTREME (additional)
  // ═══════════════════════════════════════
  wish("wish-paddy", "Paddy Buckley Round", "Extreme", {
    type: "Mountain", distance: 100, elevation: 8500,
    location: "Snowdonia, Wales",
    difficulty: 5, badge: "👑", gradient: G[1],
    peaks: ["Snowdon", "Tryfan", "Glyder Fawr", "Carnedd Llewelyn"],
    appeal: "47 peaks, 100km, 8,500m of ascent in 24 hours. The Welsh answer to the Bob Graham Round. Fewer completions, more suffering.",
  }),
  wish("wish-ramsy", "Ramsay Round", "Extreme", {
    type: "Mountain", distance: 93, elevation: 8600,
    location: "Lochaber, Scotland",
    difficulty: 5, badge: "👑", gradient: G[2],
    peaks: ["Ben Nevis", "Aonach Beag", "Carn Mor Dearg"],
    appeal: "24 Munros in 24 hours. 93km through the wildest terrain in Britain. The Scottish big round — fewer than 200 completions ever.",
  }),
  wish("wish-dblbg", "Double Bob Graham", "Extreme", {
    type: "Mountain", distance: 212, elevation: 16400,
    location: "Lake District, England",
    difficulty: 5, badge: "💎", gradient: G[4],
    appeal: "The Bob Graham Round — twice. 212km, 84 peaks, 16,400m of climbing. For when the single round isn't enough.",
  }),
  wish("wish-100mi", "100-Mile Ultra", "Extreme", {
    type: "Ultra", distance: 161,
    location: "TBC",
    difficulty: 5, badge: "💯", gradient: G[6],
    appeal: "The buckle distance. 100 miles non-stop. Two nights without sleep. The ultimate test of what your body and mind can endure.",
  }),
  wish("wish-barkl", "Barkley Marathons", "Extreme", {
    type: "Ultra", distance: 160, elevation: 18000,
    location: "Frozen Head State Park, Tennessee, USA",
    difficulty: 5, badge: "🔥", gradient: G[5],
    appeal: "The race that eats its runners. 160km with 18,000m of elevation. No trail. No markers. Fewer than 20 finishers in 40 years.",
  }),
];
