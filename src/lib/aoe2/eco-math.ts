/**
 * Age of Empires II Definitive Edition — Economy & Gathering Mathematics Engine
 * Sourced from game data files & community verified benchmarks (Spirit of the Law & pro testing).
 */

export interface GatheringRate {
  sourceId: string;
  name: { en: string; es: string };
  resource: "food" | "wood" | "gold" | "stone";
  ratePerMin: number; // Base gathered per minute per villager without upgrades
  notes: { en: string; es: string };
  tier: "fastest" | "fast" | "medium" | "slow";
}

export interface EcoUpgradeInfo {
  id: string;
  name: { en: string; es: string };
  age: "feudal" | "castle" | "imperial";
  building: string;
  cost: { food: number; wood: number; gold: number };
  researchTimeSec: number;
  effectDescription: { en: string; es: string };
  payoffMetric: { en: string; es: string };
  bestTimingRule: { en: string; es: string };
}

export interface CivEcoBonus {
  civ: string;
  name: { en: string; es: string };
  resourceImpact: "food" | "wood" | "gold" | "stone" | "all";
  bonusTitle: { en: string; es: string };
  bonusFormula: { en: string; es: string };
  rateMultiplier: number;
}

export interface ProductionUnitFormula {
  id: string;
  name: { en: string; es: string };
  building: string;
  cost: { food: number; wood: number; gold: number };
  trainTimeSec: number;
  villsPerBuilding: {
    food: number;
    wood: number;
    gold: number;
  };
}

