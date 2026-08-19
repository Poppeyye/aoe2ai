export type CreatorLanguage = "es" | "en" | "all";
export type CreatorCategory = "guides" | "pro_play" | "math_mechanics" | "casting_entertainment" | "build_orders";

export interface Creator {
  id: string;
  name: string;
  country: string;
  language: "es" | "en";
  avatar: string;
  youtubeUrl: string;
  twitchUrl?: string;
  subscriberCount: string;
  description: { en: string; es: string };
  specialty: { en: string; es: string };
  category: CreatorCategory;
  featuredVideos: Array<{
    id: string;
    title: { en: string; es: string };
    youtubeUrl: string;
    thumbnailUrl: string;
    duration: string;
    category: CreatorCategory;
  }>;
}

export interface Tournament {
  id: string;
  name: string;
  organizer: string;
  dates: string;
  prizePool: string;
  tier: "S-Tier" | "A-Tier" | "B-Tier" | "Community";
  status: "live" | "upcoming" | "completed";
  format: { en: string; es: string };
  winner?: string;
  runnerUp?: string;
  liquipediaUrl: string;
  watchUrl?: string;
  description: { en: string; es: string };
}

export interface PatchMetaInsight {
  patchVersion: string;
  releaseDate: string;
  title: { en: string; es: string };
  summary: { en: string; es: string };
  buffedCivs: Array<{ civ: string; change: { en: string; es: string } }>;
  nerfedCivs: Array<{ civ: string; change: { en: string; es: string } }>;
  metaShifts: Array<{ title: { en: string; es: string }; desc: { en: string; es: string } }>;
}

