import {
  fetchCompanionMatches,
  getCompanionProfile,
  searchPlayerCompanion,
  type CompanionMatch,
  type CompanionMatchPlayer,
} from "@/lib/api/relic";

export type ScoutLeaderboardType = "rm_1v1" | "rm_team" | "ew_1v1" | "ew_team";

export interface LeaderboardStats {
  rating: number;
  rank: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  highestRating: number;
  drops: number;
  games: number;
  rankCountry: number;
  lastMatchTime: string | null;
}

export interface ScoutProfile {
  name: string;
  profileId: number;
  country: string | null;
  rating: number;
  rank: number;
  wins: number;
  losses: number;
  streak: number;
  highestRating: number;
  clan: string | null;
  rm1v1: LeaderboardStats | null;
  rmTeam: LeaderboardStats | null;
  ew1v1: LeaderboardStats | null;
  ewTeam: LeaderboardStats | null;
}

export interface CivStat {
  civName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface MapStat {
  map: string;
  games: number;
  wins: number;
  losses: number;
}

export interface RecentMatch {
  map: string;
  won: boolean;
  civ: string;
  ratingChange: number;
  date: number;
}

export interface CivRecommendation {
  civ: string;
  reason: string;
}

export interface HeadToHead {
  totalGames: number;
  wins: number;
  losses: number;
  lastEncounter: number | null;
  recent: Array<{
    map: string;
    won: boolean;
    myCiv: string;
    opponentCiv: string;
    date: number;
    ratingChange: number;
  }>;
}

export type PlaystyleTag =
  | "cavalry"
  | "archers"
  | "infantry"
  | "camels"
  | "siege"
  | "gunpowder"
  | "navy"
  | "flex"
  | "boom";

export interface TacticalBriefing {
  /** False when the opponent's match history could not be read, so the plan is generic. */
  hasHistory: boolean;
  playerProfile: {
    headline: { en: string; es: string };
    detail: { en: string; es: string };
    tag: string | null;
  };
  matchupAdvantage: {
    headline: { en: string; es: string };
    detail: { en: string; es: string };
  };
  threeStepPlan: {
    step1Opening: {
      title: { en: string; es: string };
      detail: { en: string; es: string };
    };
    step2Warning: {
      title: { en: string; es: string };
      detail: { en: string; es: string };
    };
    step3WinCondition: {
      title: { en: string; es: string };
      detail: { en: string; es: string };
    };
  };
}

export interface ScoutReport {
  profile: ScoutProfile;
  civStats: CivStat[];
  mapStats: MapStat[];
  recentForm: ("W" | "L")[];
  recentMatches: RecentMatch[];
  avgGameDuration: number;
  civRecommendations: CivRecommendation[];
  matchCount: number;
  playstyle: PlaystyleTag | null;
  ratingHistory: number[];
  headToHead: HeadToHead | null;
  tacticalBriefing: TacticalBriefing;
  /** False when the Companion match history request failed (rate limit / outage). */
  historyLoaded: boolean;
}

const CIV_COUNTERS: Record<string, CivRecommendation[]> = {
  Franks: [
    { civ: "Byzantines", reason: "Cheap camels and trash counter knights cost-effectively." },
    { civ: "Berbers", reason: "Cheaper cavalry and camel archers trade well against knight-heavy play." },
    { civ: "Incas", reason: "Kamayuks and eagles punish predictable cavalry transitions." },
  ],
  Britons: [
    { civ: "Celts", reason: "Siege pressure breaks massed archers before they snowball." },
    { civ: "Goths", reason: "Huskarls and infantry floods absorb arrow fire extremely well." },
    { civ: "Turks", reason: "Janissaries and mobile cavalry can close distance quickly." },
  ],
  Mayans: [
    { civ: "Goths", reason: "Infantry floods overwhelm eagle and plume-based armies." },
    { civ: "Lithuanians", reason: "Relic-powered cavalry crushes eagle transitions." },
    { civ: "Persians", reason: "Strong cavalry pressure and elephants can overpower meso armies." },
  ],
  Aztecs: [
    { civ: "Teutons", reason: "Tanky infantry and conversion resistance make monk/eagle pushes harder." },
    { civ: "Slavs", reason: "Boyars and strong infantry lines trade efficiently in prolonged melee." },
    { civ: "Goths", reason: "Cheap infantry spam can outnumber eagle compositions." },
  ],
  Huns: [
    { civ: "Byzantines", reason: "Cheap camels and spears are efficient against cavalry archer setups." },
    { civ: "Berbers", reason: "Camel archers and discount cavalry match mobility well." },
    { civ: "Italians", reason: "Genoese crossbowmen punish cavalry-focused armies." },
  ],
  Mongols: [
    { civ: "Italians", reason: "Genoese crossbowmen are excellent into Mangudai or hussar mixes." },
    { civ: "Vietnamese", reason: "Rattan archers and solid eco help survive ranged pressure." },
    { civ: "Byzantines", reason: "Cheap trash and camels blunt late-game mobility." },
  ],
};

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * The match API returns a few civs in singular form ("Maya", "Inca") while the
 * lobby schema and our own tables use the plural. Without this they never match
 * a playstyle, a counter recommendation, or the civ picked in the live game.
 */
const CIV_NAME_ALIASES: Record<string, string> = {
  Maya: "Mayans",
  Inca: "Incas",
  Indians: "Hindustanis",
};

function canonicalCivName(raw: string): string {
  const name = titleCase(raw.trim());
  return CIV_NAME_ALIASES[name] ?? name;
}

function cleanMapName(raw: string): string {
  const name = raw
    .replace(/^rm_/i, "")
    .replace(/\.rms$/i, "")
    .replace(/_/g, " ")
    .trim();

  if (!name || name.toLowerCase() === "my map" || name.toLowerCase() === "custom") {
    return "Custom";
  }

  return titleCase(name);
}

function findMe(match: CompanionMatch, profileId: number): CompanionMatchPlayer | undefined {
  for (const team of match.teams) {
    const player = team.players.find((p) => p.profileId === profileId);
    if (player) return player;
  }
  return undefined;
}

export function computeCivStats(matches: CompanionMatch[], profileId: number): CivStat[] {
  const stats = new Map<string, { games: number; wins: number; losses: number }>();

  for (const match of matches) {
    const me = findMe(match, profileId);
    if (!me || me.won === null) continue;

    const rawCiv = me.civName || me.civ;
    if (!rawCiv) continue;

    const civName = canonicalCivName(rawCiv);
    const entry = stats.get(civName) ?? { games: 0, wins: 0, losses: 0 };
    entry.games += 1;
    if (me.won) entry.wins += 1;
    else entry.losses += 1;
    stats.set(civName, entry);
  }

  return Array.from(stats.entries())
    .map(([civName, value]) => ({
      civName,
      games: value.games,
      wins: value.wins,
      losses: value.losses,
      winRate: value.games > 0 ? Math.round((value.wins / value.games) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.games - a.games);
}

export function computeMapStats(matches: CompanionMatch[], profileId: number): MapStat[] {
  const stats = new Map<string, { games: number; wins: number; losses: number }>();

  for (const match of matches) {
    const me = findMe(match, profileId);
    if (!me || me.won === null) continue;

    const mapName = match.mapName || cleanMapName(match.map || "unknown");
    const entry = stats.get(mapName) ?? { games: 0, wins: 0, losses: 0 };
    entry.games += 1;
    if (me.won) entry.wins += 1;
    else entry.losses += 1;
    stats.set(mapName, entry);
  }

  return Array.from(stats.entries())
    .map(([map, value]) => ({
      map,
      games: value.games,
      wins: value.wins,
      losses: value.losses,
    }))
    .sort((a, b) => b.games - a.games);
}

export function computeRecentForm(matches: CompanionMatch[], profileId: number, count: number): ("W" | "L")[] {
  const form: ("W" | "L")[] = [];

  for (const match of matches.slice(0, count)) {
    const me = findMe(match, profileId);
    if (!me || me.won === null) continue;
    form.push(me.won ? "W" : "L");
  }

  return form;
}

export function computeRecentMatches(matches: CompanionMatch[], profileId: number, count: number): RecentMatch[] {
  const recent: RecentMatch[] = [];

  for (const match of matches.slice(0, count)) {
    const me = findMe(match, profileId);
    if (!me || me.won === null) continue;

    recent.push({
      map: match.mapName || cleanMapName(match.map || "unknown"),
      won: me.won,
      civ: me.civName || me.civ ? canonicalCivName(me.civName || me.civ) : "—",
      ratingChange: me.ratingDiff ?? 0,
      date: match.finished
        ? Math.floor(new Date(match.finished).getTime() / 1000)
        : Math.floor(new Date(match.started).getTime() / 1000),
    });
  }

  return recent;
}

export function computeAvgGameDuration(matches: CompanionMatch[]): number {
  let total = 0;
  let count = 0;

  for (const match of matches) {
    if (!match.started || !match.finished) continue;
    const start = new Date(match.started).getTime();
    const end = new Date(match.finished).getTime();
    if (end <= start) continue;
    total += (end - start) / 1000;
    count += 1;
  }

  return count > 0 ? Math.round(total / count) : 0;
}

const PLAYSTYLE_COUNTERS: Partial<Record<PlaystyleTag, CivRecommendation[]>> = {
  cavalry: [
    { civ: "Byzantines", reason: "Cheap Camels and free Town Watch blunt cavalry raids all game." },
    { civ: "Britons", reason: "Longbow range keeps knights out of reach behind a spear wall." },
    { civ: "Gurjaras", reason: "Shrivamsha Riders and camels are made for cavalry-heavy play." },
  ],
  archers: [
    { civ: "Vietnamese", reason: "Free Conscription and tanky Rattan Archers win ranged fights." },
    { civ: "Italians", reason: "Genoese Crossbowmen and cheap upgrades punish an archer mass." },
    { civ: "Mongols", reason: "Faster Mangonels wipe grouped archers before they can spread." },
  ],
  infantry: [
    { civ: "Britons", reason: "Longbows shred infantry that has to walk into range." },
    { civ: "Franks", reason: "Cheap Castles and strong Knights run over slow infantry pushes." },
    { civ: "Chinese", reason: "Cost-efficient Chu Ko Nu melt massed melee units." },
  ],
  camels: [
    { civ: "Britons", reason: "Range advantage avoids melee trades with camels entirely." },
    { civ: "Mayans", reason: "Cheap, durable archers out-trade camels at range." },
    { civ: "Celts", reason: "Fast siege plus infantry handles camel armies well." },
  ],
  siege: [
    { civ: "Franks", reason: "Cheap Knights snipe siege before it sets up." },
    { civ: "Magyars", reason: "Free attack upgrades and Magyar Huszar hunt siege for free." },
    { civ: "Lithuanians", reason: "Relic-boosted cavalry dives siege lines through anything." },
  ],
  gunpowder: [
    { civ: "Mongols", reason: "Siege and mobility outrange slow gunpowder compositions." },
    { civ: "Britons", reason: "Longbows outrange Hand Cannoneers comfortably." },
    { civ: "Franks", reason: "Knight pressure closes the gap before gunpowder comes online." },
  ],
  navy: [
    { civ: "Vikings", reason: "Cheap, discounted warships win almost any water fight." },
    { civ: "Portuguese", reason: "Feitorias and strong ships hold water into the late game." },
    { civ: "Italians", reason: "Cheaper Docks and fishing keep the water economy ahead." },
  ],
  boom: [
    { civ: "Mongols", reason: "Early raids punish a greedy economy before it pays off." },
    { civ: "Huns", reason: "No houses means faster aggression that outpaces a boom." },
    { civ: "Franks", reason: "Knight timings arrive before a booming player has defences." },
  ],
};

const GENERIC_COUNTERS: CivRecommendation[] = [
  { civ: "Byzantines", reason: "Versatile tech tree adapts well to an unknown opponent." },
  { civ: "Franks", reason: "Strong knight openings stay solid against most generic play." },
  { civ: "Mongols", reason: "Mobility punishes greedy or predictable opponents." },
];

export function getCivRecommendations(
  civStats: CivStat[],
  playstyle?: PlaystyleTag | null,
): CivRecommendation[] {
  const topCiv = civStats[0]?.civName;
  if (topCiv && CIV_COUNTERS[topCiv]) return CIV_COUNTERS[topCiv];
  if (playstyle && PLAYSTYLE_COUNTERS[playstyle]) return PLAYSTYLE_COUNTERS[playstyle]!;
  return GENERIC_COUNTERS;
}

const CIV_PLAYSTYLE: Record<string, PlaystyleTag> = {
  Franks: "cavalry",
  Lithuanians: "cavalry",
  Persians: "cavalry",
  Magyars: "cavalry",
  Teutons: "cavalry",
  Poles: "cavalry",
  Cumans: "cavalry",
  Huns: "cavalry",
  Tatars: "cavalry",
  Mongols: "archers",
  Britons: "archers",
  Ethiopians: "archers",
  Chinese: "archers",
  Mayans: "archers",
  Vietnamese: "archers",
  Italians: "archers",
  Bengalis: "archers",
  Dravidians: "archers",
  Koreans: "archers",
  Goths: "infantry",
  Vikings: "infantry",
  Japanese: "infantry",
  Celts: "siege",
  Slavs: "infantry",
  Malay: "infantry",
  Burgundians: "cavalry",
  Romans: "infantry",
  Malians: "infantry",
  Bohemians: "gunpowder",
  Turks: "gunpowder",
  Portuguese: "gunpowder",
  Spanish: "gunpowder",
  Berbers: "camels",
  Saracens: "camels",
  Hindustanis: "camels",
  Gurjaras: "camels",
  Byzantines: "flex",
  Khmer: "siege",
  Incas: "infantry",
  Aztecs: "infantry",
  Armenians: "navy",
  Georgians: "cavalry",
  Burmese: "infantry",
  Bulgarians: "cavalry",
  Sicilians: "infantry",
  // Three Kingdoms
  Shu: "archers",
  Wei: "cavalry",
  Wu: "infantry",
  Jurchens: "cavalry",
  Khitans: "cavalry",
  // The Last Chieftains
  Mapuche: "cavalry",
  Muisca: "archers",
  Tupi: "archers",
};

/** A style has to cover this share of their games before we call them a specialist. */
const PLAYSTYLE_DOMINANCE_THRESHOLD = 0.35;

export function computePlaystyle(civStats: CivStat[]): PlaystyleTag | null {
  if (civStats.length === 0) return null;

  // Weight every civ they played, not just their top few: a wide civ pool is
  // exactly the case where an arbitrary cut-off produces a random-looking tag.
  const tally = new Map<PlaystyleTag, number>();
  let classified = 0;
  for (const c of civStats) {
    const tag = CIV_PLAYSTYLE[c.civName];
    if (!tag) continue;
    tally.set(tag, (tally.get(tag) ?? 0) + c.games);
    classified += c.games;
  }

  if (classified === 0) return null;

  let best: PlaystyleTag | null = null;
  let bestCount = 0;
  tally.forEach((count, tag) => {
    if (count > bestCount) {
      best = tag;
      bestCount = count;
    }
  });

  // No dominant preference: they are a generalist, not a specialist in whatever
  // happened to come out on top.
  if (bestCount / classified < PLAYSTYLE_DOMINANCE_THRESHOLD) return "flex";
  return best;
}

export function computeRatingHistory(matches: CompanionMatch[], profileId: number, count: number): number[] {
  const history: number[] = [];
  const sorted = [...matches]
    .filter((m) => m.started)
    .sort((a, b) => new Date(a.started).getTime() - new Date(b.started).getTime());

  for (const match of sorted) {
    const me = findMe(match, profileId);
    if (!me || me.won === null) continue;
    history.push(me.rating ?? 0);
  }

  return history.slice(-count);
}

export function computeHeadToHead(
  opponentMatches: CompanionMatch[],
  opponentProfileId: number,
  myProfileId: number,
): HeadToHead | null {
  const shared = opponentMatches.filter((match) =>
    match.teams.some((t) => t.players.some((p) => p.profileId === myProfileId)),
  );

  if (shared.length === 0) return null;

  let wins = 0;
  let losses = 0;
  let lastEncounter: number | null = null;
  const recent: HeadToHead["recent"] = [];

  for (const match of shared) {
    let mePlayer: CompanionMatchPlayer | undefined;
    let oppPlayer: CompanionMatchPlayer | undefined;
    let myTeamId: number | undefined;
    let oppTeamId: number | undefined;

    for (const team of match.teams) {
      for (const p of team.players) {
        if (p.profileId === myProfileId) {
          mePlayer = p;
          myTeamId = team.teamId;
        } else if (p.profileId === opponentProfileId) {
          oppPlayer = p;
          oppTeamId = team.teamId;
        }
      }
    }

    if (!mePlayer || !oppPlayer || mePlayer.won === null) continue;
    if (myTeamId !== undefined && oppTeamId !== undefined && myTeamId === oppTeamId) continue;

    if (mePlayer.won) wins += 1;
    else losses += 1;

    const finishedTs = match.finished ? new Date(match.finished).getTime() : new Date(match.started).getTime();
    const dateSec = Math.floor(finishedTs / 1000);
    if (lastEncounter === null || dateSec > lastEncounter) lastEncounter = dateSec;

    if (recent.length < 5) {
      recent.push({
        map: match.mapName || cleanMapName(match.map || "unknown"),
        won: mePlayer.won,
        myCiv: mePlayer.civName || mePlayer.civ ? canonicalCivName(mePlayer.civName || mePlayer.civ) : "—",
        opponentCiv: oppPlayer.civName || oppPlayer.civ ? canonicalCivName(oppPlayer.civName || oppPlayer.civ) : "—",
        date: dateSec,
        ratingChange: mePlayer.ratingDiff ?? 0,
      });
    }
  }

  if (wins + losses === 0) return null;

  return {
    totalGames: wins + losses,
    wins,
    losses,
    lastEncounter,
    recent: recent.sort((a, b) => b.date - a.date),
  };
}

function extractLeaderboardStats(lb: {
  rating: number; rank: number; wins: number; losses: number;
  streak: number; maxRating: number; drops: number; games: number;
  rankCountry: number; lastMatchTime: string | null;
} | undefined): LeaderboardStats | null {
  if (!lb) return null;
  const total = lb.wins + lb.losses;
  return {
    rating: lb.rating,
    rank: lb.rank,
    wins: lb.wins,
    losses: lb.losses,
    winRate: total > 0 ? Math.round((lb.wins / total) * 1000) / 10 : 0,
    streak: lb.streak,
    highestRating: lb.maxRating ?? lb.rating,
    drops: lb.drops ?? 0,
    games: lb.games ?? total,
    rankCountry: lb.rankCountry ?? 0,
    lastMatchTime: lb.lastMatchTime ?? null,
  };
}

export async function buildScoutReport({
  profileId,
  name,
  leaderboardType = "rm_1v1",
  vsProfileId,
  matchPages = 5,
}: {
  profileId?: number;
  name?: string;
  leaderboardType?: ScoutLeaderboardType;
  vsProfileId?: number;
  matchPages?: number;
}): Promise<ScoutReport> {
  let resolvedProfileId = profileId ?? null;

  if (!resolvedProfileId && name) {
    const searchResult = await searchPlayerCompanion(name);
    if (!searchResult.profiles?.length) {
      throw new Error(`No player found for name: ${name}`);
    }
    resolvedProfileId = searchResult.profiles[0].profileId;
  }

  if (!resolvedProfileId) {
    throw new Error("Provide either profileId or name");
  }

  const [companionProfile, matchesResult] = await Promise.all([
    getCompanionProfile(resolvedProfileId),
    fetchCompanionMatches(resolvedProfileId, leaderboardType, matchPages),
  ]);
  const matches = matchesResult.matches;

  const rm1v1Lb = companionProfile.leaderboards?.find(
    (lb) => lb.abbreviation === "RM 1v1" || lb.leaderboardId === "rm_1v1",
  );
  const rmTeamLb = companionProfile.leaderboards?.find(
    (lb) => lb.abbreviation === "RM Team" || lb.leaderboardId === "rm_team",
  );
  const ew1v1Lb = companionProfile.leaderboards?.find(
    (lb) => lb.abbreviation === "EW 1v1" || lb.leaderboardId === "ew_1v1",
  );
  const ewTeamLb = companionProfile.leaderboards?.find(
    (lb) => lb.abbreviation === "EW Team" || lb.leaderboardId === "ew_team",
  );

  const primaryLb =
    leaderboardType === "rm_team" ? rmTeamLb :
    leaderboardType === "ew_1v1" ? ew1v1Lb :
    leaderboardType === "ew_team" ? ewTeamLb :
    rm1v1Lb;

  const profile: ScoutProfile = {
    name: companionProfile.name,
    profileId: companionProfile.profileId,
    country: companionProfile.country ?? companionProfile.countryName ?? null,
    rating: primaryLb?.rating ?? 0,
    rank: primaryLb?.rank ?? 0,
    wins: primaryLb?.wins ?? 0,
    losses: primaryLb?.losses ?? 0,
    streak: primaryLb?.streak ?? 0,
    highestRating: primaryLb?.maxRating ?? 0,
    clan: companionProfile.clan ?? null,
    rm1v1: extractLeaderboardStats(rm1v1Lb),
    rmTeam: extractLeaderboardStats(rmTeamLb),
    ew1v1: extractLeaderboardStats(ew1v1Lb),
    ewTeam: extractLeaderboardStats(ewTeamLb),
  };

  const civStats = computeCivStats(matches, resolvedProfileId);
  const mapStats = computeMapStats(matches, resolvedProfileId);
  const recentForm = computeRecentForm(matches, resolvedProfileId, 20);
  const recentMatches = computeRecentMatches(matches, resolvedProfileId, 10);
  const avgGameDuration = computeAvgGameDuration(matches);
  const playstyle = computePlaystyle(civStats);
  const civRecommendations = getCivRecommendations(civStats, playstyle);
  const ratingHistory = computeRatingHistory(matches, resolvedProfileId, 20);
  const headToHead = vsProfileId && vsProfileId !== resolvedProfileId
    ? computeHeadToHead(matches, resolvedProfileId, vsProfileId)
    : null;

  const tacticalBriefing = computeTacticalBriefing({
    profile,
    civStats,
    mapStats,
    recentForm,
    avgGameDuration,
    playstyle,
  });

  return {
    profile,
    civStats,
    mapStats,
    recentForm,
    recentMatches,
    avgGameDuration,
    civRecommendations,
    matchCount: matches.length,
    playstyle,
    ratingHistory,
    headToHead,
    tacticalBriefing,
    historyLoaded: matchesResult.loaded,
  };
}

export function computeTacticalBriefing(params: {
  profile: ScoutProfile;
  civStats: CivStat[];
  mapStats: MapStat[];
  recentForm: ("W" | "L")[];
  avgGameDuration: number;
  playstyle: PlaystyleTag | null;
}): TacticalBriefing {
  const { civStats, mapStats, recentForm, playstyle } = params;
  const hasHistory = civStats.length > 0;
  const topCiv = civStats[0]?.civName ?? "";
  const topCivWinRate = civStats[0]?.winRate ?? 0;
  const topMap = mapStats[0]?.map ?? "";

  let profileHeadline = {
    en: "Balanced Ladder Competitor",
    es: "Competidor Versátil de Ranked",
  };
  const topCivGames = civStats[0]?.games ?? 0;
  let profileDetail = {
    en: `Most played map is ${topMap}. Most played civ is ${topCiv} (${topCivGames} games, ${topCivWinRate}% WR). No single unit composition dominates their games, so expect standard macro play.`,
    es: `Su mapa más jugado es ${topMap}. Su civilización más jugada es ${topCiv} (${topCivGames} partidas, ${topCivWinRate}% de victorias). Ninguna composición domina sus partidas, así que espera un juego de macro estándar.`,
  };

  let step1 = {
    title: { en: "1. Opening Strategy", es: "1. Estrategia de Apertura" },
    detail: {
      en: "Open 19-20 Pop Scouts to scout their base and contest map control early.",
      es: "Abre 19-20 Pop con Exploradores para ganar control del mapa y explorar sus recursos.",
    },
  };
  let step2 = {
    title: { en: "2. Early Warning Spike", es: "2. Alerta de Power Spike" },
    detail: {
      en: "Expect Feudal army active around 11:00-12:00. Keep defensive walls or spears ready.",
      es: "Anticipa presión militar entre 11:00 y 12:00. Ten empalizadas o lanceros en puntos ciegos.",
    },
  };
  let step3 = {
    title: { en: "3. Win Condition Target", es: "3. Condición de Victoria" },
    detail: {
      en: "Reach Castle Age with 2+ production buildings and transition into heavy cavalry or cross-counter composition.",
      es: "Llega a Castillos con 2+ edificios militares y haz transición a caballería pesada o masa de asedio.",
    },
  };

  if (playstyle === "cavalry") {
    profileHeadline = {
      en: "Aggressive Cavalry Specialist",
      es: "Especialista en Caballería y Agresividad",
    };
    profileDetail = {
      en: `Heavily relies on mobile cavalry openings (${topCiv}). Vulnerable to early spearmen defense, quick walls, and Castle Age Monks/Camels.`,
      es: `Prefiere aperturas rápidas de caballería (${topCiv}). Es vulnerable a empalizadas tempranas, piqueros bien colocados y monjes en Castillos.`,
    };
    step1 = {
      title: { en: "1. Opening (19 Pop Scouts or Wall & Archers)", es: "1. Apertura (19 Pop Scouts o Muros + Arqueros)" },
      detail: {
        en: "Open Scouts or quick-wall your woodlines and produce 1 spearman per exposed resource.",
        es: "Abre con Exploradores o amuralla tus madereras rápido con 1 piquero de soporte por recurso expuesto.",
      },
    };
    step2 = {
      title: { en: "2. Early Warning (Min 10:30 - 13:00)", es: "2. Alerta Temprana (Min 10:30 - 13:00)" },
      detail: {
        en: "Watch for 3-5 scout harass on your berries/woodline. Protect your villagers under TC fire.",
        es: "Atento a incursiones de 3 a 5 exploradores en bayas o madera. No te expongas fuera del rango del Centro Urbano.",
      },
    };
    step3 = {
      title: { en: "3. Win Condition (Castle Age Monks / Camels / Halbs)", es: "3. Condición de Victoria (Monjes / Camellos / Piqueros)" },
      detail: {
        en: "Drop a Monastery and Siege Workshop upon hitting Castle Age. Convert knights and counter-push with Mangonels.",
        es: "Mete Monasterio y Taller de Asedio nada más llegar a Castillos. Convierte jinetes y contraataca con Mangonelas.",
      },
    };
  } else if (playstyle === "archers") {
    profileHeadline = {
      en: "Ranged Mass & Micro Player",
      es: "Jugador de Rango y Microgestión de Arqueros",
    };
    profileDetail = {
      en: `Favors 2-range archer build orders (${topCiv}). Seeks to group 20+ Crossbows with Bodkin Arrow. Vulnerable to Skirmishers + Armor and fast Mangonels.`,
      es: `Suele jugar a 2 Galerías de Tiro (${topCiv}). Busca juntar 20+ Ballesteros con flecha punzón. Vulnerable a Guerrilleros con armadura y Mangonelas.`,
    };
    step1 = {
      title: { en: "1. Opening (19 Pop Scouts or 20 Pop Skirmishers)", es: "1. Apertura (19 Pop Scouts o Guerrilleros)" },
      detail: {
        en: "Open Scouts to delay their archer mass or mix in 4-6 Skirmishers with Scale Mail armor.",
        es: "Abre con Exploradores para cazar arqueros en tránsito o añade 4-6 Guerrilleros con armadura de herrería.",
      },
    };
    step2 = {
      title: { en: "2. Early Warning (Min 11:30 - 13:30 Crossbow Spike)", es: "2. Alerta Temprana (Min 11:30 - 13:30 Spike de Ballestas)" },
      detail: {
        en: "Spike at Castle Age with 15-20 Crossbowmen + Bodkin Arrow. Do NOT fight in open fields without siege or armor.",
        es: "Pico de poder al subir a Castillos con Ballesteros y +2 de ataque. NO pelees a campo abierto sin Mangonelas o armadura.",
      },
    };
    step3 = {
      title: { en: "3. Win Condition (Knights + Mangonel Pinch)", es: "3. Condición de Victoria (Jinetes + Mangonela)" },
      detail: {
        en: "Force them backward with 1-2 Mangonels while Knights flank from the sides to wipe their ranged mass.",
        es: "Hazles retroceder con 1-2 Mangonelas mientras tus jinetes flanquean por los lados para limpiar su masa de arqueros.",
      },
    };
  } else if (playstyle === "infantry") {
    profileHeadline = {
      en: "Infantry Flood & Forward Pressure",
      es: "Presión Temprana de Infantería",
    };
    profileDetail = {
      en: `Relies on Men-at-Arms or Eagle Warrior tempo (${topCiv}). Vulnerable to defensive archers, walls, and defensive towers.`,
      es: `Utiliza Hombres de Armas o Guerreros Águila (${topCiv}). Vulnerable a arqueros bien protegidos, muros y torres defensivas.`,
    };
    step1 = {
      title: { en: "1. Opening (Archers behind small walls)", es: "1. Apertura (Arqueros tras muros pequeños)" },
      detail: {
        en: "Wall your resource nodes tightly and rush 1 Archery Range for archers with Fletching.",
        es: "Amuralla tus recursos de cerca y levanta Galería de Tiro rápida para sacar arqueros con flecha emplumada.",
      },
    };
    step2 = {
      title: { en: "2. Early Warning (Min 09:30 - 10:30 M&A Rush)", es: "2. Alerta Temprana (Min 09:30 - 10:30 M&A Rush)" },
      detail: {
        en: "Look for 3 Men-at-Arms hitting your palisades before Feudal completes. Garrison villagers if trapped.",
        es: "Vigila la llegada de 3 Hombres de Armas a tus empalizadas antes del minuto 10. Guarece aldeanos si te sorprenden.",
      },
    };
    step3 = {
      title: { en: "3. Win Condition (Castle Age Crossbows + Knights)", es: "3. Condición de Victoria (Ballestas + Jinetes)" },
      detail: {
        en: "Mass Crossbows to shred infantry armor, and add a stable for mobility to raid their woodlines.",
        es: "Acumula Ballesteros para destrozar su infantería y añade un establo para raidear sus líneas de madera.",
      },
    };
  }

  let matchupAdvantage = {
    headline: {
      en: `Countering ${topCiv} on ${topMap}`,
      es: `Cómo contrarrestar a ${topCiv} en ${topMap}`,
    },
    detail: {
      en: `Their most played civ (${topCiv}) has strong spikes, but becomes predictable. On ${topMap}, controlling the center gold and dictating the pace in early Castle Age wins the match.`,
      es: `Su civilización favorita (${topCiv}) tiene picos fuertes pero predecibles. En ${topMap}, controlar los oros centrales y marcar el ritmo en Castillos temprano asegura la victoria.`,
    },
  };

  // With no match history we know nothing about this player: say so instead of
  // filling the briefing with placeholder civs, maps and win rates.
  if (!hasHistory) {
    profileHeadline = {
      en: "No Match History Available",
      es: "Sin Historial de Partidas",
    };
    profileDetail = {
      en: "We could not read this player's recent ranked games, so there is no read on their preferred civs, maps or playstyle. The plan below is a solid default opening, not a scouted counter.",
      es: "No hemos podido leer sus partidas clasificatorias recientes, así que no tenemos lectura de sus civilizaciones, mapas ni estilo. El plan de abajo es una apertura sólida por defecto, no un contra específico.",
    };
    matchupAdvantage = {
      headline: {
        en: "Scout In-Game Instead",
        es: "Explora Dentro de la Partida",
      },
      detail: {
        en: "Send your scout early and read their build from their buildings: an early Barracks plus Stable means cavalry pressure, two Archery Ranges means an archer mass, and a quiet base with a fast Town Center means a boom.",
        es: "Manda el explorador pronto y lee su build por sus edificios: Cuartel y Establo temprano significa presión de caballería, dos Galerías de Tiro significa masa de arqueros, y una base tranquila con Centro Urbano rápido significa boom.",
      },
    };
  }

  return {
    hasHistory,
    playerProfile: {
      headline: profileHeadline,
      detail: profileDetail,
      tag: hasHistory ? playstyle || "flex" : null,
    },
    matchupAdvantage,
    threeStepPlan: {
      step1Opening: step1,
      step2Warning: step2,
      step3WinCondition: step3,
    },
  };
}
