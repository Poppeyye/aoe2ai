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

export async function searchPlayerCompanion(query: string): Promise<CompanionSearchResult> {
  const url = `${COMPANION_BASE}/api/profiles?search=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: COMPANION_HEADERS, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Companion API error: ${res.status}`);
  return res.json();
}

export async function getCompanionProfile(profileId: number): Promise<CompanionFullProfile> {
  const url = `${COMPANION_BASE}/api/profiles/${profileId}`;
  const res = await fetch(url, { headers: COMPANION_HEADERS, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Companion API error: ${res.status}`);
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

export async function getCompanionMatches(
  profileId: number,
  leaderboardId = "rm_1v1",
  pages = 5,
): Promise<CompanionMatch[]> {
  const fetches = Array.from({ length: pages }, (_, i) =>
    fetch(
      `${COMPANION_BASE}/api/matches?profile_ids=${profileId}&leaderboard_id=${leaderboardId}&count=20&page=${i + 1}`,
      { headers: COMPANION_HEADERS, next: { revalidate: 120 } },
    )
      .then((r) => (r.ok ? r.json() as Promise<CompanionMatchesResponse> : null))
      .catch(() => null),
  );

  const results = await Promise.all(fetches);
  const all: CompanionMatch[] = [];
  for (const r of results) {
    if (r?.matches) all.push(...r.matches);
  }
  return all;
}
