/**
 * Client for the World's Edge / Relic Link API (aoe-api.worldsedgelink.com)
 * Primary data source for leaderboards, match history, and live games.
 *
 * Rate limits: ~200 req/min. We throttle to ~100 req/30s for safety.
 * Ref: https://wiki.librematch.org/rlink/usage
 */

const RELIC_BASE = process.env.RELIC_API_BASE || "https://aoe-api.worldsedgelink.com";
const TITLE = "age2";

interface RelicResponse<T> {
  result: { code: number; message: string };
  statGroups?: T[];
  leaderboardStats?: T[];
  matchHistoryStats?: T[];
}

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

// ── Leaderboard ──

export async function getLeaderboard(leaderboardId: number, start = 1, count = 100) {
  return relicGet<RelicResponse<unknown>>("/community/leaderboard/getLeaderBoard2", {
    title: TITLE,
    leaderboard_id: String(leaderboardId),
    start: String(start),
    count: String(count),
    sortBy: "1",
  });
}

export async function searchPlayer(query: string) {
  return relicGet<RelicResponse<unknown>>(
    "/community/leaderboard/GetPersonalStat",
    {
      title: TITLE,
      search: query,
    }
  );
}

export async function getPlayerStats(profileId: number) {
  return relicGet<RelicResponse<unknown>>(
    "/community/leaderboard/GetPersonalStat",
    {
      title: TITLE,
      profile_ids: JSON.stringify([profileId]),
    }
  );
}

// ── Match History ──

export async function getMatchHistory(profileId: number) {
  return relicGet<RelicResponse<unknown>>(
    "/community/leaderboard/getRecentMatchHistory",
    {
      title: TITLE,
      profile_ids: JSON.stringify([profileId]),
    }
  );
}

// ── Ongoing / Observable Games ──

export async function getObservableGames() {
  return relicGet<RelicResponse<unknown>>("/game/advertisement/findObservableGames", {
    title: TITLE,
  });
}
