export interface CivMatchupAnalysis {
  civ1: {
    slug: string;
    name: string;
    archetype: string;
    keyStrengths: string[];
    uniqueUnits: string[];
    powerSpike: string;
  };
  civ2: {
    slug: string;
    name: string;
    archetype: string;
    keyStrengths: string[];
    uniqueUnits: string[];
    powerSpike: string;
  };
  overview: {
    en: string;
    es: string;
  };
  earlyGameDynamics: {
    favored: "civ1" | "civ2" | "even";
    title: { en: string; es: string };
    analysis: { en: string; es: string };
  };
  castleAgeSpikes: {
    favored: "civ1" | "civ2" | "even";
    title: { en: string; es: string };
    analysis: { en: string; es: string };
  };
  lateGameImperial: {
    favored: "civ1" | "civ2" | "even";
    title: { en: string; es: string };
    analysis: { en: string; es: string };
  };
  countersCiv1VsCiv2: {
    title: { en: string; es: string };
    units: Array<{ name: string; target: string; why: { en: string; es: string } }>;
  };
  countersCiv2VsCiv1: {
    title: { en: string; es: string };
    units: Array<{ name: string; target: string; why: { en: string; es: string } }>;
  };
  strategicGamePlanCiv1: {
    opening: { en: string; es: string };
    midGame: { en: string; es: string };
    winCondition: { en: string; es: string };
  };
  strategicGamePlanCiv2: {
    opening: { en: string; es: string };
    midGame: { en: string; es: string };
    winCondition: { en: string; es: string };
  };
  mapContext: {
    arabia: { en: string; es: string };
    arena: { en: string; es: string };
    waterNomad: { en: string; es: string };
  };
  faqs: Array<{
    question: { en: string; es: string };
    answer: { en: string; es: string };
  }>;
}

export interface CivMetadata {
  slug: string;
  name: string;
  archetype: "cavalry" | "archers" | "infantry" | "camels" | "siege" | "gunpowder" | "flex" | "navy";
  strengths: { en: string[]; es: string[] };
  uniqueUnits: string[];
  powerSpikes: { en: string; es: string };
}