export const COMMUNITY_CREATORS: Creator[] = [
  // Spanish Creators
  {
    id: "nachoaoe",
    name: "NachoAoE",
    country: "AR",
    language: "es",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k6y4H1cQ_Hj1C_n0h_N7b5L2U4=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@NachoAoE",
    twitchUrl: "https://www.twitch.tv/nacho_aoe",
    subscriberCount: "135K+",
    description: {
      en: "The biggest Spanish-speaking AoE2 caster. Renowned for passionate tournament casting, showmatches, and Latin American community coverage.",
      es: "El caster de AoE2 en español más popular del mundo. Famoso por sus narraciones de torneos, showmatches y torneos de la comunidad.",
    },
    specialty: {
      en: "Tournament Casting & High-Stakes Showmatches",
      es: "Casting de Torneos & Showmatches Competitivos",
    },
    category: "casting_entertainment",
    featuredVideos: [
      {
        id: "nacho_1",
        title: {
          en: "Epic 2v2 Final: The Best Match in AoE2 History",
          es: "Final Épica 2v2: La Mejor Partida de la Historia de AoE2",
        },
        youtubeUrl: "https://www.youtube.com/@NachoAoE/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
        duration: "45:20",
        category: "casting_entertainment",
      },
      {
        id: "nacho_2",
        title: {
          en: "How Pros Micro Under Extreme Pressure",
          es: "Cómo Microgestionan los Pros Bajo Presión Extrema",
        },
        youtubeUrl: "https://www.youtube.com/@NachoAoE/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
        duration: "28:15",
        category: "pro_play",
      },
    ],
  },
  {
    id: "mariovalle",
    name: "Mario Valle",
    country: "ES",
    language: "es",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_mario_valle=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@MarioValleAoE",
    twitchUrl: "https://www.twitch.tv/mariovalle",
    subscriberCount: "45K+",
    description: {
      en: "High-ELO Spanish competitor and content creator. Specializes in clear build orders, ladder improvement guides, and civilization tier lists.",
      es: "Jugador de alto ELO y creador de contenido de España. Especialista en tutoriales paso a paso, build orders y guías para subir de rango.",
    },
    specialty: {
      en: "Step-by-Step Build Orders & Ranked Guides",
      es: "Build Orders Paso a Paso & Guías Ranked",
    },
    category: "build_orders",
    featuredVideos: [
      {
        id: "mario_1",
        title: {
          en: "Guide: Reach 1400 ELO with this Clean Scout Rush",
          es: "Guía: Sube a 1400 ELO con este Scout Rush Perfecto",
        },
        youtubeUrl: "https://www.youtube.com/@MarioValleAoE/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
        duration: "22:10",
        category: "build_orders",
      },
      {
        id: "mario_2",
        title: {
          en: "Top 5 Mistakes Players Make in Castle Age",
          es: "Los 5 Errores Más Graves en Edad de los Castillos",
        },
        youtubeUrl: "https://www.youtube.com/@MarioValleAoE/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
        duration: "18:40",
        category: "guides",
      },
    ],
  },
  {
    id: "tatoh",
    name: "TaToH",
    country: "ES",
    language: "es",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_tatoh_es=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@TaToH_AoE",
    twitchUrl: "https://www.twitch.tv/tatoh_aoe",
    subscriberCount: "50K+",
    description: {
      en: "Top world pro player (GamerLegion). Master of unconventional strategies, incredible map adaptability, and world championship tournament runs.",
      es: "Top pro mundial de GamerLegion. Maestro de las estrategias no convencionales, enorme inteligencia táctica y campeón de torneos mundiales.",
    },
    specialty: {
      en: "Pro Strategy & Innovative Meta Exploits",
      es: "Estrategia Pro & Adaptabilidad Táctica",
    },
    category: "pro_play",
    featuredVideos: [
      {
        id: "tatoh_1",
        title: {
          en: "TaToH Strategy Masterclass: Winning with Unique Strats",
          es: "Masterclass de TaToH: Ganando con Estrategias Creativas",
        },
        youtubeUrl: "https://www.youtube.com/@TaToH_AoE/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
        duration: "32:00",
        category: "pro_play",
      },
    ],
  },
  {
    id: "membtv",
    name: "MembTV",
    country: "ES",
    language: "es",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_membtv=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@MembTV",
    twitchUrl: "https://www.twitch.tv/membtv",
    subscriberCount: "110K+",
    description: {
      en: "The hype king of AoE2! Organizer of King of the Desert and Warlords. Maximum energy casting, passionate analysis, and top pro showdowns.",
      es: "¡El rey del hype en AoE2! Creador y organizador de King of the Desert y Warlords. Máxima energía y análisis de la escena competitiva mundial.",
    },
    specialty: {
      en: "King of the Desert & S-Tier Tournament Host",
      es: "Organizador de Torneos Mayores & Casting",
    },
    category: "casting_entertainment",
    featuredVideos: [
      {
        id: "memb_1",
        title: {
          en: "Warlords: The Most Insane Desert Battle Ever Seen",
          es: "Warlords: La Batalla Más Salvaje en el Desierto",
        },
        youtubeUrl: "https://www.youtube.com/@MembTV/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
        duration: "52:14",
        category: "casting_entertainment",
      },
    ],
  },

  // English Creators
  {
    id: "spiritofthelaw",
    name: "Spirit of the Law",
    country: "CA",
    language: "en",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_sotl=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@SpiritoftheLaw",
    subscriberCount: "480K+",
    description: {
      en: "The definitive mathematical authority for Age of Empires II. In-depth statistical analysis, economy math, civilization reviews, and hidden mechanics.",
      es: "La máxima autoridad matemática de AoE2. Análisis estadístico profundo de civilizaciones, fórmulas económicas y mecánicas ocultas.",
    },
    specialty: {
      en: "AoE2 Mathematics, Economy Formulas & Civ Deep Dives",
      es: "Matemáticas de AoE2, Fórmulas Económicas & Análisis de Civs",
    },
    category: "math_mechanics",
    featuredVideos: [
      {
        id: "sotl_1",
        title: {
          en: "The Ultimate Guide to Farm Placement and Efficiency",
          es: "Guía Definitiva de Eficiencia y Colocación de Granjas",
        },
        youtubeUrl: "https://www.youtube.com/@SpiritoftheLaw/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
        duration: "16:45",
        category: "math_mechanics",
      },
      {
        id: "sotl_2",
        title: {
          en: "Which Civilization Has the Strongest Late Game?",
          es: "¿Qué Civilización Tiene el Mejor Imperial Tardío?",
        },
        youtubeUrl: "https://www.youtube.com/@SpiritoftheLaw/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
        duration: "19:20",
        category: "guides",
      },
    ],
  },
  {
    id: "hera",
    name: "Hera",
    country: "CA",
    language: "en",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_hera_aoe=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@HeraAgeofEmpires2",
    twitchUrl: "https://www.twitch.tv/Hera",
    subscriberCount: "175K+",
    description: {
      en: "#1 Ranked Player and Reigning World Champion. Top tier educational commentary, Guide to 2K+ ELO series, and masterclass micro tutorials.",
      es: "Jugador #1 del ranking mundial y vigente campeón del mundo. Guías educativas de élite, serie Road to 2k+ y tutoriales de microgestión.",
    },
    specialty: {
      en: "World Championship Gameplay & 2K+ ELO Roadmaps",
      es: "Nivel Pro de Campeón del Mundo & Guías de Subida a 2K",
    },
    category: "pro_play",
    featuredVideos: [
      {
        id: "hera_1",
        title: {
          en: "How to Actually Improve at AoE2: The 3 Core Pillars",
          es: "Cómo Mejorar de Verdad en AoE2: Los 3 Pilares Fundamentales",
        },
        youtubeUrl: "https://www.youtube.com/@HeraAgeofEmpires2/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80",
        duration: "24:18",
        category: "guides",
      },
    ],
  },
  {
    id: "theviper",
    name: "TheViper",
    country: "NO",
    language: "en",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_theviper=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@TheViperAOE",
    twitchUrl: "https://www.twitch.tv/TheViper",
    subscriberCount: "340K+",
    description: {
      en: "The greatest of all time (The GOAT). Legendary multi-time world champion known for insane quickwalls, effortless macro, and humorous masterplays.",
      es: "El mejor jugador de todos los tiempos (The GOAT). Legendario multicampeón del mundo conocido por sus quickwalls y su control del juego.",
    },
    specialty: {
      en: "Legendary Quickwalls, Comebacks & Tournament Highlights",
      es: "Quickwalls Legendarios, Remontadas & Highlights de Torneos",
    },
    category: "pro_play",
    featuredVideos: [
      {
        id: "viper_1",
        title: {
          en: "1v1 Ranked Against 2600 ELO: Masterclass Positioning",
          es: "1v1 Ranked Contra 2600 ELO: Posicionamiento Magistral",
        },
        youtubeUrl: "https://www.youtube.com/@TheViperAOE/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
        duration: "31:40",
        category: "pro_play",
      },
    ],
  },
  {
    id: "t90official",
    name: "T90Official",
    country: "US",
    language: "en",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_t90official=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@T90Official",
    twitchUrl: "https://www.twitch.tv/T90Official",
    subscriberCount: "380K+",
    description: {
      en: "The voice of Age of Empires II. Host of Low ELO Legends, Hidden Cup, and Titan's League. Unmatched community storytelling and casting.",
      es: "La voz de Age of Empires II. Creador de Low ELO Legends, Hidden Cup y Titans League. El mayor divulgador del juego a nivel global.",
    },
    specialty: {
      en: "Hidden Cup, Low ELO Legends & Community Storytelling",
      es: "Hidden Cup, Leyendas de Bajo ELO & Narrativa Comunitaria",
    },
    category: "casting_entertainment",
    featuredVideos: [
      {
        id: "t90_1",
        title: {
          en: "Low ELO Legends: The Wildest 3-Hour Forest Standoff",
          es: "Low ELO Legends: El Duelo Más Salvaje de 3 Horas en el Bosque",
        },
        youtubeUrl: "https://www.youtube.com/@T90Official/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
        duration: "42:10",
        category: "casting_entertainment",
      },
    ],
  },
  {
    id: "survivalist",
    name: "Survivalist",
    country: "CA",
    language: "en",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_survivalist=s176-c-k-c0x00ffffff-no-rj",
    youtubeUrl: "https://www.youtube.com/@SurvivalistAoE",
    subscriberCount: "42K+",
    description: {
      en: "The Art of AoE2 author. Analytical tactical coach providing the most practical decision-making frameworks for intermediate players.",
      es: "Autor de 'The Art of AoE2'. Entrenador táctico que enseña la toma de decisiones lógica para jugadores intermedios y avanzados.",
    },
    specialty: {
      en: "Decision-Making Frameworks & Defensive Micro",
      es: "Toma de Decisiones & Microgestión Defensiva",
    },
    category: "guides",
    featuredVideos: [
      {
        id: "surv_1",
        title: {
          en: "How to Stop Panicking When Getting Rushed",
          es: "Cómo Mantener la Calma y Defenderte de Cualquier Rush",
        },
        youtubeUrl: "https://www.youtube.com/@SurvivalistAoE/videos",
        thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
        duration: "17:55",
        category: "guides",
      },
    ],
  },
];

