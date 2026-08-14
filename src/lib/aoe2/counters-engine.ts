export type GameAge = "feudal" | "castle" | "imperial";

export interface UnitDefinition {
  id: string;
  name: { en: string; es: string };
  age: GameAge;
  building: "barracks" | "archery_range" | "stable" | "siege_workshop" | "monastery" | "castle";
  cost: { food: number; wood: number; gold: number; stone: number };
  trainTimeSec: number;
  type: "cavalry" | "ranged" | "infantry" | "siege" | "monk" | "trash" | "unique";
  counters: string[]; // unit ids this unit counters
  counteredBy: string[]; // unit ids that counter this unit
  description: { en: string; es: string };
}

export const UNITS_CATALOG: Record<string, UnitDefinition> = {
  // Ranged
  archers: {
    id: "archers",
    name: { en: "Archers / Crossbowmen", es: "Arqueros / Ballesteros" },
    age: "feudal",
    building: "archery_range",
    cost: { food: 0, wood: 25, gold: 45, stone: 0 },
    trainTimeSec: 27,
    type: "ranged",
    counters: ["infantry", "monks"],
    counteredBy: ["skirmishers", "knights", "mangonels", "huskarls"],
    description: {
      en: "Deadly in mass with range and ballistics. Vulnerable to siege and high pierce armor.",
      es: "Letales agrupados con flecha punzón y balística. Vulnerables al asedio y armadura antiproyectil.",
    },
  },
  cav_archers: {
    id: "cav_archers",
    name: { en: "Cavalry Archers", es: "Arqueros a Caballo" },
    age: "castle",
    building: "archery_range",
    cost: { food: 0, wood: 40, gold: 60, stone: 0 },
    trainTimeSec: 34,
    type: "ranged",
    counters: ["infantry", "knights", "monks"],
    counteredBy: ["skirmishers", "camel_archers", "mangonels"],
    description: {
      en: "High mobility and heavy hit-and-run capability. Requires significant tech investment.",
      es: "Alta movilidad y daño en movimiento continuo. Requieren muchas mejoras tecnológicas.",
    },
  },
  skirmishers: {
    id: "skirmishers",
    name: { en: "Elite Skirmishers", es: "Guerrilleros de Élite" },
    age: "feudal",
    building: "archery_range",
    cost: { food: 25, wood: 35, gold: 0, stone: 0 },
    trainTimeSec: 22,
    type: "trash",
    counters: ["archers", "cav_archers", "hand_cannoneers", "spearmen"],
    counteredBy: ["knights", "infantry", "mangonels", "scouts"],
    description: {
      en: "Cost-effective trash counter to archers with massive pierce armor and bonus damage.",
      es: "Unidad basura de contraataque directo a arqueros gracias a su alta armadura antiproyectil.",
    },
  },

  // Cavalry
  knights: {
    id: "knights",
    name: { en: "Knights / Cavalier / Paladin", es: "Caballeros / Paladines" },
    age: "castle",
    building: "stable",
    cost: { food: 60, wood: 0, gold: 75, stone: 0 },
    trainTimeSec: 30,
    type: "cavalry",
    counters: ["archers", "skirmishers", "siege", "infantry"],
    counteredBy: ["spearmen", "camels", "monks", "kamayuks"],
    description: {
      en: "The powerhouse of Castle Age. High HP, mobility, and armor to raid and breach lines.",
      es: "La espina dorsal de Castillos. Gran vida, armadura y movilidad para quebrar líneas y raidear.",
    },
  },
  scouts: {
    id: "scouts",
    name: { en: "Scouts / Light Cav / Hussar", es: "Exploradores / Húsares" },
    age: "feudal",
    building: "stable",
    cost: { food: 80, wood: 0, gold: 0, stone: 0 },
    trainTimeSec: 30,
    type: "trash",
    counters: ["monks", "siege", "skirmishers"],
    counteredBy: ["spearmen", "knights", "camels", "infantry"],
    description: {
      en: "Fast raiding unit that costs only food. Natural conversion resistance vs monks.",
      es: "Unidad veloz que solo cuesta alimento. Resistencia pasiva a conversiones de monjes.",
    },
  },
  camels: {
    id: "camels",
    name: { en: "Camel Riders / Heavy Camel", es: "Jinetes de Camello" },
    age: "castle",
    building: "stable",
    cost: { food: 55, wood: 0, gold: 60, stone: 0 },
    trainTimeSec: 22,
    type: "cavalry",
    counters: ["knights", "scouts", "cav_archers"],
    counteredBy: ["spearmen", "archers", "infantry", "monks"],
    description: {
      en: "Mobile anti-cavalry specialist with massive bonus damage against horses.",
      es: "Especialista móvil anticaballería con un enorme bonus de daño contra caballos.",
    },
  },

  // Infantry
  spearmen: {
    id: "spearmen",
    name: { en: "Pikemen / Halberdiers", es: "Piqueros / Alabarderos" },
    age: "feudal",
    building: "barracks",
    cost: { food: 35, wood: 25, gold: 0, stone: 0 },
    trainTimeSec: 22,
    type: "trash",
    counters: ["knights", "scouts", "camels", "elephants"],
    counteredBy: ["archers", "skirmishers", "infantry", "mangonels"],
    description: {
      en: "The essential trash counter to all cavalry. High multiplier damage vs mounted units.",
      es: "El counter de basura indispensable contra toda caballería con daño multiplicador masivo.",
    },
  },
  longswords: {
    id: "longswords",
    name: { en: "Long Swordsmen / Champions", es: "Hombres de Armas / Campeones" },
    age: "feudal",
    building: "barracks",
    cost: { food: 60, wood: 0, gold: 20, stone: 0 },
    trainTimeSec: 21,
    type: "infantry",
    counters: ["spearmen", "skirmishers", "eagles", "buildings"],
    counteredBy: ["archers", "knights", "hand_cannoneers", "mangonels"],
    description: {
      en: "Affordable melee line that shreds trash armies, buildings, and eagle warriors.",
      es: "Infantería cuerpo a cuerpo ideal para arrasar basura, edificios y guerreros águila.",
    },
  },
  eagles: {
    id: "eagles",
    name: { en: "Eagle Warriors", es: "Guerreros Águila" },
    age: "feudal",
    building: "barracks",
    cost: { food: 20, wood: 0, gold: 50, stone: 0 },
    trainTimeSec: 35,
    type: "infantry",
    counters: ["archers", "monks", "siege"],
    counteredBy: ["longswords", "knights", "hand_cannoneers"],
    description: {
      en: "Fast Mesoamerican infantry with high pierce armor and monk/siege bonus.",
      es: "Infantería mesoamericana veloz con alta armadura antiproyectil y bonus contra monjes y asedio.",
    },
  },

  // Siege & Monks
  mangonels: {
    id: "mangonels",
    name: { en: "Mangonels / Onagers", es: "Mangonelas / Onagros" },
    age: "castle",
    building: "siege_workshop",
    cost: { food: 0, wood: 160, gold: 135, stone: 0 },
    trainTimeSec: 46,
    type: "siege",
    counters: ["archers", "skirmishers", "infantry"],
    counteredBy: ["knights", "scouts", "eagles", "bombards", "monks"],
    description: {
      en: "Area of effect devastation. One flat shot can wipe an entire clump of archers.",
      es: "Daño en área devastador. Un disparo certero puede borrar una masa entera de arqueros.",
    },
  },
  scorpions: {
    id: "scorpions",
    name: { en: "Scorpions / Heavy Scorpion", es: "Escorpiones" },
    age: "castle",
    building: "siege_workshop",
    cost: { food: 0, wood: 75, gold: 75, stone: 0 },
    trainTimeSec: 30,
    type: "siege",
    counters: ["infantry", "archers", "spearmen"],
    counteredBy: ["knights", "mangonels", "scouts", "bombards"],
    description: {
      en: "Linear pierce damage that excels against infantry corridors and chokepoints.",
      es: "Daño penetrante lineal perfecto para frenar oleadas de infantería en cuellos de botella.",
    },
  },
  monks: {
    id: "monks",
    name: { en: "Monks", es: "Monjes" },
    age: "castle",
    building: "monastery",
    cost: { food: 0, wood: 0, gold: 100, stone: 0 },
    trainTimeSec: 51,
    type: "monk",
    counters: ["knights", "elephants", "mangonels"],
    counteredBy: ["scouts", "eagles", "archers"],
    description: {
      en: "Converts expensive high-value enemy units and heals damaged military.",
      es: "Convierte unidades enemigas de alto coste y cura a las tropas aliadas.",
    },
  },
  hand_cannoneers: {
    id: "hand_cannoneers",
    name: { en: "Hand Cannoneers", es: "Artilleros Manuales" },
    age: "imperial",
    building: "archery_range",
    cost: { food: 45, wood: 0, gold: 50, stone: 0 },
    trainTimeSec: 34,
    type: "ranged",
    counters: ["infantry", "eagles", "spearmen"],
    counteredBy: ["archers", "skirmishers", "knights", "mangonels"],
    description: {
      en: "High raw attack gunpowder infantry killer with +10 bonus vs infantry lines.",
      es: "Pólvora con +10 de ataque extra contra toda línea de infantería.",
    },
  },
};

