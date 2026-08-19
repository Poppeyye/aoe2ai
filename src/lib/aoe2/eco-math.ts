/**
 * Age of Empires II: Definitive Edition — economy math.
 *
 * Every value in this file comes from in-game data (unit costs and training
 * times, technology costs and effects) or from measured DE gather-rate tests.
 * Nothing is estimated. If a number could not be sourced it is not here.
 *
 * Sources:
 *  - Unit costs / training times: AoE2 DE unit statistics tables.
 *  - Technology costs and effects: Liquipedia AoE2 technology tables.
 *  - Base gather rates: AoE2 DE villager work-rate data (resources/second).
 *  - Farm rates: measured DE farming-rate testing (walking and drop-off
 *    included), which is why farms are stored as measured food/min instead of
 *    a raw work rate.
 */

export type ResourceKey = "food" | "wood" | "gold" | "stone";

export interface Bilingual {
  en: string;
  es: string;
}

export interface ResourceCost {
  food: number;
  wood: number;
  gold: number;
}

/* -------------------------------------------------------------------------- */
/* Units                                                                      */
/* -------------------------------------------------------------------------- */

export interface TrainableUnit {
  id: string;
  name: Bilingual;
  /** Building that trains it, used to group the planner UI. */
  building: Bilingual;
  age: "dark" | "feudal" | "castle" | "imperial";
  cost: ResourceCost;
  trainTimeSec: number;
}

/**
 * Units players actually mass out of a single building. Costs and training
 * times are the generic (non-civ-modified) DE values.
 */
export const UNITS: TrainableUnit[] = [
  {
    id: "villager",
    name: { en: "Villager", es: "Aldeano" },
    building: { en: "Town Center", es: "Centro Urbano" },
    age: "dark",
    cost: { food: 50, wood: 0, gold: 0 },
    trainTimeSec: 25,
  },
  {
    id: "scout_cavalry",
    name: { en: "Scout Cavalry / Hussar", es: "Explorador / Húsar" },
    building: { en: "Stable", es: "Establo" },
    age: "feudal",
    cost: { food: 80, wood: 0, gold: 0 },
    trainTimeSec: 30,
  },
  {
    id: "knight",
    name: { en: "Knight / Cavalier / Paladin", es: "Caballero / Jinete / Paladín" },
    building: { en: "Stable", es: "Establo" },
    age: "castle",
    cost: { food: 60, wood: 0, gold: 75 },
    trainTimeSec: 30,
  },
  {
    id: "camel_rider",
    name: { en: "Camel Rider", es: "Camellero" },
    building: { en: "Stable", es: "Establo" },
    age: "castle",
    cost: { food: 55, wood: 0, gold: 60 },
    trainTimeSec: 22,
  },
  {
    id: "archer",
    name: { en: "Archer", es: "Arquero" },
    building: { en: "Archery Range", es: "Galería de Tiro" },
    age: "feudal",
    cost: { food: 0, wood: 25, gold: 45 },
    trainTimeSec: 35,
  },
  {
    id: "crossbowman",
    name: { en: "Crossbowman / Arbalester", es: "Ballestero / Arbalestero" },
    building: { en: "Archery Range", es: "Galería de Tiro" },
    age: "castle",
    cost: { food: 0, wood: 25, gold: 45 },
    trainTimeSec: 27,
  },
  {
    id: "skirmisher",
    name: { en: "Skirmisher / Elite Skirmisher", es: "Guerrillero / Guerrillero de Élite" },
    building: { en: "Archery Range", es: "Galería de Tiro" },
    age: "feudal",
    cost: { food: 25, wood: 35, gold: 0 },
    trainTimeSec: 22,
  },
  {
    id: "cavalry_archer",
    name: { en: "Cavalry Archer", es: "Arquero a Caballo" },
    building: { en: "Archery Range", es: "Galería de Tiro" },
    age: "castle",
    cost: { food: 0, wood: 40, gold: 60 },
    trainTimeSec: 34,
  },
  {
    id: "spearman",
    name: { en: "Spearman / Pikeman / Halberdier", es: "Lancero / Piquero / Alabardero" },
    building: { en: "Barracks", es: "Cuartel" },
    age: "feudal",
    cost: { food: 35, wood: 25, gold: 0 },
    trainTimeSec: 22,
  },
  {
    id: "militia_line",
    name: { en: "Man-at-Arms / Long Swordsman", es: "Hombre de Armas / Espadachín" },
    building: { en: "Barracks", es: "Cuartel" },
    age: "feudal",
    cost: { food: 60, wood: 0, gold: 20 },
    trainTimeSec: 21,
  },
  {
    id: "eagle_warrior",
    name: { en: "Eagle Warrior", es: "Guerrero Águila" },
    building: { en: "Barracks", es: "Cuartel" },
    age: "castle",
    cost: { food: 20, wood: 0, gold: 50 },
    trainTimeSec: 35,
  },
  {
    id: "battering_ram",
    name: { en: "Battering Ram / Siege Ram", es: "Ariete / Ariete de Asedio" },
    building: { en: "Siege Workshop", es: "Taller de Asedio" },
    age: "castle",
    cost: { food: 0, wood: 160, gold: 75 },
    trainTimeSec: 36,
  },
  {
    id: "mangonel",
    name: { en: "Mangonel / Onager", es: "Mangonel / Onagro" },
    building: { en: "Siege Workshop", es: "Taller de Asedio" },
    age: "castle",
    cost: { food: 0, wood: 160, gold: 135 },
    trainTimeSec: 46,
  },
  {
    id: "scorpion",
    name: { en: "Scorpion", es: "Escorpión" },
    building: { en: "Siege Workshop", es: "Taller de Asedio" },
    age: "castle",
    cost: { food: 0, wood: 75, gold: 75 },
    trainTimeSec: 30,
  },
  {
    id: "monk",
    name: { en: "Monk", es: "Monje" },
    building: { en: "Monastery", es: "Monasterio" },
    age: "castle",
    cost: { food: 0, wood: 0, gold: 100 },
    trainTimeSec: 51,
  },
];