export const GATHERING_RATES: GatheringRate[] = [
  // Food sources
  {
    sourceId: "shore_fish",
    name: { en: "Shore Fish (Fisherman)", es: "Pesca de Costa (Pescador)" },
    resource: "food",
    ratePerMin: 25.8,
    notes: {
      en: "Fastest natural food source in Dark Age. Essential on Nomad, African Clearing, and Four Lakes.",
      es: "La fuente de alimento natural más rápida en Edad Oscura. Crucial en Nomad y Four Lakes.",
    },
    tier: "fastest",
  },
  {
    sourceId: "hunt_boar",
    name: { en: "Boar / Hunted Animals", es: "Jabalí / Caza de Animales" },
    resource: "food",
    ratePerMin: 24.6,
    notes: {
      en: "~24% faster gathering than sheep. Always lure both boars directly under your Town Center.",
      es: "~24% más rápido que las ovejas. Atrae siempre los 2 jabalíes bajo el Centro Urbano.",
    },
    tier: "fastest",
  },
  {
    sourceId: "fishing_ship_deep",
    name: { en: "Fishing Ship (Deep Sea Fish)", es: "Barco Pesquero (Pesca Profunda)" },
    resource: "food",
    ratePerMin: 28.2,
    notes: {
      en: "Supreme food income that does not idle or take Town Center creation time.",
      es: "Máximo flujo de comida sin ocupar tiempo de creación del Centro Urbano.",
    },
    tier: "fastest",
  },
  {
    sourceId: "farm_hand_cart",
    name: { en: "Farm with Hand Cart + Heavy Plow", es: "Granja con Carretilla de Mano + Arado Pesado" },
    resource: "food",
    ratePerMin: 24.6,
    notes: {
      en: "Peak farm efficiency in mid-Castle and Imperial Age (+20.5% over un-upgraded farms).",
      es: "Máxima eficiencia de granjas en Castillos e Imperial (+20.5% sobre granjas base).",
    },
    tier: "fast",
  },
  {
    sourceId: "farm_wheelbarrow",
    name: { en: "Farm with Wheelbarrow + Horse Collar", es: "Granja con Carretilla + Collera" },
    resource: "food",
    ratePerMin: 23.1,
    notes: {
      en: "Standard Castle Age farm income (+13.2% farmer efficiency from speed & carry boosts).",
      es: "Producción estándar en Castillos (+13.2% de velocidad y capacidad de carga).",
    },
    tier: "fast",
  },
  {
    sourceId: "farm_base",
    name: { en: "Farm (No Upgrades)", es: "Granja Básica (Sin Mejoras)" },
    resource: "food",
    ratePerMin: 20.4,
    notes: {
      en: "Base Dark & early Feudal farm rate. Farmers lose time walking around farm perimeter.",
      es: "Tasa base en Feudal temprano. Los aldeanos pierden tiempo rodeando la parcela.",
    },
    tier: "medium",
  },
  {
    sourceId: "sheep",
    name: { en: "Sheep / Herdables", es: "Ovejas / Animales Domésticos" },
    resource: "food",
    ratePerMin: 19.8,
    notes: {
      en: "Standard start. Harvest one sheep at a time with 6 villagers to minimize meat decay.",
      es: "Apertura estándar. Recolecta de 1 en 1 con 6 aldeanos para no perder carne por descomposición.",
    },
    tier: "medium",
  },
  {
    sourceId: "berries",
    name: { en: "Berry Bushes (Forager)", es: "Arbustos de Bayas (Recolector)" },
    resource: "food",
    ratePerMin: 18.6,
    notes: {
      en: "Slowest natural food gatherer, but completely free of wood investment.",
      es: "La recolección más lenta, pero totalmente gratuita sin inversión en madera.",
    },
    tier: "slow",
  },

  // Wood sources
  {
    sourceId: "wood_two_man_saw",
    name: { en: "Wood with Two-Man Saw (+58% cumulative)", es: "Madera con Sierra de Dos Hombres" },
    resource: "wood",
    ratePerMin: 37.1,
    notes: {
      en: "Maximum wood rate in Imperial Age for heavy siege and trash unit floods.",
      es: "Máxima recolección de madera en Imperial para asedio e infantería.",
    },
    tier: "fastest",
  },
  {
    sourceId: "wood_bow_saw",
    name: { en: "Wood with Bow Saw (+44% cumulative)", es: "Madera con Tronzador" },
    resource: "wood",
    ratePerMin: 33.7,
    notes: {
      en: "Essential Castle Age tech for supporting 2+ Archery Ranges or 3-TC farm boom.",
      es: "Mejora esencial de Castillos para mantener 2 Galerías o Boom de 3 TCs.",
    },
    tier: "fast",
  },
  {
    sourceId: "wood_double_bit",
    name: { en: "Wood with Double-Bit Axe (+20%)", es: "Madera con Hacha de Doble Filo" },
    resource: "wood",
    ratePerMin: 28.1,
    notes: {
      en: "The single highest-ROI technology in the entire game. Research immediately in Feudal.",
      es: "La tecnología con mayor retorno de inversión de todo el juego. Meter nada más llegar a Feudal.",
    },
    tier: "medium",
  },
  {
    sourceId: "wood_base",
    name: { en: "Wood (Dark Age Base)", es: "Madera Base (Edad Oscura)" },
    resource: "wood",
    ratePerMin: 23.4,
    notes: {
      en: "Base wood chopping speed before Double-Bit Axe.",
      es: "Velocidad base antes de investigar Hacha de Doble Filo.",
    },
    tier: "slow",
  },

  // Gold sources
  {
    sourceId: "gold_shaft_mining",
    name: { en: "Gold with Shaft Mining (+30%)", es: "Oro con Pozo Minero" },
    resource: "gold",
    ratePerMin: 30.1,
    notes: {
      en: "Castle/Imperial gold rate for heavy Knight and Siege spending.",
      es: "Recolección rápida para sostener producción masiva de unidades de oro.",
    },
    tier: "fast",
  },
  {
    sourceId: "gold_mining",
    name: { en: "Gold with Gold Mining (+15%)", es: "Oro con Minería de Oro" },
    resource: "gold",
    ratePerMin: 26.2,
    notes: {
      en: "Solid Castle Age tech when relying on expensive Knight or Crossbow armies.",
      es: "Tecnología clave de Castillos si juegas a doble establo de caballeros.",
    },
    tier: "medium",
  },
  {
    sourceId: "gold_base",
    name: { en: "Gold (Base)", es: "Oro Base (Sin Mejoras)" },
    resource: "gold",
    ratePerMin: 22.8,
    notes: {
      en: "Standard gold mining rate. 7-8 villagers sustain continuous 2-range archer production.",
      es: "Tasa base. 7-8 mineros sostienen producción continua en 2 galerías de tiro.",
    },
    tier: "medium",
  },

  // Stone sources
  {
    sourceId: "stone_mining",
    name: { en: "Stone with Stone Mining (+15%)", es: "Piedra con Minería de Cantería" },
    resource: "stone",
    ratePerMin: 24.7,
    notes: {
      en: "Accelerates defensive and offensive Castle drops in early Castle Age.",
      es: "Acelera la recolección para plantar Castillos en Castillos temprano.",
    },
    tier: "medium",
  },
  {
    sourceId: "stone_base",
    name: { en: "Stone (Base)", es: "Piedra Base (Sin Mejoras)" },
    resource: "stone",
    ratePerMin: 21.5,
    notes: {
      en: "5 villagers on stone gather 650 stone for a Castle in ~6 minutes.",
      es: "5 aldeanos en piedra consiguen 650 de piedra para un Castillo en ~6 minutos.",
    },
    tier: "slow",
  },
];

