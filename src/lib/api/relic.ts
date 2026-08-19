/**
 * Client for the World's Edge / Relic Link API (aoe-api.worldsedgelink.com)
 * Provides leaderboards, player stats, and match history.
 * Rate limit: ~50 req/s for community endpoints.
 */

const RELIC_BASE = process.env.RELIC_API_BASE || "https://aoe-api.worldsedgelink.com";
const TITLE = "age2";

// ── Types ──

export interface RelicResult {
  code: number;
  message: string;
}

export interface RelicMember {
  profile_id: number;
  name: string;
  alias: string;
  personal_statgroup_id: number;
  xp: number;
  level: number;
  leaderboardregion_id: number;
  country: string;
}

export interface RelicStatGroup {
  id: number;
  name: string;
  type: number;
  members: RelicMember[];
}

export interface RelicLeaderboardStat {
  statgroup_id: number;
  leaderboard_id: number;
  wins: number;
  losses: number;
  streak: number;
  disputes: number;
  drops: number;
  rank: number;
  ranktotal: number;
  ranklevel: number;
  rating: number;
  regionrank: number;
  regionranktotal: number;
  lastmatchdate: number;
  highestrating?: number;
  highestrank?: number;
}

export interface LeaderboardResponse {
  result: RelicResult;
  statGroups: RelicStatGroup[];
  leaderboardStats: RelicLeaderboardStat[];
  rankTotal: number;
}

export interface PersonalStatResponse {
  result: RelicResult;
  statGroups: RelicStatGroup[];
  leaderboardStats: RelicLeaderboardStat[];
}

// ── Race / Civilization ID map (from GetAvailableLeaderboards) ──

export const RACE_NAMES: Record<number, string> = {
  0: "Aztecs", 1: "Berbers", 2: "Britons", 3: "Bulgarians", 4: "Burmese",
  5: "Byzantines", 6: "Celts", 7: "Chinese", 8: "Cumans", 9: "Ethiopians",
  10: "Franks", 11: "Goths", 12: "Huns", 13: "Incas", 14: "Hindustanis",
  15: "Italians", 16: "Japanese", 17: "Khmer", 18: "Koreans", 19: "Lithuanians",
  20: "Magyars", 21: "Malay", 22: "Malians", 23: "Mayans", 24: "Mongols",
  25: "Persians", 26: "Portuguese", 27: "Saracens", 28: "Slavs", 29: "Spanish",
  30: "Tatars", 31: "Teutons", 32: "Turks", 33: "Vietnamese", 34: "Vikings",
  35: "Burgundians", 36: "Sicilians", 37: "Poles", 38: "Bohemians",
  39: "Bengalis", 40: "Dravidians", 41: "Gurjaras", 42: "Romans",
  43: "Armenians", 44: "Georgians",
};

// ── API methods ──