export const CIV_DATA: Record<string, CivMetadata> = {
  franks: {
    slug: "franks",
    name: "Franks",
    archetype: "cavalry",
    strengths: {
      en: ["+20% Cavalry HP", "Free mill/farm upgrades", "Cheaper Castles (-25%)", "Faster foraging (+15%)"],
      es: ["+20% PG de caballería", "Mejoras de molino/granja gratis", "Castillos un 25% más baratos", "Recolección de bayas un 15% más rápida"],
    },
    uniqueUnits: ["Throwing Axeman", "Paladin"],
    powerSpikes: {
      en: "Early Feudal (Scouts) & Early Castle Age (Knight HP spike)",
      es: "Feudal temprano (Scouts) y Castillos temprano (+20% PG en Jinetes)",
    },
  },
  britons: {
    slug: "britons",
    name: "Britons",
    archetype: "archers",
    strengths: {
      en: ["+1/+2 Archer range in Castle/Imp", "Faster Town Centers (+10%/+20%)", "Faster shepherds (+25%)", "Cheaper TCs in Castle Age"],
      es: ["+1/+2 alcance de arqueros en Castillos/Imp", "Centros Urbanos trabajan más rápido (+10%/+20%)", "Pastoreo un 25% más rápido", "TCs más baratos en Castillos"],
    },
    uniqueUnits: ["Longbowman"],
    powerSpikes: {
      en: "Castle Age Crossbows with Bodkin Arrow (+1 Range) & Trebuchets with Warwolf",
      es: "Ballesteros en Castillos (+1 rango) y Trabucos con Warwolf",
    },
  },
  mayans: {
    slug: "mayans",
    name: "Mayans",
    archetype: "archers",
    strengths: {
      en: ["Longer lasting resources (+15%)", "Cheaper Archers (-10%/-20%/-30%)", "Free llama & extra villager start", "Eagle Warriors with El Dorado (+40 HP)"],
      es: ["Recursos duran 15% más", "Arqueros más baratos (-10%/-20%/-30%)", "Llama gratis y +1 aldeano inicial", "Guerreros Águila con El Dorado (+40 PG)"],
    },
    uniqueUnits: ["Plumed Archer", "Eagle Warrior"],
    powerSpikes: {
      en: "Feudal archer spam and Imperial Eagle Warrior wave",
      es: "Masa de arqueros en Feudal y oleada de Águilas en Imperial",
    },
  },
  goths: {
    slug: "goths",
    name: "Goths",
    archetype: "infantry",
    strengths: {
      en: ["Cheaper infantry (-20%/-25%/-30%/-35%)", "Faster infantry production with Perfusion (+100%)", "+10 pop cap in Imperial", "Huskarls with massive pierce armor"],
      es: ["Infantería más barata (-20%/-25%/-30%/-35%)", "Producción de infantería ultrarrápida con Perfusión (+100%)", "+10 límite de población en Imperial", "Huskarls con armadura antiproyectil masiva"],
    },
    uniqueUnits: ["Huskarl"],
    powerSpikes: {
      en: "Imperial Age infantry flood & Huskarl switch",
      es: "Inundación de infantería y Huskarls en Edad Imperial",
    },
  },
  mongols: {
    slug: "mongols",
    name: "Mongols",
    archetype: "archers",
    strengths: {
      en: ["Hunting +40% faster", "Light Cavalry / Hussars +30% HP", "Mangudai fire instantly with bonus vs siege", "Faster Drill Siege"],
      es: ["Caza un 40% más rápida", "Caballería ligera / Húsares con +30% PG", "Mangudai con disparo inmediato y bonus vs asedio", "Asedio rápido con Taladro"],
    },
    uniqueUnits: ["Mangudai", "Siege Onager"],
    powerSpikes: {
      en: "Rapid 18-19 Pop Scouts & Imperial Mangudai + Siege",
      es: "Scouts ultra tempranos (18-19 Pop) y Mangudai + Asedio en Imperial",
    },
  },
  byzantines: {
    slug: "byzantines",
    name: "Byzantines",
    archetype: "flex",
    strengths: {
      en: ["Trash units -25% cheaper (Spears, Skirms, Camels)", "Buildings +10% to +40% HP", "Free Town Watch/Patrol", "Cheaper Imperial Age (-33%)"],
      es: ["Unidades basura un 25% más baratas (Piqueros, Guerrilleros, Camellos)", "Edificios con +10% a +40% PG", "Guardia Urbana gratis", "Edad Imperial un 33% más barata"],
    },
    uniqueUnits: ["Cataphract"],
    powerSpikes: {
      en: "Discounted counter-army hold in Castle Age & Cheap Fast Imperial",
      es: "Defensa con unidades counter baratas en Castillos y Pase rápido a Imperial",
    },
  },
  huns: {
    slug: "huns",
    name: "Huns",
    archetype: "cavalry",
    strengths: {
      en: ["No houses required (start with max pop limit)", "Cheaper Cavalry Archers (-10%/-20%)", "Trebuchets +35% accuracy with Marauders"],
      es: ["No necesitan casas (empiezan al límite de población)", "Arqueros a caballo más baratos (-10%/-20%)", "Trabucos con +35% precisión"],
    },
    uniqueUnits: ["Tarkan", "Cavalry Archer"],
    powerSpikes: {
      en: "Feudal scout rush without house bottlenecks & Castle Age Cav Archer mass",
      es: "Rush de scouts en Feudal sin atascos de casas y masa de arqueros a caballo en Castillos",
    },
  },
  teutons: {
    slug: "teutons",
    name: "Teutons",
    archetype: "cavalry",
    strengths: {
      en: ["Free melee armor for barracks/stable units (+1 in Castle, +2 in Imp)", "Cheaper farms (-40%)", "Town Centers garrison +10 units & +5 range", "Monks heal from double range"],
      es: ["Armadura cuerpo a cuerpo gratis (+1 en Castillos, +2 en Imp)", "Granjas un 40% más baratas", "Centros Urbanos guarecen +10 unidades y +5 rango", "Monjes curan al doble de distancia"],
    },
    uniqueUnits: ["Teutonic Knight"],
    powerSpikes: {
      en: "Castle Age Ironclad siege push & Melee Armor cavalry trades",
      es: "Empuje de asedio y jinetes con armadura extra en Castillos",
    },
  },
  aztecs: {
    slug: "aztecs",
    name: "Aztecs",
    archetype: "infantry",
    strengths: {
      en: ["Villagers carry +3 extra resources", "Military units created 11% faster", "Monks +5 HP per monastery tech", "Free loom at start"],
      es: ["Aldeanos cargan +3 recursos extra", "Unidades militares se crean un 11% más rápido", "Monjes con +5 PG por tecnología de monasterio", "Telar gratis al inicio"],
    },
    uniqueUnits: ["Jaguar Warrior", "Eagle Warrior"],
    powerSpikes: {
      en: "Feudal early aggression & Castle Age Monk + Siege Smush",
      es: "Agresión temprana en Feudal y Smush de Monjes + Asedio en Castillos",
    },
  },
  berbers: {
    slug: "berbers",
    name: "Berbers",
    archetype: "camels",
    strengths: {
      en: ["Stable units -15%/-20% cheaper in Castle/Imp", "Villagers move +10% faster", "Camel Archers counter cavalry archers", "Ships move +10% faster"],
      es: ["Unidades de establo un 15%/20% más baratas en Castillos/Imp", "Aldeanos se mueven un 10% más rápido", "Arqueros a camello destrozan arqueros a caballo", "Barcos 10% más veloces"],
    },
    uniqueUnits: ["Camel Archer", "Genitour"],
    powerSpikes: {
      en: "Castle Age cheap Knights + Camels mass",
      es: "Masa masiva y barata de Jinetes + Camellos en Castillos",
    },
  },
  lithuanians: {
    slug: "lithuanians",
    name: "Lithuanians",
    archetype: "cavalry",
    strengths: {
      en: ["+150 starting food", "Knights and Leitis gain +1 attack per garrisoned Relic (up to +4)", "Spearmen & Skirmishers move +10% faster", "Tower Shields give +2 pierce armor to trash"],
      es: ["+150 de alimento inicial", "Jinetes y Leitis ganan +1 de ataque por reliquia (hasta +4)", "Piqueros y Guerrilleros se mueven 10% más rápido", "Escudos pavés otorgan +2 armadura antiproyectil"],
    },
    uniqueUnits: ["Leitis", "Winged Hussar"],
    powerSpikes: {
      en: "Instant 18-pop Feudal opening & Relic-boosted Knights in Castle Age",
      es: "Apertura a Feudal ultra rápida (18 pop) y Jinetes potenciados por reliquias en Castillos",
    },
  },
  poles: {
    slug: "poles",
    name: "Poles",
    archetype: "cavalry",
    strengths: {
      en: ["Folwark provides instant 8% food on farm placement", "Stone miners generate 0.5 gold per stone", "Szlachta Privileges makes Knights cost 60% less gold", "Winged Hussars trample armor"],
      es: ["Folwark da 8% de alimento instantáneo al colocar granjas", "Canteros generan oro adicional al picar piedra", "Privilegios de Szlachta reduce el coste de oro de los Jinetes un 60%", "Húsares alados perforan armaduras"],
    },
    uniqueUnits: ["Obuch", "Winged Hussar"],
    powerSpikes: {
      en: "Mid-Castle Age Folwark boom & Cheap Knight spam",
      es: "Boom con Folwark en Castillos y spam económico de Jinetes",
    },
  },
};