export const ECO_UPGRADES: EcoUpgradeInfo[] = [
  {
    id: "double_bit_axe",
    name: { en: "Double-Bit Axe", es: "Hacha de Doble Filo" },
    age: "feudal",
    building: "Lumber Camp (Campamento Maderero)",
    cost: { food: 50, wood: 100, gold: 0 },
    researchTimeSec: 25,
    effectDescription: {
      en: "Increases woodchopping speed by +20%.",
      es: "Aumenta la velocidad de recolección de madera en un +20%.",
    },
    payoffMetric: {
      en: "Pays for itself in ~110 seconds with 8 woodcutters.",
      es: "Se amortiza en ~110 segundos con 8 leñadores.",
    },
    bestTimingRule: {
      en: "Always research the very second Feudal Age finishes (Priority #1).",
      es: "Investigar en el segundo exacto que se alcanza la Edad Feudal (Prioridad #1).",
    },
  },
  {
    id: "horse_collar",
    name: { en: "Horse Collar", es: "Collera" },
    age: "feudal",
    building: "Mill (Molino)",
    cost: { food: 75, wood: 75, gold: 0 },
    researchTimeSec: 20,
    effectDescription: {
      en: "Farms provide +75 food before needing to be reseeded (175 -> 250 food).",
      es: "Las granjas rinden +75 de alimento extra antes de agotarse (175 -> 250 comida).",
    },
    payoffMetric: {
      en: "Saves 60 wood per farm re-seed cycle. (Free for Franks!)",
      es: "Ahorra 60 de madera por ciclo de resembrado. (¡Gratis para Francos!)",
    },
    bestTimingRule: {
      en: "Research before seeding your main Feudal/Castle farm mass (around pop 20-25).",
      es: "Investigar antes de plantar la masa principal de granjas (alrededor de pop 20-25).",
    },
  },
  {
    id: "wheelbarrow",
    name: { en: "Wheelbarrow", es: "Carretilla" },
    age: "feudal",
    building: "Town Center (Centro Urbano)",
    cost: { food: 175, wood: 50, gold: 0 },
    researchTimeSec: 75,
    effectDescription: {
      en: "Villagers move +10% faster and carry +25% more resources.",
      es: "Aldeanos se mueven 10% más rápido y cargan 25% más recursos.",
    },
    payoffMetric: {
      en: "Equivalent to roughly +3 extra working villagers in economy output.",
      es: "Equivale aproximadamente a +3 aldeanos extra trabajando en tu economía.",
    },
    bestTimingRule: {
      en: "Optimal at 14–16 farmers (around pop 35–40 or late Feudal transition).",
      es: "Óptimo a partir de 14–16 granjeros (pop 35–40 o transición a Castillos).",
    },
  },
  {
    id: "bow_saw",
    name: { en: "Bow Saw", es: "Tronzador" },
    age: "castle",
    building: "Lumber Camp (Campamento Maderero)",
    cost: { food: 100, wood: 150, gold: 0 },
    researchTimeSec: 30,
    effectDescription: {
      en: "Increases woodchopping speed by another +20% (cumulative +44%).",
      es: "Aumenta la velocidad de tala en otro +20% (acumulado +44%).",
    },
    payoffMetric: {
      en: "Pays for itself in ~130 seconds with 12 woodcutters.",
      es: "Se amortiza en ~130 segundos con 12 leñadores.",
    },
    bestTimingRule: {
      en: "Research immediately upon reaching Castle Age if playing archers, siege, or 3-TC boom.",
      es: "Investigar nada más llegar a Castillos si juegas arqueros, asedio o 3 TCs.",
    },
  },
  {
    id: "heavy_plow",
    name: { en: "Heavy Plow", es: "Arado Pesado" },
    age: "castle",
    building: "Mill (Molino)",
    cost: { food: 125, wood: 125, gold: 0 },
    researchTimeSec: 40,
    effectDescription: {
      en: "Farms provide +125 food (250 -> 375 food) and farmers carry +1 food.",
      es: "Las granjas rinden +125 de comida extra (250 -> 375) y los granjeros cargan +1.",
    },
    payoffMetric: {
      en: "Saves hundreds of wood in Castle Age and prevents early farm burnout.",
      es: "Ahorra cientos de madera y evita que las granjas expiren durante la expansión.",
    },
    bestTimingRule: {
      en: "Research in early Castle Age before expanding to 2nd and 3rd Town Centers.",
      es: "Investigar en Castillos temprano antes de levantar el 2do y 3er Centro Urbano.",
    },
  },
  {
    id: "hand_cart",
    name: { en: "Hand Cart", es: "Carretilla de Mano" },
    age: "castle",
    building: "Town Center (Centro Urbano)",
    cost: { food: 300, wood: 200, gold: 0 },
    researchTimeSec: 55,
    effectDescription: {
      en: "Villagers move +10% faster and carry +50% more resources.",
      es: "Aldeanos se mueven otro 10% más rápido y cargan 50% más recursos.",
    },
    payoffMetric: {
      en: "Equivalent to roughly +6 to +8 working villagers in mid-to-late game.",
      es: "Equivale a tener de +6 a +8 aldeanos extra trabajando en tu economía.",
    },
    bestTimingRule: {
      en: "Research around 25–30+ farmers (mid Castle Age or on way to Imperial).",
      es: "Investigar con 25–30+ granjeros (Castillos medio o camino a Imperial).",
    },
  },
];