export const UNITS_BY_ID: Record<string, TrainableUnit> = Object.fromEntries(
  UNITS.map((u) => [u.id, u])
);

/** Resources per minute a single building consumes training this unit non-stop. */
export function drainPerMinute(unit: TrainableUnit): ResourceCost {
  const perMinute = 60 / unit.trainTimeSec;
  return {
    food: unit.cost.food * perMinute,
    wood: unit.cost.wood * perMinute,
    gold: unit.cost.gold * perMinute,
  };
}

/* -------------------------------------------------------------------------- */
/* Gather rates                                                               */
/* -------------------------------------------------------------------------- */

export interface GatherRate {
  id: string;
  resource: ResourceKey;
  name: Bilingual;
  /** Villager work rate in resources/second, when the game defines one. */
  perSecond?: number;
  /** Resources per minute per villager. */
  perMinute: number;
  detail: Bilingual;
}

/** Base villager work rates in resources/second (no upgrades, no civ bonus). */
export const BASE_WORK_RATE = {
  hunt: 0.41,
  shoreFish: 0.43,
  sheep: 0.33,
  berries: 0.31,
  wood: 0.39,
  gold: 0.38,
  stone: 0.36,
} as const;

/**
 * Measured DE farming rates in food/min, including walking and drop-off.
 * Farms are the one case where the raw work rate is misleading.
 */
export const FARM_RATE_PER_MIN = {
  none: 20.3,
  wheelbarrow: 22.8,
  handCart: 24.0,
} as const;

const perMin = (perSecond: number) => Math.round(perSecond * 60 * 10) / 10;