export const POPULAR_MATCHUPS: Array<{ civ1: string; civ2: string; slug: string }> = [
  { civ1: "franks", civ2: "britons", slug: "franks-vs-britons" },
  { civ1: "mayans", civ2: "goths", slug: "mayans-vs-goths" },
  { civ1: "mongols", civ2: "huns", slug: "mongols-vs-huns" },
  { civ1: "byzantines", civ2: "franks", slug: "byzantines-vs-franks" },
  { civ1: "aztecs", civ2: "teutons", slug: "aztecs-vs-teutons" },
  { civ1: "berbers", civ2: "mongols", slug: "berbers-vs-mongols" },
  { civ1: "lithuanians", civ2: "franks", slug: "lithuanians-vs-franks" },
  { civ1: "poles", civ2: "britons", slug: "poles-vs-britons" },
  { civ1: "teutons", civ2: "goths", slug: "teutons-vs-goths" },
  { civ1: "byzantines", civ2: "mayans", slug: "byzantines-vs-mayans" },
  { civ1: "berbers", civ2: "franks", slug: "berbers-vs-franks" },
  { civ1: "mongols", civ2: "britons", slug: "mongols-vs-britons" },
];

export function parseMatchupSlug(slug: string): { civ1Slug: string; civ2Slug: string } | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;
  return { civ1Slug: parts[0].toLowerCase(), civ2Slug: parts[1].toLowerCase() };
}