export const MAJOR_TOURNAMENTS: Tournament[] = [
  {
    id: "warlords_4",
    name: "Warlords IV",
    organizer: "MembTV",
    dates: "Nov 2026",
    prizePool: "$50,000",
    tier: "S-Tier",
    status: "upcoming",
    format: {
      en: "1v1 Draft Open and Closed Maps, Single Elimination Playoffs",
      es: "1v1 Selección de mapas abiertos y cerrados, Eliminación directa",
    },
    liquipediaUrl: "https://liquipedia.net/ageofempires/Warlords",
    watchUrl: "https://www.twitch.tv/membtv",
    description: {
      en: "The premier multi-environment S-Tier tournament featuring the top 16 players in the world fighting across aggressive land and hybrid battlegrounds.",
      es: "El torneo mayor de MembTV que reúne a los 16 mejores jugadores del mundo en mapas de máxima agresividad y combate híbrido.",
    },
  },
  {
    id: "king_of_the_desert_5",
    name: "King of the Desert V",
    organizer: "MembTV",
    dates: "Recent (May 2026)",
    prizePool: "$65,000",
    tier: "S-Tier",
    status: "completed",
    winner: "Hera",
    runnerUp: "TheViper",
    format: {
      en: "1v1 Arabia Only Tournament, High Aggression",
      es: "1v1 Exclusivo en Arabia, Máxima Agresividad",
    },
    liquipediaUrl: "https://liquipedia.net/ageofempires/King_of_the_Desert",
    description: {
      en: "The undisputed championship of open-map aggression. Played exclusively on Arabia to crown the supreme master of 1v1 tempo.",
      es: "El campeonato indiscutible de combate en mapa abierto. Disputado únicamente en Arabia para coronar al rey del tempo 1v1.",
    },
  },
  {
    id: "hidden_cup_5",
    name: "Hidden Cup V",
    organizer: "T90Official",
    dates: "Completed",
    prizePool: "$80,000",
    tier: "S-Tier",
    status: "completed",
    winner: "Hera",
    runnerUp: "Tatoh",
    format: {
      en: "1v1 Blind Tournament (Anonymous Player Aliases)",
      es: "1v1 Torneo a Ciegas (Identidades Anónimas)",
    },
    liquipediaUrl: "https://liquipedia.net/ageofempires/Hidden_Cup",
    description: {
      en: "The most legendary community event where all 16 pro players compete under secret historical aliases until the champion is unmasked.",
      es: "El evento más legendario donde los 16 mejores jugadores compiten bajo nombres históricos anónimos hasta que el campeón es desenmascarado.",
    },
  },
  {
    id: "titans_league_4",
    name: "T90 Titans League Season 4",
    organizer: "T90Official",
    dates: "Upcoming",
    prizePool: "$40,000",
    tier: "A-Tier",
    status: "upcoming",
    format: {
      en: "League Divisions (Platinum, Gold, Silver) + Promotion/Relegation",
      es: "Divisiones de Liga con Ascensos y Descensos",
    },
    liquipediaUrl: "https://liquipedia.net/ageofempires/T90_Titans_League",
    description: {
      en: "A European soccer style league division system with weekly broadcast matchdays across three tiers of global competition.",
      es: "Sistema de ligas por divisiones con jornadas semanales y ascensos/descensos entre los mejores jugadores del planeta.",
    },
  },
];