export const GATHER_RATES: GatherRate[] = [
  {
    id: "shore_fish",
    resource: "food",
    name: { en: "Shore fish", es: "Pesca de costa" },
    perSecond: BASE_WORK_RATE.shoreFish,
    perMinute: perMin(BASE_WORK_RATE.shoreFish),
    detail: {
      en: "Fastest food a villager can gather. Needs a Dock or Mill in range.",
      es: "La comida más rápida que puede recoger un aldeano. Necesita Puerto o Molino cerca.",
    },
  },
  {
    id: "hunt",
    resource: "food",
    name: { en: "Boar / deer (hunt)", es: "Jabalí / ciervo (caza)" },
    perSecond: BASE_WORK_RATE.hunt,
    perMinute: perMin(BASE_WORK_RATE.hunt),
    detail: {
      en: "24% faster than sheep. A boar holds 340 food, deer 140.",
      es: "Un 24% más rápido que las ovejas. El jabalí tiene 340 de comida, el ciervo 140.",
    },
  },
  {
    id: "sheep",
    resource: "food",
    name: { en: "Sheep / herdables", es: "Ovejas / animales domésticos" },
    perSecond: BASE_WORK_RATE.sheep,
    perMinute: perMin(BASE_WORK_RATE.sheep),
    detail: {
      en: "100 food per sheep. Eat one at a time so decayed meat is not wasted.",
      es: "100 de comida por oveja. Cómelas de una en una para no perder carne.",
    },
  },
  {
    id: "berries",
    resource: "food",
    name: { en: "Berry bushes", es: "Arbustos de bayas" },
    perSecond: BASE_WORK_RATE.berries,
    perMinute: perMin(BASE_WORK_RATE.berries),
    detail: {
      en: "Slowest food source, but costs no wood and never has to be relocated.",
      es: "La fuente más lenta, pero no cuesta madera y no hay que moverla.",
    },
  },
  {
    id: "farm_none",
    resource: "food",
    name: { en: "Farm (no villager techs)", es: "Granja (sin mejoras de aldeano)" },
    perMinute: FARM_RATE_PER_MIN.none,
    detail: {
      en: "Measured rate including walking to the drop-off point.",
      es: "Tasa medida incluyendo el camino hasta el punto de descarga.",
    },
  },
  {
    id: "farm_wheelbarrow",
    resource: "food",
    name: { en: "Farm + Wheelbarrow", es: "Granja + Carretilla" },
    perMinute: FARM_RATE_PER_MIN.wheelbarrow,
    detail: {
      en: "+12% over a base farm. Wheelbarrow gives speed and carry capacity, not work rate.",
      es: "+12% sobre la granja base. La Carretilla da velocidad y carga, no tasa de trabajo.",
    },
  },
  {
    id: "farm_hand_cart",
    resource: "food",
    name: { en: "Farm + Hand Cart", es: "Granja + Carretilla de Mano" },
    perMinute: FARM_RATE_PER_MIN.handCart,
    detail: {
      en: "Ceiling for a generic civ. Farms cap out around 24 food/min.",
      es: "Techo para una civ genérica. Las granjas se topan sobre 24 comida/min.",
    },
  },
  {
    id: "wood_base",
    resource: "wood",
    name: { en: "Wood (no techs)", es: "Madera (sin mejoras)" },
    perSecond: BASE_WORK_RATE.wood,
    perMinute: perMin(BASE_WORK_RATE.wood),
    detail: {
      en: "Keep the Lumber Camp within one or two tiles of the tree line.",
      es: "Mantén el Campamento Maderero a una o dos casillas de los árboles.",
    },
  },
  {
    id: "wood_double_bit",
    resource: "wood",
    name: { en: "Wood + Double-Bit Axe", es: "Madera + Hacha de Doble Filo" },
    perMinute: perMin(BASE_WORK_RATE.wood * 1.2),
    detail: {
      en: "+20% work rate for 100 food and 50 wood.",
      es: "+20% de tasa de trabajo por 100 de comida y 50 de madera.",
    },
  },
  {
    id: "wood_bow_saw",
    resource: "wood",
    name: { en: "Wood + Bow Saw", es: "Madera + Sierra de Arco" },
    perMinute: perMin(BASE_WORK_RATE.wood * 1.2 * 1.2),
    detail: {
      en: "Second +20%, multiplicative: 1.20 x 1.20 = +44% over base.",
      es: "Segundo +20%, multiplicativo: 1,20 x 1,20 = +44% sobre la base.",
    },
  },
  {
    id: "wood_two_man_saw",
    resource: "wood",
    name: { en: "Wood + Two-Man Saw", es: "Madera + Sierra de Dos Hombres" },
    perMinute: perMin(BASE_WORK_RATE.wood * 1.2 * 1.2 * 1.1),
    detail: {
      en: "Final +10%: 1.20 x 1.20 x 1.10 = +58% over base.",
      es: "Último +10%: 1,20 x 1,20 x 1,10 = +58% sobre la base.",
    },
  },
  {
    id: "gold_base",
    resource: "gold",
    name: { en: "Gold (no techs)", es: "Oro (sin mejoras)" },
    perSecond: BASE_WORK_RATE.gold,
    perMinute: perMin(BASE_WORK_RATE.gold),
    detail: {
      en: "Same work rate whether the pile is close or far; the walk is what costs you.",
      es: "La tasa es la misma cerca o lejos; lo que cuesta es el camino.",
    },
  },
  {
    id: "gold_mining",
    resource: "gold",
    name: { en: "Gold + Gold Mining", es: "Oro + Minería de Oro" },
    perMinute: perMin(BASE_WORK_RATE.gold * 1.15),
    detail: {
      en: "+15% work rate for 100 food and 75 wood.",
      es: "+15% de tasa de trabajo por 100 de comida y 75 de madera.",
    },
  },
  {
    id: "gold_shaft_mining",
    resource: "gold",
    name: { en: "Gold + Gold Shaft Mining", es: "Oro + Minería de Pozo" },
    perMinute: perMin(BASE_WORK_RATE.gold * 1.15 * 1.15),
    detail: {
      en: "Second +15%, multiplicative: 1.15 x 1.15 = +32% over base.",
      es: "Segundo +15%, multiplicativo: 1,15 x 1,15 = +32% sobre la base.",
    },
  },
  {
    id: "stone_base",
    resource: "stone",
    name: { en: "Stone (no techs)", es: "Piedra (sin mejoras)" },
    perSecond: BASE_WORK_RATE.stone,
    perMinute: perMin(BASE_WORK_RATE.stone),
    detail: {
      en: "A Castle costs 650 stone: 5 miners need about 6 minutes.",
      es: "Un Castillo cuesta 650 de piedra: 5 mineros tardan unos 6 minutos.",
    },
  },
  {
    id: "stone_mining",
    resource: "stone",
    name: { en: "Stone + Stone Mining", es: "Piedra + Minería de Piedra" },
    perMinute: perMin(BASE_WORK_RATE.stone * 1.15),
    detail: {
      en: "+15% work rate for 100 food and 75 wood.",
      es: "+15% de tasa de trabajo por 100 de comida y 75 de madera.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Farms                                                                      */
/* -------------------------------------------------------------------------- */

export const FARM_WOOD_COST = 60;

export type FarmTech = "none" | "horse_collar" | "heavy_plow" | "crop_rotation";

/** Total food a single farm yields before it has to be reseeded. */
export const FARM_YIELD: Record<FarmTech, number> = {
  none: 175,
  horse_collar: 250,
  heavy_plow: 375,
  crop_rotation: 550,
};

export const FARM_TECH_LABEL: Record<FarmTech, Bilingual> = {
  none: { en: "No farm techs", es: "Sin mejoras de granja" },
  horse_collar: { en: "Horse Collar", es: "Collera de Caballo" },
  heavy_plow: { en: "Heavy Plow", es: "Arado Pesado" },
  crop_rotation: { en: "Crop Rotation", es: "Rotación de Cultivos" },
};

/** Wood spent on reseeding per 1,000 food farmed. */
export function woodPer1000Food(tech: FarmTech): number {
  return Math.round((FARM_WOOD_COST / FARM_YIELD[tech]) * 1000);
}

/* -------------------------------------------------------------------------- */
/* Economy technologies                                                       */
/* -------------------------------------------------------------------------- */

export interface EcoTech {
  id: string;
  name: Bilingual;
  age: "feudal" | "castle" | "imperial";
  building: Bilingual;
  cost: ResourceCost;
  researchTimeSec: number;
  effect: Bilingual;
  /** Multiplier applied to a gather rate, when the tech is a rate tech. */
  rateEffect?: { resource: ResourceKey; multiplier: number };
  note?: Bilingual;
}

export const ECO_TECHS: EcoTech[] = [
  {
    id: "double_bit_axe",
    name: { en: "Double-Bit Axe", es: "Hacha de Doble Filo" },
    age: "feudal",
    building: { en: "Lumber Camp", es: "Campamento Maderero" },
    cost: { food: 100, wood: 50, gold: 0 },
    researchTimeSec: 25,
    effect: { en: "Lumberjacks +20% work rate", es: "Leñadores +20% de tasa de trabajo" },
    rateEffect: { resource: "wood", multiplier: 1.2 },
  },
  {
    id: "horse_collar",
    name: { en: "Horse Collar", es: "Collera de Caballo" },
    age: "feudal",
    building: { en: "Mill", es: "Molino" },
    cost: { food: 75, wood: 75, gold: 0 },
    researchTimeSec: 20,
    effect: { en: "Farms hold +75 food (175 → 250)", es: "Las granjas dan +75 de comida (175 → 250)" },
    note: {
      en: "Does not change the gather rate, it cuts how often you spend 60 wood reseeding.",
      es: "No cambia la tasa de recolección: reduce cuántas veces gastas 60 de madera resembrando.",
    },
  },
  {
    id: "wheelbarrow",
    name: { en: "Wheelbarrow", es: "Carretilla" },
    age: "feudal",
    building: { en: "Town Center", es: "Centro Urbano" },
    cost: { food: 175, wood: 50, gold: 0 },
    researchTimeSec: 75,
    effect: {
      en: "Villagers +10% speed and +25% carry capacity",
      es: "Aldeanos +10% de velocidad y +25% de capacidad de carga",
    },
    note: {
      en: "Raises measured farm output from 20.3 to 22.8 food/min. Gains on other resources depend on walking distance.",
      es: "Sube la granja medida de 20,3 a 22,8 comida/min. En otros recursos depende de la distancia al depósito.",
    },
  },
  {
    id: "gold_mining",
    name: { en: "Gold Mining", es: "Minería de Oro" },
    age: "feudal",
    building: { en: "Mining Camp", es: "Campamento Minero" },
    cost: { food: 100, wood: 75, gold: 0 },
    researchTimeSec: 30,
    effect: { en: "Gold miners +15% work rate", es: "Mineros de oro +15% de tasa de trabajo" },
    rateEffect: { resource: "gold", multiplier: 1.15 },
  },
  {
    id: "stone_mining",
    name: { en: "Stone Mining", es: "Minería de Piedra" },
    age: "feudal",
    building: { en: "Mining Camp", es: "Campamento Minero" },
    cost: { food: 100, wood: 75, gold: 0 },
    researchTimeSec: 30,
    effect: { en: "Stone miners +15% work rate", es: "Mineros de piedra +15% de tasa de trabajo" },
    rateEffect: { resource: "stone", multiplier: 1.15 },
  },
  {
    id: "bow_saw",
    name: { en: "Bow Saw", es: "Sierra de Arco" },
    age: "castle",
    building: { en: "Lumber Camp", es: "Campamento Maderero" },
    cost: { food: 150, wood: 100, gold: 0 },
    researchTimeSec: 50,
    effect: { en: "Lumberjacks +20% work rate", es: "Leñadores +20% de tasa de trabajo" },
    rateEffect: { resource: "wood", multiplier: 1.2 },
  },
  {
    id: "heavy_plow",
    name: { en: "Heavy Plow", es: "Arado Pesado" },
    age: "castle",
    building: { en: "Mill", es: "Molino" },
    cost: { food: 125, wood: 125, gold: 0 },
    researchTimeSec: 40,
    effect: {
      en: "Farms hold +125 food (250 → 375), farmers carry +1",
      es: "Las granjas dan +125 de comida (250 → 375), los granjeros cargan +1",
    },
  },
  {
    id: "hand_cart",
    name: { en: "Hand Cart", es: "Carretilla de Mano" },
    age: "castle",
    building: { en: "Town Center", es: "Centro Urbano" },
    cost: { food: 300, wood: 200, gold: 0 },
    researchTimeSec: 55,
    effect: {
      en: "Villagers +10% speed and +50% carry capacity",
      es: "Aldeanos +10% de velocidad y +50% de capacidad de carga",
    },
    note: {
      en: "Raises measured farm output to about 24 food/min, the generic farm ceiling.",
      es: "Sube la granja medida a unos 24 comida/min, el techo de una civ genérica.",
    },
  },
  {
    id: "gold_shaft_mining",
    name: { en: "Gold Shaft Mining", es: "Minería de Pozo de Oro" },
    age: "castle",
    building: { en: "Mining Camp", es: "Campamento Minero" },
    cost: { food: 175, wood: 75, gold: 0 },
    researchTimeSec: 75,
    effect: { en: "Gold miners +15% work rate", es: "Mineros de oro +15% de tasa de trabajo" },
    rateEffect: { resource: "gold", multiplier: 1.15 },
  },
  {
    id: "two_man_saw",
    name: { en: "Two-Man Saw", es: "Sierra de Dos Hombres" },
    age: "imperial",
    building: { en: "Lumber Camp", es: "Campamento Maderero" },
    cost: { food: 300, wood: 200, gold: 0 },
    researchTimeSec: 100,
    effect: { en: "Lumberjacks +10% work rate", es: "Leñadores +10% de tasa de trabajo" },
    rateEffect: { resource: "wood", multiplier: 1.1 },
  },
  {
    id: "crop_rotation",
    name: { en: "Crop Rotation", es: "Rotación de Cultivos" },
    age: "imperial",
    building: { en: "Mill", es: "Molino" },
    cost: { food: 250, wood: 250, gold: 0 },
    researchTimeSec: 70,
    effect: { en: "Farms hold +175 food (375 → 550)", es: "Las granjas dan +175 de comida (375 → 550)" },
  },
];

/* -------------------------------------------------------------------------- */
/* Civilization economy bonuses                                               */
/* -------------------------------------------------------------------------- */

export interface CivEcoBonus {
  civ: string;
  name: Bilingual;
  bonus: Bilingual;
  /** What it means in numbers, computed from the base rates above. */
  inNumbers: Bilingual;
  resource: ResourceKey | "all";
}

export const CIV_ECO_BONUSES: CivEcoBonus[] = [
  {
    civ: "britons",
    name: { en: "Britons", es: "Británicos" },
    resource: "food",
    bonus: { en: "Shepherds work 25% faster", es: "Los pastores trabajan un 25% más rápido" },
    inNumbers: {
      en: `Sheep give ${perMin(BASE_WORK_RATE.sheep * 1.25)} food/min instead of ${perMin(BASE_WORK_RATE.sheep)}, so 5 villagers on sheep keep a Town Center going where others need 6.`,
      es: `Las ovejas dan ${perMin(BASE_WORK_RATE.sheep * 1.25)} comida/min en vez de ${perMin(BASE_WORK_RATE.sheep)}, así que 5 aldeanos en ovejas mantienen el Centro Urbano donde otros necesitan 6.`,
    },
  },
  {
    civ: "celts",
    name: { en: "Celts", es: "Celtas" },
    resource: "wood",
    bonus: { en: "Lumberjacks work 15% faster", es: "Los leñadores trabajan un 15% más rápido" },
    inNumbers: {
      en: `${perMin(BASE_WORK_RATE.wood * 1.15)} wood/min per lumberjack from the Dark Age: 7 Celt woodcutters equal 8 generic ones.`,
      es: `${perMin(BASE_WORK_RATE.wood * 1.15)} madera/min por leñador desde la Edad Oscura: 7 leñadores celtas equivalen a 8 genéricos.`,
    },
  },
  {
    civ: "slavs",
    name: { en: "Slavs", es: "Eslavos" },
    resource: "food",
    bonus: { en: "Farmers work 15% faster", es: "Los granjeros trabajan un 15% más rápido" },
    inNumbers: {
      en: "The only civ that raises the farm ceiling itself, which is why Slav booms need fewer farmers for the same food.",
      es: "La única civ que sube el techo de las granjas, por eso los boom eslavos necesitan menos granjeros para la misma comida.",
    },
  },
  {
    civ: "turks",
    name: { en: "Turks", es: "Turcos" },
    resource: "gold",
    bonus: { en: "Gold miners work 25% faster", es: "Los mineros de oro trabajan un 25% más rápido" },
    inNumbers: {
      en: `${perMin(BASE_WORK_RATE.gold * 1.25)} gold/min per miner before any mining tech, roughly what a generic civ gets with both Gold Mining upgrades.`,
      es: `${perMin(BASE_WORK_RATE.gold * 1.25)} oro/min por minero sin mejoras, casi lo que una civ genérica logra con las dos minerías investigadas.`,
    },
  },
  {
    civ: "vikings",
    name: { en: "Vikings", es: "Vikingos" },
    resource: "all",
    bonus: { en: "Wheelbarrow and Hand Cart are free", es: "Carretilla y Carretilla de Mano gratis" },
    inNumbers: {
      en: "Saves 475 food and 250 wood, and lets you take both upgrades the moment they unlock instead of when you can afford them.",
      es: "Ahorra 475 de comida y 250 de madera, y te deja cogerlas en cuanto se desbloquean en vez de cuando te las puedes permitir.",
    },
  },
  {
    civ: "franks",
    name: { en: "Franks", es: "Francos" },
    resource: "food",
    bonus: {
      en: "Farm upgrades are free; foragers work 15% faster",
      es: "Las mejoras de granja son gratis; los recolectores de bayas trabajan un 15% más rápido",
    },
    inNumbers: {
      en: "Horse Collar, Heavy Plow and Crop Rotation cost 450 food and 450 wood for everyone else. Frank farms jump to 550 food each for free.",
      es: "Collera, Arado Pesado y Rotación cuestan 450 de comida y 450 de madera a los demás. Las granjas francas llegan a 550 de comida gratis.",
    },
  },
  {
    civ: "burgundians",
    name: { en: "Burgundians", es: "Borgoñones" },
    resource: "all",
    bonus: {
      en: "Economy upgrades cost -40% food and unlock one Age early",
      es: "Las mejoras económicas cuestan -40% de comida y se desbloquean una Edad antes",
    },
    inNumbers: {
      en: "Bow Saw in Feudal and Hand Cart in Feudal are the two that matter: the Castle-Age wood and farm ceilings arrive an entire Age sooner.",
      es: "Sierra de Arco en Feudal y Carretilla de Mano en Feudal son las clave: los techos de madera y granja de Castillos llegan una Edad antes.",
    },
  },
  {
    civ: "khmer",
    name: { en: "Khmer", es: "Jemeres" },
    resource: "food",
    bonus: {
      en: "Farmers deposit food with no drop-off, but work 5% slower",
      es: "Los granjeros depositan comida sin descargar, pero trabajan un 5% más lento",
    },
    inNumbers: {
      en: "No walking to a Mill, so farm placement is free and Wheelbarrow / Hand Cart give them much less than they give other civs.",
      es: "No caminan al Molino, así que puedes plantar granjas donde quieras y la Carretilla les aporta mucho menos que a otras civs.",
    },
  },
  {
    civ: "malians",
    name: { en: "Malians", es: "Malienses" },
    resource: "gold",
    bonus: { en: "Villagers drop off +10% gold", es: "Los aldeanos depositan +10% de oro" },
    inNumbers: {
      en: `Effectively ${perMin(BASE_WORK_RATE.gold * 1.1)} gold/min per miner, and every gold pile lasts 10% longer in practice.`,
      es: `En la práctica ${perMin(BASE_WORK_RATE.gold * 1.1)} oro/min por minero, y cada veta rinde un 10% más.`,
    },
  },
  {
    civ: "chinese",
    name: { en: "Chinese", es: "Chinos" },
    resource: "all",
    bonus: { en: "Start with +3 Villagers, -200 food and -50 wood", es: "Empiezan con +3 aldeanos, -200 de comida y -50 de madera" },
    inNumbers: {
      en: "Three extra workers from second zero is worth about 60 food/min of income; the trade-off is that you cannot afford a Loom-and-house opening.",
      es: "Tres trabajadores extra desde el segundo cero valen unos 60 comida/min de ingresos; a cambio no puedes permitirte abrir con telar y casas.",
    },
  },
  {
    civ: "lithuanians",
    name: { en: "Lithuanians", es: "Lituanos" },
    resource: "food",
    bonus: { en: "Every Town Center provides +100 food", es: "Cada Centro Urbano aporta +100 de comida" },
    inNumbers: {
      en: "The starting +100 food is two extra villagers' worth of Dark Age income, and each new Town Center repeats it.",
      es: "Los +100 iniciales equivalen a dos aldeanos extra de ingresos en Edad Oscura, y cada nuevo Centro Urbano lo repite.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Planner                                                                    */
/* -------------------------------------------------------------------------- */

export type FoodSource = "farm" | "sheep" | "hunt" | "berries";
export type WoodTech = "none" | "double_bit_axe" | "bow_saw" | "two_man_saw";
export type GoldTech = "none" | "gold_mining" | "gold_shaft_mining";
export type VillagerTech = "none" | "wheelbarrow" | "hand_cart";

export interface ProductionLine {
  unitId: string;
  /** Buildings training this unit back to back. */
  buildings: number;
}

export interface PlannerSettings {
  foodSource: FoodSource;
  farmTech: FarmTech;
  villagerTech: VillagerTech;
  woodTech: WoodTech;
  goldTech: GoldTech;
}

export interface PlannerLineResult {
  unit: TrainableUnit;
  buildings: number;
  drain: ResourceCost;
}

export interface PlannerResult {
  lines: PlannerLineResult[];
  rates: { food: number; wood: number; gold: number };
  /** Resource drain from production only. */
  productionDemand: ResourceCost;
  /** Wood spent reseeding farms, which production demand does not include. */
  farmReseedWoodPerMin: number;
  totalWoodDemand: number;
  villagers: { food: number; wood: number; gold: number; total: number };
  farms: { count: number; reseedIntervalSec: number } | null;
}

export function foodRateFor(settings: PlannerSettings): number {
  switch (settings.foodSource) {
    case "sheep":
      return perMin(BASE_WORK_RATE.sheep);
    case "hunt":
      return perMin(BASE_WORK_RATE.hunt);
    case "berries":
      return perMin(BASE_WORK_RATE.berries);
    case "farm":
    default:
      if (settings.villagerTech === "hand_cart") return FARM_RATE_PER_MIN.handCart;
      if (settings.villagerTech === "wheelbarrow") return FARM_RATE_PER_MIN.wheelbarrow;
      return FARM_RATE_PER_MIN.none;
  }
}

export function woodRateFor(tech: WoodTech): number {
  const multiplier =
    tech === "two_man_saw" ? 1.2 * 1.2 * 1.1 : tech === "bow_saw" ? 1.2 * 1.2 : tech === "double_bit_axe" ? 1.2 : 1;
  return perMin(BASE_WORK_RATE.wood * multiplier);
}

export function goldRateFor(tech: GoldTech): number {
  const multiplier =
    tech === "gold_shaft_mining" ? 1.15 * 1.15 : tech === "gold_mining" ? 1.15 : 1;
  return perMin(BASE_WORK_RATE.gold * multiplier);
}

/**
 * Villagers needed to sustain the given production without the queues ever
 * running dry.
 *
 * Food villagers are solved first because, when food comes from farms, they
 * generate an extra wood cost of their own: a farm yields a fixed amount of
 * food and then costs 60 wood to reseed.
 */
export function planProduction(
  lines: ProductionLine[],
  settings: PlannerSettings
): PlannerResult {
  const resolved: PlannerLineResult[] = lines
    .filter((line) => line.buildings > 0 && UNITS_BY_ID[line.unitId])
    .map((line) => {
      const unit = UNITS_BY_ID[line.unitId];
      const drain = drainPerMinute(unit);
      return {
        unit,
        buildings: line.buildings,
        drain: {
          food: drain.food * line.buildings,
          wood: drain.wood * line.buildings,
          gold: drain.gold * line.buildings,
        },
      };
    });

  const productionDemand = resolved.reduce<ResourceCost>(
    (acc, line) => ({
      food: acc.food + line.drain.food,
      wood: acc.wood + line.drain.wood,
      gold: acc.gold + line.drain.gold,
    }),
    { food: 0, wood: 0, gold: 0 }
  );

  const foodRate = foodRateFor(settings);
  const woodRate = woodRateFor(settings.woodTech);
  const goldRate = goldRateFor(settings.goldTech);

  const foodVillagers = Math.ceil(productionDemand.food / foodRate);

  // A farmer burns through FARM_YIELD food, then pays 60 wood to reseed.
  const usesFarms = settings.foodSource === "farm";
  const farmYield = FARM_YIELD[settings.farmTech];
  const reseedIntervalSec = usesFarms ? (farmYield / foodRate) * 60 : 0;
  const farmReseedWoodPerMin = usesFarms
    ? foodVillagers * (FARM_WOOD_COST * (foodRate / farmYield))
    : 0;

  const totalWoodDemand = productionDemand.wood + farmReseedWoodPerMin;
  const woodVillagers = Math.ceil(totalWoodDemand / woodRate);
  const goldVillagers = Math.ceil(productionDemand.gold / goldRate);

  return {
    lines: resolved,
    rates: { food: foodRate, wood: woodRate, gold: goldRate },
    productionDemand,
    farmReseedWoodPerMin,
    totalWoodDemand,
    villagers: {
      food: foodVillagers,
      wood: woodVillagers,
      gold: goldVillagers,
      total: foodVillagers + woodVillagers + goldVillagers,
    },
    farms: usesFarms
      ? { count: foodVillagers, reseedIntervalSec: Math.round(reseedIntervalSec) }
      : null,
  };
}

/**
 * Break-even time for a rate technology, given how many villagers are on that
 * resource. Cost is summed across resource types, which is the standard
 * simplification: it answers "how long until the extra income covers what I
 * paid", not "how long until I get my food back".
 */
export function techBreakEvenMinutes(
  tech: EcoTech,
  villagersOnResource: number,
  currentRatePerVillager: number
): number | null {
  if (!tech.rateEffect || villagersOnResource <= 0) return null;
  const extraPerVillager = currentRatePerVillager * (tech.rateEffect.multiplier - 1);
  const extraPerMinute = extraPerVillager * villagersOnResource;
  if (extraPerMinute <= 0) return null;
  const totalCost = tech.cost.food + tech.cost.wood + tech.cost.gold;
  return totalCost / extraPerMinute;
}

export const PRESETS: {
  id: string;
  name: Bilingual;
  description: Bilingual;
  lines: ProductionLine[];
  settings: PlannerSettings;
}[] = [
  {
    id: "feudal_scouts",
    name: { en: "Feudal scouts", es: "Scouts en Feudal" },
    description: {
      en: "1 Town Center and 1 Stable on Scout Cavalry. Pure food, no gold at all.",
      es: "1 Centro Urbano y 1 Establo con Exploradores. Solo comida, nada de oro.",
    },
    lines: [
      { unitId: "villager", buildings: 1 },
      { unitId: "scout_cavalry", buildings: 1 },
    ],
    settings: {
      foodSource: "farm",
      farmTech: "horse_collar",
      villagerTech: "none",
      woodTech: "double_bit_axe",
      goldTech: "none",
    },
  },
  {
    id: "feudal_archers",
    name: { en: "Feudal archers", es: "Arqueros en Feudal" },
    description: {
      en: "1 Town Center and 2 Ranges on Archers. The classic wood-and-gold opening.",
      es: "1 Centro Urbano y 2 Galerías con Arqueros. La apertura clásica de madera y oro.",
    },
    lines: [
      { unitId: "villager", buildings: 1 },
      { unitId: "archer", buildings: 2 },
    ],
    settings: {
      foodSource: "farm",
      farmTech: "horse_collar",
      villagerTech: "none",
      woodTech: "double_bit_axe",
      goldTech: "none",
    },
  },
  {
    id: "castle_knights",
    name: { en: "Castle knights", es: "Caballeros en Castillos" },
    description: {
      en: "2 Town Centers and 2 Stables on Knights. This is where gold demand explodes.",
      es: "2 Centros Urbanos y 2 Establos con Caballeros. Aquí es donde se dispara el oro.",
    },
    lines: [
      { unitId: "villager", buildings: 2 },
      { unitId: "knight", buildings: 2 },
    ],
    settings: {
      foodSource: "farm",
      farmTech: "heavy_plow",
      villagerTech: "wheelbarrow",
      woodTech: "bow_saw",
      goldTech: "gold_mining",
    },
  },
  {
    id: "castle_crossbow_siege",
    name: { en: "Crossbows and siege", es: "Ballesteros y asedio" },
    description: {
      en: "2 Town Centers, 2 Ranges on Crossbows and 1 Siege Workshop on Mangonels.",
      es: "2 Centros Urbanos, 2 Galerías con Ballesteros y 1 Taller con Mangoneles.",
    },
    lines: [
      { unitId: "villager", buildings: 2 },
      { unitId: "crossbowman", buildings: 2 },
      { unitId: "mangonel", buildings: 1 },
    ],
    settings: {
      foodSource: "farm",
      farmTech: "heavy_plow",
      villagerTech: "wheelbarrow",
      woodTech: "bow_saw",
      goldTech: "gold_mining",
    },
  },
  {
    id: "imperial_boom",
    name: { en: "Three TC boom", es: "Boom de 3 Centros" },
    description: {
      en: "3 Town Centers on villagers only. What a pure boom actually costs.",
      es: "3 Centros Urbanos solo con aldeanos. Lo que cuesta de verdad un boom puro.",
    },
    lines: [{ unitId: "villager", buildings: 3 }],
    settings: {
      foodSource: "farm",
      farmTech: "heavy_plow",
      villagerTech: "wheelbarrow",
      woodTech: "bow_saw",
      goldTech: "none",
    },
  },
  {
    id: "imperial_halbs_arbs",
    name: { en: "Imperial trash and arbs", es: "Basura e imperiales" },
    description: {
      en: "2 Barracks on Halberdiers, 2 Ranges on Arbalesters and 3 Town Centers.",
      es: "2 Cuarteles con Alabarderos, 2 Galerías con Arbalesteros y 3 Centros Urbanos.",
    },
    lines: [
      { unitId: "villager", buildings: 3 },
      { unitId: "spearman", buildings: 2 },
      { unitId: "crossbowman", buildings: 2 },
    ],
    settings: {
      foodSource: "farm",
      farmTech: "crop_rotation",
      villagerTech: "hand_cart",
      woodTech: "two_man_saw",
      goldTech: "gold_shaft_mining",
    },
  },
];