export function buildMatchupSlug(civ1: string, civ2: string): string {
  return `${civ1.toLowerCase()}-vs-${civ2.toLowerCase()}`;
}

export function getCivMatchupData(civ1Slug: string, civ2Slug: string): CivMatchupAnalysis | null {
  const c1 = CIV_DATA[civ1Slug] || {
    slug: civ1Slug,
    name: civ1Slug.charAt(0).toUpperCase() + civ1Slug.slice(1),
    archetype: "flex" as const,
    strengths: {
      en: ["Flexible tech tree", "Competitive unit options"],
      es: ["Árbol tecnológico versátil", "Opciones competitivas de unidades"],
    },
    uniqueUnits: ["Unique Unit"],
    powerSpikes: {
      en: "Castle Age transition",
      es: "Transición a Edad de los Castillos",
    },
  };

  const c2 = CIV_DATA[civ2Slug] || {
    slug: civ2Slug,
    name: civ2Slug.charAt(0).toUpperCase() + civ2Slug.slice(1),
    archetype: "flex" as const,
    strengths: {
      en: ["Flexible tech tree", "Competitive unit options"],
      es: ["Árbol tecnológico versátil", "Opciones competitivas de unidades"],
    },
    uniqueUnits: ["Unique Unit"],
    powerSpikes: {
      en: "Castle Age transition",
      es: "Transición a Edad de los Castillos",
    },
  };

  // Compute dynamics based on archetypes
  let earlyFavored: "civ1" | "civ2" | "even" = "even";
  let castleFavored: "civ1" | "civ2" | "even" = "even";
  let lateFavored: "civ1" | "civ2" | "even" = "even";

  if (c1.archetype === "cavalry" && c2.archetype === "archers") {
    earlyFavored = "civ1";
    castleFavored = "even";
    lateFavored = "civ1";
  } else if (c1.archetype === "archers" && c2.archetype === "cavalry") {
    earlyFavored = "civ2";
    castleFavored = "even";
    lateFavored = "civ2";
  } else if (c1.slug === "goths" && c2.archetype === "archers") {
    earlyFavored = "civ2";
    castleFavored = "civ1";
    lateFavored = "civ1";
  } else if (c1.archetype === "camels" && c2.archetype === "cavalry") {
    earlyFavored = "even";
    castleFavored = "civ1";
    lateFavored = "civ1";
  }

  return {
    civ1: {
      slug: c1.slug,
      name: c1.name,
      archetype: c1.archetype,
      keyStrengths: c1.strengths.en,
      uniqueUnits: c1.uniqueUnits,
      powerSpike: c1.powerSpikes.en,
    },
    civ2: {
      slug: c2.slug,
      name: c2.name,
      archetype: c2.archetype,
      keyStrengths: c2.strengths.en,
      uniqueUnits: c2.uniqueUnits,
      powerSpike: c2.powerSpikes.en,
    },
    overview: {
      en: `${c1.name} vs ${c2.name} is a classic competitive matchup pitting ${c1.name}'s ${c1.archetype} identity against ${c2.name}'s ${c2.archetype} toolkit. Tempo control in early Feudal and Castle Age power spikes decide the outcome on open maps.`,
      es: `${c1.name} contra ${c2.name} es un enfrentamiento clásico que enfrenta la identidad de ${c1.archetype} de los ${c1.name} con el enfoque de ${c2.archetype} de los ${c2.name}. El control del ritmo en Feudal temprano y los picos de poder en Castillos deciden la partida.`,
    },
    earlyGameDynamics: {
      favored: earlyFavored,
      title: {
        en: "Dark & Feudal Age: Early Map Pressure & Eco Scaling",
        es: "Edad Oscura y Feudal: Presión Temprana y Escalado Económico",
      },
      analysis: {
        en: `${c1.name} aims to use their eco bonus to initiate early pressure, while ${c2.name} must respect timing windows and secure vital resource lines behind defensive walls.`,
        es: `${c1.name} busca aprovechar sus ventajas económicas para tomar la iniciativa, mientras que ${c2.name} debe respetar los tiempos de ataque y asegurar sus recursos clave con empalizadas defensivas.`,
      },
    },
    castleAgeSpikes: {
      favored: castleFavored,
      title: {
        en: "Castle Age: Power Spikes & Siege Transitions",
        es: "Edad de los Castillos: Picos de Poder y Transiciones de Asedio",
      },
      analysis: {
        en: `Upon reaching Castle Age, army composition upgrades become decisive. Controlling the center gold and securing relics sets up the late-game advantage.`,
        es: `Al llegar a Castillos, las mejoras militares y la movilidad son críticas. Controlar las reliquias y los oros neutrales determina quién impone el ritmo.`,
      },
    },
    lateGameImperial: {
      favored: lateFavored,
      title: {
        en: "Imperial Age: Post-Imp Compositions & Gold Efficiency",
        es: "Edad Imperial: Composiciones Finales y Eficiencia de Oro",
      },
      analysis: {
        en: `In late Imperial, the player with the more cost-effective composition or stronger unique units gains overwhelming leverage once gold becomes scarce.`,
        es: `En Imperial tardío, la civilización con unidades únicas más determinantes o mejor ejército trash gana una ventaja definitiva cuando el oro empieza a escasear.`,
      },
    },
    countersCiv1VsCiv2: {
      title: {
        en: `${c1.name}'s Key Counter Options vs ${c2.name}`,
        es: `Opciones Clave de Contraataque de ${c1.name} vs ${c2.name}`,
      },
      units: [
        {
          name: c1.uniqueUnits[0] || "Main Unit",
          target: c2.name + " Main Army",
          why: {
            en: `Exploits the core weaknesses in ${c2.name}'s standard composition.`,
            es: `Castiga los puntos débiles de la composición habitual de ${c2.name}.`,
          },
        },
        {
          name: c1.archetype === "cavalry" ? "Knights / Light Cav" : "Crossbowmen / Skirmishers",
          target: "Eco & Raiding",
          why: {
            en: "Provides continuous raiding pressure on woodlines and gold piles.",
            es: "Mantiene presión constante sobre campamentos madereros y mineros.",
          },
        },
      ],
    },
    countersCiv2VsCiv1: {
      title: {
        en: `${c2.name}'s Key Counter Options vs ${c1.name}`,
        es: `Opciones Clave de Contraataque de ${c2.name} vs ${c1.name}`,
      },
      units: [
        {
          name: c2.uniqueUnits[0] || "Main Unit",
          target: c1.name + " Main Army",
          why: {
            en: `Trades efficiently against ${c1.name}'s power units with proper upgrades.`,
            es: `Intercambia daño de forma eficiente contra las unidades clave de ${c1.name}.`,
          },
        },
        {
          name: c2.archetype === "archers" ? "Elite Skirmishers + Pikes" : "Monks + Camels",
          target: "Counter Defense",
          why: {
            en: "Stops mass army momentum without draining primary gold reserves.",
            es: "Frena la masa rival sin agotar las reservas principales de oro.",
          },
        },
      ],
    },
    strategicGamePlanCiv1: {
      opening: {
        en: "Open with a standard 19-20 pop build order to contest map control and delay their game plan.",
        es: "Abre con una build order de 19-20 de población para disputar el mapa y retrasar su plan.",
      },
      midGame: {
        en: "Hit Castle Age promptly, add production buildings, and threaten secondary resource nodes.",
        es: "Pasa a Castillos rápido, añade edificios de producción y presiona los recursos secundarios del rival.",
      },
      winCondition: {
        en: "Close the match with forward siege and upgraded unique units before they establish full eco stability.",
        es: "Cierra la partida con asedio ofensivo y unidades únicas mejoradas antes de que consoliden su economía.",
      },
    },
    strategicGamePlanCiv2: {
      opening: {
        en: "Scout early, wall efficiently, and prepare appropriate counter units for their expected opening.",
        es: "Explora temprano, amuralla de forma eficiente y prepara el contraataque adecuado para su apertura.",
      },
      midGame: {
        en: "Maintain continuous villager production, contest relics, and build a balanced mixed army.",
        es: "Mantén la producción constante de aldeanos, disputa las reliquias y construye un ejército mixto.",
      },
      winCondition: {
        en: "Leverage late-game technological superiority and map control to choke their gold access.",
        es: "Aprovecha la superioridad tecnológica y el control del mapa en Imperial para asfixiar su acceso al oro.",
      },
    },
    mapContext: {
      arabia: {
        en: "On Arabia, early mobility, walling speed, and forward pressure dominate the matchup.",
        es: "En Arabia, la movilidad temprana, la rapidez al amurallar y la agresión dictan el ritmo.",
      },
      arena: {
        en: "On Arena, Fast Castle timing, Castle drop positioning, and Monk relic control are key.",
        es: "En Arena, el tiempo de Fast Castle, la posición de los Castillos y el control de reliquias son clave.",
      },
      waterNomad: {
        en: "On water/hybrid maps, early fishing eco and harbor control determine economic tempo.",
        es: "En mapas de agua e híbridos, la economía pesquera y el control naval definen el ritmo económico.",
      },
    },
    faqs: [
      {
        question: {
          en: `Who has the advantage in ${c1.name} vs ${c2.name}?`,
          es: `¿Quién tiene ventaja en el enfrentamiento ${c1.name} vs ${c2.name}?`,
        },
        answer: {
          en: `${c1.name} generally has the upper hand when setting the pace in the early-to-mid game, whereas ${c2.name} can turn the tides with proper counter transitions in Castle and Imperial Age.`,
          es: `${c1.name} suele tener ventaja cuando impone el ritmo en el juego temprano y medio, mientras que ${c2.name} puede remontar con las transiciones de contragolpe adecuadas en Castillos e Imperial.`,
        },
      },
      {
        question: {
          en: `What is the best build order for ${c1.name} against ${c2.name}?`,
          es: `¿Cuál es la mejor build order de ${c1.name} contra ${c2.name}?`,
        },
        answer: {
          en: `A 19-pop Scout rush or 21-pop Archer opening allows ${c1.name} to scout ${c2.name}'s base and apply pressure before their defensive infrastructure is completed.`,
          es: `Un rush de scouts a 19 pop o una apertura de arqueros a 21 pop le permite a ${c1.name} explorar la base de ${c2.name} y castigar sus recursos antes de que termine de amurallar.`,
        },
      },
    ],
  };
}
