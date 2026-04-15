import {
  getCompanionMatches,
  getCompanionProfile,
  searchPlayerCompanion,
  type CompanionMatch,
  type CompanionMatchPlayer,
} from "@/lib/api/relic";

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

export interface ScoutReport {
  profile: ScoutProfile;
  civStats: CivStat[];
  mapStats: MapStat[];
  recentForm: ("W" | "L")[];
  recentMatches: RecentMatch[];
  avgGameDuration: number;
  civRecommendations: CivRecommendation[];
  matchCount: number;
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

    const civName = titleCase(me.civName || me.civ || "Unknown");
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
      civ: titleCase(me.civName || me.civ || "Unknown"),
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

export function getCivRecommendations(civStats: CivStat[]): CivRecommendation[] {
  if (civStats.length === 0) {
    return [
      { civ: "Byzantines", reason: "Versatile tech tree adapts well to unknown strategies." },
      { civ: "Franks", reason: "Strong knight openings stay solid against most generic play." },
      { civ: "Mongols", reason: "Mobility punishes greedy or predictable opponents." },
    ];
  }

  const topCiv = civStats[0]?.civName;
  if (topCiv && CIV_COUNTERS[topCiv]) {
    return CIV_COUNTERS[topCiv];
  }

  return [
    { civ: "Byzantines", reason: "Flexible tech tree lets you react to many compositions." },
    { civ: "Franks", reason: "Simple, strong cavalry timings are reliable on open maps." },
    { civ: "Mongols", reason: "Mobility and tempo are good against ladder players with habits." },
  ];
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
}: {
  profileId?: number;
  name?: string;
  leaderboardType?: "rm_1v1" | "rm_team";
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

  const [companionProfile, matches] = await Promise.all([
    getCompanionProfile(resolvedProfileId),
    getCompanionMatches(resolvedProfileId, leaderboardType, 5),
  ]);

  const rm1v1Lb = companionProfile.leaderboards?.find(
    (lb) => lb.abbreviation === "RM 1v1" || lb.leaderboardId === "rm_1v1",
  );
  const rmTeamLb = companionProfile.leaderboards?.find(
    (lb) => lb.abbreviation === "RM Team" || lb.leaderboardId === "rm_team",
  );

  const primaryLb = leaderboardType === "rm_team" ? rmTeamLb : rm1v1Lb;

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
  };

  const civStats = computeCivStats(matches, resolvedProfileId);
  const mapStats = computeMapStats(matches, resolvedProfileId);
  const recentForm = computeRecentForm(matches, resolvedProfileId, 20);
  const recentMatches = computeRecentMatches(matches, resolvedProfileId, 10);
  const avgGameDuration = computeAvgGameDuration(matches);
  const civRecommendations = getCivRecommendations(civStats);

  return {
    profile,
    civStats,
    mapStats,
    recentForm,
    recentMatches,
    avgGameDuration,
    civRecommendations,
    matchCount: matches.length,
  };
}