export const CURRENT_PATCH_META: PatchMetaInsight = {
  patchVersion: "Update 115000+ (Current DE Meta)",
  releaseDate: "July / August 2026",
  title: {
    en: "Current Ranked 1v1 Meta & Civilization Balance",
    es: "Meta Actual de Ranked 1v1 & Balance de Civilizaciones",
  },
  summary: {
    en: "The current meta heavily rewards aggressive 19-20 pop Feudal openings on Arabia with Scouts or double Archery Range. On closed maps, Fast Castle with Siege/Monk pushes remains dominant.",
    es: "El meta actual premia las aperturas ultrarrápidas a 19-20 de población en Arabia con Scouts o 2 Galerías de Tiro. En mapas cerrados, el Fast Castle con Monjes y Asedio sigue marcando la pauta.",
  },
  buffedCivs: [
    {
      civ: "Persians",
      change: {
        en: "Caravanserai and Savar heavy cavalry transitions offer immense Castle & Imperial Age flexibility.",
        es: "La incorporación del Savar y caravasares potencian su transición de caballería pesada en Castillos e Imperial.",
      },
    },
    {
      civ: "Armenians",
      change: {
        en: "Early infantry upgrades accessible in Dark Age enable lethal surprise Drush openings.",
        es: "Mejoras de infantería accesibles una edad antes permiten aperturas de Drush devastadoras.",
      },
    },
    {
      civ: "Georgians",
      change: {
        en: "Monaspa unit massing and hill regeneration bonuses dominate hilly Arabia and Four Lakes.",
        es: "La masa de Monaspas y regeneración en colinas los hace fortísimos en mapas con relieve.",
      },
    },
  ],
  nerfedCivs: [
    {
      civ: "Romans",
      change: {
        en: "Legionary bonus armor and scorpion cost adjustments brought their early Imperial spike to parity.",
        es: "Ajustes en la armadura del legionario y coste de escorpiones equilibraron su spike en Imperial temprano.",
      },
    },
    {
      civ: "Gurjaras",
      change: {
        en: "Shrivamsha Rider dodge shield regeneration tuned down slightly to allow counterplay from crossbows.",
        es: "El escudo de esquive de proyectiles del Shrivamsha se regenera más lento contra masas de ballesteros.",
      },
    },
  ],
  metaShifts: [
    {
      title: {
        en: "Arabia: 19-Pop Feudal Scout Rush is King",
        es: "Arabia: El Scout Rush a 19 Pop es el Rey",
      },
      desc: {
        en: "With walling nerfed and maps more open, taking early map control before minute 10:00 forces your opponent to idle villagers on palisades.",
        es: "Con mapas abiertos y murallas más lentas de construir, disputar el mapa antes del minuto 10 obliga al rival a perder tiempo amurallando.",
      },
    },
    {
      title: {
        en: "Arena: Monk & Relic Dominance",
        es: "Arena: Dominio de Monjes y Control de Reliquias",
      },
      desc: {
        en: "Collecting 3+ relics and dropping a forward Castle with 2 Mangonels remains the highest winrate game plan in 1200+ ELO.",
        es: "Recoger 3 o más reliquias y plantar un Castillo ofensivo con 2 Mangonelas tiene el mayor winrate en 1200+ ELO.",
      },
    },
  ],
};
