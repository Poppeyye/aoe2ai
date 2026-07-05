export type BuildOrderDifficulty = "beginner" | "intermediate" | "advanced";

export interface BuildOrder {
  id: string;
  name: string;
  nameEs: string;
  difficulty: BuildOrderDifficulty;
  maps: string[];
  civs: string[];
  steps: { pop: string; task: string; taskEs: string }[];
  tips: string[];
  tipsEs: string[];
}

export const BUILD_ORDERS: BuildOrder[] = [
  {
    id: "22-pop-scouts",
    name: "22-Pop Scouts",
    nameEs: "Scouts a 22 de Población",
    difficulty: "beginner",
    maps: ["Arabia"],
    civs: ["Franks", "Mongols", "Huns", "Lithuanians"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-15", task: "4 villagers to berries (build mill)", taskEs: "4 aldeanos a bayas (construir molino)" },
      { pop: "16", task: "Lure 2nd boar", taskEs: "Atraer 2do jabalí" },
      { pop: "17-19", task: "3 villagers build farms under TC", taskEs: "3 aldeanos construyen granjas bajo el TC" },
      { pop: "20-21", task: "2 villagers to wood (2nd lumber camp or join 1st)", taskEs: "2 aldeanos a madera (2do campamento o unirse al 1ro)" },
      { pop: "22", task: "Research Loom → Click Feudal Age", taskEs: "Investigar Telares → Clic en Edad Feudal" },
      { pop: "F", task: "While advancing: build stable with 2 wood villagers", taskEs: "Mientras avanzas: construir establo con 2 aldeanos de madera" },
      { pop: "F", task: "Produce scouts non-stop, add farms as wood allows", taskEs: "Producir exploradores sin parar, añadir granjas según la madera" },
    ],
    tips: [
      "Force-drop food from boar before it dies so you don't waste decay",
      "Push deer with your scout toward TC for extra food",
      "Keep scout production constant — idle stable = lost pressure",
      "Prioritize farms over berries once you click Feudal",
    ],
    tipsEs: [
      "Fuerza la descarga de comida del jabalí antes de que muera para no perder decay",
      "Empuja ciervos con el explorador hacia el TC para comida extra",
      "Mantén producción constante de exploradores — establo inactivo = presión perdida",
      "Prioriza granjas sobre bayas una vez hagas clic en Feudal",
    ],
  },
  {
    id: "22-pop-archers",
    name: "22-Pop Archers",
    nameEs: "Arqueros a 22 de Población",
    difficulty: "beginner",
    maps: ["Arabia"],
    civs: ["Britons", "Mayans", "Ethiopians", "Vietnamese"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-15", task: "4 villagers to berries (build mill)", taskEs: "4 aldeanos a bayas (construir molino)" },
      { pop: "16", task: "Lure 2nd boar", taskEs: "Atraer 2do jabalí" },
      { pop: "17-18", task: "2 villagers to gold (build mining camp)", taskEs: "2 aldeanos a oro (construir campamento minero)" },
      { pop: "19", task: "1 villager builds a farm under TC", taskEs: "1 aldeano construye granja bajo el TC" },
      { pop: "20-21", task: "2 villagers to wood", taskEs: "2 aldeanos a madera" },
      { pop: "22", task: "Research Loom → Click Feudal Age", taskEs: "Investigar Telares → Clic en Edad Feudal" },
      { pop: "F", task: "While advancing: build 2 archery ranges with wood villagers", taskEs: "Mientras avanzas: construir 2 galerías de tiro con aldeanos de madera" },
      { pop: "F", task: "Produce archers non-stop, add villagers to gold", taskEs: "Producir arqueros sin parar, añadir aldeanos al oro" },
    ],
    tips: [
      "You need at least 7 on gold to sustain 2-range archer production",
      "Research Fletching ASAP for +1 range and attack",
      "Micro archers in a line formation — focus fire one unit at a time",
      "Wall your base before sending archers forward",
    ],
    tipsEs: [
      "Necesitas al menos 7 en oro para sostener producción de arqueros en 2 galerías",
      "Investiga Punta de flecha lo antes posible para +1 rango y ataque",
      "Micro los arqueros en línea — enfoca fuego de a una unidad",
      "Amuralla tu base antes de enviar arqueros al frente",
    ],
  },
  {
    id: "fast-castle",
    name: "Fast Castle",
    nameEs: "Castillos Rápido",
    difficulty: "beginner",
    maps: ["Arena", "Black Forest", "Hideout"],
    civs: ["Franks", "Teutons", "Persians", "Spanish"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-15", task: "4 villagers to berries (build mill)", taskEs: "4 aldeanos a bayas (construir molino)" },
      { pop: "16", task: "Lure 2nd boar", taskEs: "Atraer 2do jabalí" },
      { pop: "17-19", task: "3 villagers to gold (build mining camp)", taskEs: "3 aldeanos a oro (construir campamento minero)" },
      { pop: "20-21", task: "2 villagers to wood (2nd lumber camp)", taskEs: "2 aldeanos a madera (2do campamento maderero)" },
      { pop: "22-24", task: "Move 2 boar/sheep vills to farms, research Loom", taskEs: "Mover 2 aldeanos de jabalí/ovejas a granjas, investigar Telares" },
      { pop: "24", task: "Click Feudal Age", taskEs: "Clic en Edad Feudal" },
      { pop: "F", task: "While advancing: build barracks + market/blacksmith", taskEs: "Mientras avanzas: construir cuartel + mercado/herrería" },
      { pop: "F", task: "Immediately click Castle Age upon reaching Feudal", taskEs: "Inmediatamente clic en Edad de los Castillos al llegar a Feudal" },
      { pop: "C", task: "Build 2nd TC, boom economy, produce knights or UU", taskEs: "Construir 2do TC, expandir economía, producir caballeros o UU" },
    ],
    tips: [
      "On Arena you can wall with buildings — no need to waste wood on palisades",
      "Aim for Castle Age around 16:00-17:00 game time",
      "Place your 2nd TC on a woodline or gold for maximum efficiency",
      "If you scout early aggression, add a defensive tower before clicking Castle",
    ],
    tipsEs: [
      "En Arena puedes amurallar con edificios — no gastes madera en empalizadas",
      "Apunta a llegar a Castillos alrededor de 16:00-17:00 de tiempo de juego",
      "Coloca tu 2do TC en un bosque u oro para máxima eficiencia",
      "Si descubres agresión temprana, añade una torre defensiva antes de hacer clic en Castillos",
    ],
  },
  {
    id: "maa-archers",
    name: "Men-at-Arms into Archers",
    nameEs: "Hombres de Armas a Arqueros",
    difficulty: "intermediate",
    maps: ["Arabia"],
    civs: ["Japanese", "Vikings", "Celts", "Aztecs"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-14", task: "3 villagers to berries (build mill)", taskEs: "3 aldeanos a bayas (construir molino)" },
      { pop: "15", task: "Research Loom, lure 2nd boar", taskEs: "Investigar Telares, atraer 2do jabalí" },
      { pop: "15-16", task: "Build barracks with 1 villager (send to wood after)", taskEs: "Construir cuartel con 1 aldeano (enviar a madera después)" },
      { pop: "17-19", task: "3 villagers — 1 to berries, 2 to gold (build mining camp)", taskEs: "3 aldeanos — 1 a bayas, 2 a oro (construir campamento minero)" },
      { pop: "20", task: "Queue 3 militia from barracks", taskEs: "Encolar 3 milicianos del cuartel" },
      { pop: "21", task: "1 more villager to gold, click Feudal Age", taskEs: "1 aldeano más a oro, clic en Edad Feudal" },
      { pop: "F", task: "Research Men-at-Arms upgrade, send militia forward", taskEs: "Investigar mejora de Hombres de Armas, enviar milicianos al frente" },
      { pop: "F", task: "Build 2 archery ranges while MAA harass", taskEs: "Construir 2 galerías de tiro mientras los HdA acosan" },
      { pop: "F", task: "Transition: archers non-stop, add farms + gold", taskEs: "Transición: arqueros sin parar, añadir granjas + oro" },
    ],
    tips: [
      "Time your militia to arrive just as Men-at-Arms finishes researching",
      "Target enemy woodlines and mining camps with your MAA",
      "Don't over-commit MAA — their main job is to buy time for your ranges",
      "Research Fletching before Armor for archers — offense wins in Feudal",
    ],
    tipsEs: [
      "Sincroniza tus milicianos para que lleguen justo cuando termine la mejora de HdA",
      "Ataca líneas de madera y campamentos mineros enemigos con tus HdA",
      "No te excedas con los HdA — su objetivo es ganar tiempo para tus galerías",
      "Investiga Punta de flecha antes que Armadura — la ofensiva gana en Feudal",
    ],
  },
  {
    id: "drush-fc",
    name: "Drush Fast Castle",
    nameEs: "Drush a Castillos Rápido",
    difficulty: "intermediate",
    maps: ["Arabia", "Runestones"],
    civs: ["Aztecs", "Mayans", "Malay", "Chinese"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-8", task: "2 villagers build barracks then go to wood", taskEs: "2 aldeanos construyen cuartel y luego van a madera" },
      { pop: "9-10", task: "2 villagers to wood (build lumber camp)", taskEs: "2 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "—", task: "Queue 3 militia as soon as barracks finishes", taskEs: "Encolar 3 milicianos cuando termine el cuartel" },
      { pop: "12-15", task: "4 villagers to berries (build mill)", taskEs: "4 aldeanos a bayas (construir molino)" },
      { pop: "16", task: "Lure 2nd boar, send 3 militia to harass enemy", taskEs: "Atraer 2do jabalí, enviar 3 milicianos a acosar al enemigo" },
      { pop: "17-19", task: "3 villagers to gold (build mining camp)", taskEs: "3 aldeanos a oro (construir campamento minero)" },
      { pop: "20-22", task: "Move food villagers to farms, add 2 to wood", taskEs: "Mover aldeanos de comida a granjas, añadir 2 a madera" },
      { pop: "23", task: "Research Loom → Click Feudal Age", taskEs: "Investigar Telares → Clic en Edad Feudal" },
      { pop: "F", task: "Build market + blacksmith, click Castle Age immediately", taskEs: "Construir mercado + herrería, clic en Castillos inmediatamente" },
      { pop: "C", task: "Boom with 2-3 TCs or produce knights / unique unit", taskEs: "Expandir con 2-3 TCs o producir caballeros / unidad única" },
    ],
    tips: [
      "Militia should target enemy walls, berries, or woodlines — force idle time",
      "Don't chase with militia — just keep them near enemy resources",
      "This BO is about disruption, not kills. A few seconds of idle TC is worth it",
      "Transition to knights, eagles, or unique unit depending on your civ",
    ],
    tipsEs: [
      "Los milicianos deben atacar murallas, bayas o bosques del enemigo — fuerza tiempo muerto",
      "No persigas con milicianos — solo mantenlos cerca de los recursos enemigos",
      "Este BO busca disrupción, no matar. Unos segundos de TC inactivo vale la pena",
      "Transiciona a caballeros, águilas o unidad única según tu civ",
    ],
  },
  {
    id: "trush",
    name: "Tower Rush (Trush)",
    nameEs: "Rush de Torres (Trush)",
    difficulty: "advanced",
    maps: ["Arabia"],
    civs: ["Koreans", "Incas", "Teutons", "Spanish"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-16", task: "5 villagers to stone (build mining camp)", taskEs: "5 aldeanos a piedra (construir campamento minero)" },
      { pop: "17", task: "Lure 2nd boar", taskEs: "Atraer 2do jabalí" },
      { pop: "18-19", task: "2 villagers to berries or farms", taskEs: "2 aldeanos a bayas o granjas" },
      { pop: "20", task: "Research Loom → Click Feudal Age", taskEs: "Investigar Telares → Clic en Edad Feudal" },
      { pop: "F", task: "Send 3-4 villagers forward with stone (gather ~270 stone first)", taskEs: "Enviar 3-4 aldeanos al frente con piedra (recolectar ~270 piedra primero)" },
      { pop: "F", task: "Build tower on enemy woodline or gold", taskEs: "Construir torre en bosque u oro enemigo" },
      { pop: "F", task: "Build 2nd tower to cover the 1st, deny resources", taskEs: "Construir 2da torre para cubrir la 1ra, negar recursos" },
      { pop: "F", task: "Continue pressure: 3rd tower or transition to Castle Age", taskEs: "Continuar presión: 3ra torre o transicionar a Edad de los Castillos" },
    ],
    tips: [
      "Scout the enemy base early — pick the most exposed resource to tower",
      "Build your first tower just outside their TC range (6 tiles)",
      "Keep your forward villagers alive — garrison in tower if attacked",
      "Don't forget your home economy! Keep making villagers at your TC",
    ],
    tipsEs: [
      "Explora la base enemiga temprano — elige el recurso más expuesto para poner torre",
      "Construye la primera torre justo fuera del rango del TC enemigo (6 casillas)",
      "Mantén vivos a tus aldeanos avanzados — refugia en la torre si los atacan",
      "¡No olvides tu economía en casa! Sigue creando aldeanos en tu TC",
    ],
  },
];

export function getBuildOrder(id: string): BuildOrder | undefined {
  return BUILD_ORDERS.find((bo) => bo.id === id);
}