export const PRODUCTION_FORMULAS: ProductionUnitFormula[] = [
  {
    id: "tc_villager",
    name: { en: "1 Town Center (Continuous Villagers)", es: "1 Centro Urbano (Aldeanos Continuos)" },
    building: "Town Center",
    cost: { food: 50, wood: 0, gold: 0 },
    trainTimeSec: 25,
    villsPerBuilding: {
      food: 6, // 6 farmers sustain non-stop villager creation (120 food/min)
      wood: 0,
      gold: 0,
    },
  },
  {
    id: "stable_knights",
    name: { en: "1 Stable Knights (60F, 75G)", es: "1 Establo Caballeros (60C, 75O)" },
    building: "Stable",
    cost: { food: 60, wood: 0, gold: 75 },
    trainTimeSec: 30,
    villsPerBuilding: {
      food: 6, // 120 food/min
      wood: 0,
      gold: 7, // 150 gold/min
    },
  },
  {
    id: "range_crossbows",
    name: { en: "1 Range Crossbows (25W, 45G)", es: "1 Galería Ballesteros (25M, 45O)" },
    building: "Archery Range",
    cost: { food: 0, wood: 25, gold: 45 },
    trainTimeSec: 27,
    villsPerBuilding: {
      food: 0,
      wood: 2, // 56 wood/min
      gold: 4, // 100 gold/min
    },
  },
  {
    id: "range_skirmishers",
    name: { en: "1 Range Elite Skirmishers (25F, 35W)", es: "1 Galería Guerrilleros (25C, 35M)" },
    building: "Archery Range",
    cost: { food: 25, wood: 35, gold: 0 },
    trainTimeSec: 22,
    villsPerBuilding: {
      food: 4, // 68 food/min
      wood: 4, // 95 wood/min
      gold: 0,
    },
  },
  {
    id: "barracks_halberdiers",
    name: { en: "1 Barracks Halberdiers (35F, 25W)", es: "1 Cuartel Alabarderos (35C, 25M)" },
    building: "Barracks",
    cost: { food: 35, wood: 25, gold: 0 },
    trainTimeSec: 22,
    villsPerBuilding: {
      food: 5, // 95 food/min
      wood: 3, // 68 wood/min
      gold: 0,
    },
  },
  {
    id: "siege_mangonels",
    name: { en: "1 Workshop Mangonels (160W, 135G)", es: "1 Taller Mangonelas (160M, 135O)" },
    building: "Siege Workshop",
    cost: { food: 0, wood: 160, gold: 135 },
    trainTimeSec: 46,
    villsPerBuilding: {
      food: 0,
      wood: 7, // 208 wood/min
      gold: 7, // 176 gold/min
    },
  },
];