async function relicGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(path, RELIC_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (res.status === 429) {
    throw new Error("Rate limited by Relic API. Try again in a moment.");
  }
  if (!res.ok) {
    throw new Error(`Relic API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getLeaderboard(leaderboardId: number, start = 1, count = 200) {
  return relicGet<LeaderboardResponse>("/community/leaderboard/getLeaderBoard2", {
    title: TITLE,
    leaderboard_id: String(leaderboardId),
    start: String(start),
    count: String(count),
    sortBy: "1",
  });
}

export async function searchPlayer(query: string) {
  return relicGet<PersonalStatResponse>(
    "/community/leaderboard/GetPersonalStat",
    { title: TITLE, search: query }
  );
}

export interface CompanionProfile {
  name: string;
  profileId: number;
  country: string | null;
  games: string | number;
  clan: string | null;
  drops: string | number;
  platform: string | null;
}

export interface CompanionSearchResult {
  count: number;
  hasMore: boolean;
  profiles: CompanionProfile[];
}

export interface CompanionLeaderboard {
  leaderboardId: string;
  leaderboardName: string;
  abbreviation: string;
  rank: number;
  rating: number;
  maxRating: number;
  wins: number;
  losses: number;
  games: number;
  streak: number;
  drops: number;
  active: boolean;
  total: number;
  lastMatchTime: string | null;
  rankCountry: number;
}

export interface CompanionFullProfile extends CompanionProfile {
  leaderboards: CompanionLeaderboard[];
  countryIcon?: string;
  countryName?: string;
}

const COMPANION_BASE = "https://data.aoe2companion.com";
const COMPANION_HEADERS = {
  Accept: "application/json",
  "User-Agent": "aoe2ai/1.0 (community fan project)",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The Companion API rate-limits bursts (a lobby scout fires one request per slot),
 * so retry 429s and 5xx before giving up.
 */
async function companionFetch(url: string, revalidate: number): Promise<Response> {
  let lastStatus = 0;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: COMPANION_HEADERS, next: { revalidate } });
      if (res.ok) return res;
      lastStatus = res.status;
      if (res.status !== 429 && res.status < 500) break;
    } catch {
      lastStatus = 0;
    }
    if (attempt < 2) await sleep(300 * (attempt + 1));
  }

  throw new Error(`Companion API error: ${lastStatus || "network"}`);
}

export async function searchPlayerCompanion(query: string): Promise<CompanionSearchResult> {
  const res = await companionFetch(
    `${COMPANION_BASE}/api/profiles?search=${encodeURIComponent(query)}`,
    60,
  );
  return res.json();
}

export async function getCompanionProfile(profileId: number): Promise<CompanionFullProfile> {
  const res = await companionFetch(`${COMPANION_BASE}/api/profiles/${profileId}`, 60);
  return res.json();
}

// ── Companion Matches API (richer data, filtered by mode) ──

export interface CompanionMatchPlayer {
  profileId: number;
  name: string;
  rating: number;
  ratingDiff: number;
  civ: string;
  civName: string;
  won: boolean | null;
  country: string | null;
}

export interface CompanionMatch {
  matchId: number;
  started: string;
  finished: string | null;
  leaderboardId: string;
  map: string;
  mapName: string;
  teams: { teamId: number; players: CompanionMatchPlayer[] }[];
}

export interface CompanionMatchesResponse {
  page: number;
  perPage: number;
  matches: CompanionMatch[];
}

export interface CompanionMatchesResult {
  matches: CompanionMatch[];
  /** False when the history request itself failed (rate limit, network, 5xx). */
  loaded: boolean;
}

async function fetchMatchPage(
  profileId: number,
  leaderboardId: string,
  page: number,
): Promise<CompanionMatchesResponse | null> {
  try {
    // The filter param is `leaderboard_ids` (plural). The singular form is
    // silently ignored and returns every mode, unranked lobbies included.
    const res = await companionFetch(
      `${COMPANION_BASE}/api/matches?profile_ids=${profileId}&leaderboard_ids=${encodeURIComponent(leaderboardId)}&count=20&page=${page}`,
      120,
    );
    return (await res.json()) as CompanionMatchesResponse;
  } catch {
    return null;
  }
}

export async function fetchCompanionMatches(
  profileId: number,
  leaderboardId = "rm_1v1",
  pages = 5,
): Promise<CompanionMatchesResult> {
  const results = await Promise.all(
    Array.from({ length: pages }, (_, i) => fetchMatchPage(profileId, leaderboardId, i + 1)),
  );

  const all: CompanionMatch[] = [];
  const seen = new Set<number>();
  for (const r of results) {
    for (const match of r?.matches ?? []) {
      // Guard against the server-side filter regressing again, and against the
      // same match showing up on two pages while new games shift the paging.
      if (match.leaderboardId !== leaderboardId) continue;
      if (seen.has(match.matchId)) continue;
      seen.add(match.matchId);
      all.push(match);
    }
  }

  all.sort((a, b) => new Date(b.started).getTime() - new Date(a.started).getTime());

  // The first page decides whether we actually know the player's history:
  // an empty page 1 means "no games", a failed page 1 means "we don't know".
  return { matches: all, loaded: results[0] !== null };
}

export async function getCompanionMatches(
  profileId: number,
  leaderboardId = "rm_1v1",
  pages = 5,
): Promise<CompanionMatch[]> {
  const { matches } = await fetchCompanionMatches(profileId, leaderboardId, pages);
  return matches;
}