// Standard gather rates (per villager per minute in standard speed with basic eco tech)
const GATHER_RATES = {
  food: 21.5,
  wood: 24.0,
  gold: 23.5,
  stone: 21.0,
};

export interface CounterRecommendation {
  primaryCounter: UnitDefinition;
  secondaryCounter: UnitDefinition;
  siegeSupport: UnitDefinition | null;
  tacticalWhy: { en: string; es: string };
  recommendedBuildings: Array<{ name: string; count: number }>;
  villagerEcoBalance: {
    food: number;
    wood: number;
    gold: number;
    stone: number;
    total: number;
  };
  keyTechnologies: Array<{ name: string; where: string; effect: { en: string; es: string } }>;
  civAdvantageNote?: { en: string; es: string };
}

export function calculateCounterArmy(params: {
  enemyUnits: Array<{ unitId: string; quantity: number }>;
  playerCiv?: string;
  enemyCiv?: string;
  gameAge: GameAge;
}): CounterRecommendation {
  const { enemyUnits, playerCiv, gameAge } = params;

  // Tally enemy threat categories
  let cavalryScore = 0;
  let rangedScore = 0;
  let infantryScore = 0;
  let siegeScore = 0;
  let monkScore = 0;

  for (const item of enemyUnits) {
    const unit = UNITS_CATALOG[item.unitId];
    if (!unit) continue;
    const q = item.quantity || 1;

    if (unit.type === "cavalry" || unit.id === "knights" || unit.id === "scouts") {
      cavalryScore += q * 1.5;
    } else if (unit.type === "ranged" || unit.id === "archers" || unit.id === "cav_archers") {
      rangedScore += q * 1.2;
    } else if (unit.type === "infantry" || unit.id === "longswords" || unit.id === "eagles") {
      infantryScore += q;
    } else if (unit.type === "siege") {
      siegeScore += q * 2.0;
    } else if (unit.type === "monk") {
      monkScore += q * 1.5;
    }
  }

  // Determine dominant enemy compositions
  let primaryCounterId = "knights";
  let secondaryCounterId = "archers";
  let siegeSupportId: string | null = "mangonels";
  let tacticalWhy = {
    en: "Balanced mixed composition to handle enemy pressure.",
    es: "Composición mixta equilibrada para frenar el empuje rival.",
  };

  if (cavalryScore >= rangedScore && cavalryScore >= infantryScore) {
    // Enemy is cavalry heavy
    primaryCounterId = "spearmen";
    secondaryCounterId = rangedScore > 5 ? "skirmishers" : "monks";
    siegeSupportId = null;
    tacticalWhy = {
      en: `Heavy cavalry detected. Mass Pikemen with defensive armor and add Monks for conversions or Camels for mobile map control.`,
      es: `Presencia dominante de caballería. Masifica Piqueros con armadura de herrería y añade Monjes para conversiones o Camellos para controlar el mapa.`,
    };
  } else if (rangedScore > cavalryScore && rangedScore >= infantryScore) {
    // Enemy is archer heavy
    primaryCounterId = "skirmishers";
    secondaryCounterId = gameAge === "feudal" ? "scouts" : "knights";
    siegeSupportId = gameAge !== "feudal" ? "mangonels" : null;
    tacticalWhy = {
      en: `Massed archers detected. Elite Skirmishers absorb arrow fire, while Knights/Mangonels flank to eliminate their clumped mass.`,
      es: `Masa de arqueros detectada. Los Guerrilleros absorben el fuego enemigo mientras Jinetes o Mangonelas flanquean para destruir su grupo.`,
    };
  } else if (infantryScore > cavalryScore && infantryScore > rangedScore) {
    // Enemy is infantry heavy
    primaryCounterId = gameAge === "imperial" ? "hand_cannoneers" : "archers";
    secondaryCounterId = "knights";
    siegeSupportId = "scorpions";
    tacticalWhy = {
      en: `Infantry flood detected. Grouped Crossbows/Hand Cannoneers shred infantry armor, supported by Scorpions in chokepoints.`,
      es: `Oleada de infantería detectada. Ballesteros o Artilleros Manuales destrozan la armadura de infantería con soporte de Escorpiones.`,
    };
  }

  const primary = UNITS_CATALOG[primaryCounterId] || UNITS_CATALOG.knights;
  const secondary = UNITS_CATALOG[secondaryCounterId] || UNITS_CATALOG.skirmishers;
  const siege = siegeSupportId ? UNITS_CATALOG[siegeSupportId] : null;

  // Calculate required production per minute for a standard 2-production-building setup
  const primaryPerMin = (60 / primary.trainTimeSec) * 2;
  const secondaryPerMin = (60 / secondary.trainTimeSec) * 2;

  const foodDemandPerMin =
    primary.cost.food * primaryPerMin + secondary.cost.food * secondaryPerMin;
  const woodDemandPerMin =
    primary.cost.wood * primaryPerMin + secondary.cost.wood * secondaryPerMin + (siege ? (60 / siege.trainTimeSec) * siege.cost.wood : 0);
  const goldDemandPerMin =
    primary.cost.gold * primaryPerMin + secondary.cost.gold * secondaryPerMin + (siege ? (60 / siege.trainTimeSec) * siege.cost.gold : 0);

  // Villagers required
  const foodVills = Math.max(Math.ceil(foodDemandPerMin / GATHER_RATES.food), 0);
  const woodVills = Math.max(Math.ceil(woodDemandPerMin / GATHER_RATES.wood), 0);
  const goldVills = Math.max(Math.ceil(goldDemandPerMin / GATHER_RATES.gold), 0);
  const totalVills = foodVills + woodVills + goldVills;

  // Buildings needed
  const buildingsMap = new Map<string, number>();
  buildingsMap.set(primary.building, (buildingsMap.get(primary.building) || 0) + 2);
  buildingsMap.set(secondary.building, (buildingsMap.get(secondary.building) || 0) + 2);
  if (siege) {
    buildingsMap.set("siege_workshop", 1);
  }

  const recommendedBuildings = Array.from(buildingsMap.entries()).map(([key, count]) => {
    const formatted = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { name: formatted, count };
  });

  // Technologies
  const techs = [
    {
      name: "Scale / Chain Barding Armor",
      where: "Blacksmith (Herrería)",
      effect: {
        en: "Increases defense against ranged and melee attacks.",
        es: "Aumenta la defensa clave contra proyectiles o melé.",
      },
    },
    {
      name: "Bodkin Arrow / Fletching",
      where: "Blacksmith (Herrería)",
      effect: {
        en: "+1 Range and +1 Attack for ranged units and towers.",
        es: "+1 Rango y +1 Ataque para unidades a distancia.",
      },
    },
    {
      name: "Ballistics",
      where: "University (Universidad)",
      effect: {
        en: "Enables ranged units to lead moving targets and hit dodging units.",
        es: "Permite a tus proyectiles impactar en objetivos en movimiento.",
      },
    },
  ];

  return {
    primaryCounter: primary,
    secondaryCounter: secondary,
    siegeSupport: siege,
    tacticalWhy,
    recommendedBuildings,
    villagerEcoBalance: {
      food: foodVills,
      wood: woodVills,
      gold: goldVills,
      stone: 0,
      total: totalVills,
    },
    keyTechnologies: techs,
    civAdvantageNote: playerCiv
      ? {
        en: `Your chosen civilization bonuses apply to production speeds and discounts.`,
        es: `Las bonificaciones de tu civilización mejoran los costes y la velocidad de producción.`,
      }
      : undefined,
  };
}