export const CIV_ECO_BONUSES: CivEcoBonus[] = [
  {
    civ: "Franks",
    name: { en: "Franks", es: "Francos" },
    resourceImpact: "food",
    bonusTitle: { en: "Free Mill/Farm Upgrades & +15% Foraging", es: "Mejoras de Granja Gratis & +15% Bayas" },
    bonusFormula: {
      en: "Saves 75F/75W in Feudal, 125F/125W in Castle, and 250F/250W in Imperial instantly upon age-up.",
      es: "Ahorra 75C/75M en Feudal, 125C/125M en Castillos y 250C/250M en Imperial automáticamente al pasar de edad.",
    },
    rateMultiplier: 1.15,
  },
  {
    civ: "Britons",
    name: { en: "Britons", es: "Británicos" },
    resourceImpact: "food",
    bonusTitle: { en: "Shepherds Work +25% Faster", es: "Pastoreo de Ovejas +25% Más Rápido" },
    bonusFormula: {
      en: "Sheep gathered at 24.8 food/min (as fast as hunted boar!). Prevents initial Dark Age food starving.",
      es: "Las ovejas se recolectan a 24.8 comida/min (¡igual de rápido que el jabalí!). Evita cortes en el TC.",
    },
    rateMultiplier: 1.25,
  },
  {
    civ: "Celts",
    name: { en: "Celts", es: "Celtas" },
    resourceImpact: "wood",
    bonusTitle: { en: "Lumberjacks Work +15% Faster", es: "Leñadores Trabajan +15% Más Rápido" },
    bonusFormula: {
      en: "Starts in Dark Age. 6 lumberjacks gather like 7. Saves massive wood for early archers, siege, or farms.",
      es: "Activo desde Edad Oscura. 6 leñadores rinden como 7. Ahorra madera masiva para arqueros o granjas.",
    },
    rateMultiplier: 1.15,
  },
  {
    civ: "Mayans",
    name: { en: "Mayans", es: "Mayas" },
    resourceImpact: "all",
    bonusTitle: { en: "Resources Last +15% Longer", es: "Los Recursos Duran +15% Más" },
    bonusFormula: {
      en: "Each sheep, boar, gold pile, and tree yields 15% more total resources before exhausting.",
      es: "Cada oveja, jabalí, veta de oro y árbol otorga un 15% más de recursos totales antes de agotarse.",
    },
    rateMultiplier: 1.15,
  },
  {
    civ: "Poles",
    name: { en: "Poles", es: "Polacos" },
    resourceImpact: "food",
    bonusTitle: { en: "Folwark Farm Instant +8% Food & Stone Gold", es: "Folwark da 8% Alimento Inmediato & Oro en Piedra" },
    bonusFormula: {
      en: "Seeding a farm next to a Folwark deposits 8% of its total food into your bank immediately.",
      es: "Sembrar una granja junto al Folwark deposita el 8% de toda su comida instantáneamente en tu banco.",
    },
    rateMultiplier: 1.08,
  },
  {
    civ: "Lithuanians",
    name: { en: "Lithuanians", es: "Lituanos" },
    resourceImpact: "food",
    bonusTitle: { en: "+150 Starting Food", es: "+150 de Alimento Inicial" },
    bonusFormula: {
      en: "Enables instant 18-pop Feudal rush or seamless Dark Age scouting without relying on boars.",
      es: "Permite un rush de 18 pop a Feudal o explorar en Edad Oscura sin depender del jabalí inmediato.",
    },
    rateMultiplier: 1.0,
  },
];

export function calculateVillagersForTarget(params: {
  tcCount: number;
  stablesCount: number;
  rangesCrossbowCount: number;
  rangesSkirmCount: number;
  barracksHalbCount: number;
  siegeWorkshopCount: number;
  hasWheelbarrow?: boolean;
  hasDoubleBitAxe?: boolean;
  hasBowSaw?: boolean;
  hasGoldMining?: boolean;
}) {
  const {
    tcCount,
    stablesCount,
    rangesCrossbowCount,
    rangesSkirmCount,
    barracksHalbCount,
    siegeWorkshopCount,
    hasWheelbarrow = true,
    hasDoubleBitAxe = true,
    hasBowSaw = false,
    hasGoldMining = false,
  } = params;

  // Farm rate calculation based on upgrades
  let farmRate = 20.4;
  if (hasWheelbarrow) farmRate = 23.1;

  // Wood rate
  let woodRate = 23.4;
  if (hasDoubleBitAxe) woodRate = 28.1;
  if (hasBowSaw) woodRate = 33.7;

  // Gold rate
  let goldRate = 22.8;
  if (hasGoldMining) goldRate = 26.2;

  // Total required demands per minute
  const foodDemand =
    tcCount * 120 + // 120 food/min per TC
    stablesCount * 120 + // 120 food/min per stable (knights)
    rangesSkirmCount * 68 + // 68 food/min per range (skirms)
    barracksHalbCount * 95; // 95 food/min per barracks (halbs)

  const woodDemand =
    rangesCrossbowCount * 56 + // 56 wood/min per range
    rangesSkirmCount * 95 + // 95 wood/min per range
    barracksHalbCount * 68 + // 68 wood/min per barracks
    siegeWorkshopCount * 208; // 208 wood/min per workshop (mangonels)

  const goldDemand =
    stablesCount * 150 + // 150 gold/min per stable
    rangesCrossbowCount * 100 + // 100 gold/min per range
    siegeWorkshopCount * 176; // 176 gold/min per workshop

  const foodVills = Math.max(Math.ceil(foodDemand / farmRate), 0);
  const woodVills = Math.max(Math.ceil(woodDemand / woodRate), 0);
  const goldVills = Math.max(Math.ceil(goldDemand / goldRate), 0);

  return {
    foodDemand: Math.round(foodDemand),
    woodDemand: Math.round(woodDemand),
    goldDemand: Math.round(goldDemand),
    foodVills,
    woodVills,
    goldVills,
    totalVills: foodVills + woodVills + goldVills,
  };
}
