import { NextRequest, NextResponse } from "next/server";
import {
  getLeaderboard,
  searchPlayer,
  searchPlayerCompanion,
  getCompanionProfile,
  getCompanionMatches,
  type RelicStatGroup,
  type RelicLeaderboardStat,
  type CompanionProfile,
  type CompanionLeaderboard,
  type CompanionMatch,
} from "@/lib/api/relic";
import { LEADERBOARD_IDS, type LeaderboardType } from "@/types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, resetAt } = checkRateLimit(`players:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } },
      );
    }
    const query = req.nextUrl.searchParams.get("q");
    const type = (req.nextUrl.searchParams.get("type") || "rm_1v1") as LeaderboardType;
    const profileId = req.nextUrl.searchParams.get("profileId");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const count = 200;
    const leaderboardId = LEADERBOARD_IDS[type] ?? 3;

    if (profileId) {
      const pid = Number(profileId);

      const [companionProfile, companionMatches] = await Promise.all([
        getCompanionProfile(pid).catch(() => null),
        getCompanionMatches(pid, "rm_1v1", 5).catch(() => [] as CompanionMatch[]),
      ]);

      if (!companionProfile) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 });
      }

      const ratings: Record<string, {
        rating: number; rank: number; wins: number; losses: number;
        streak: number; drops: number; highestRating: number;
        lastMatchDate: number; ranktotal: number;
      }> = {};

      for (const lb of companionProfile.leaderboards || []) {
        const name = lb.abbreviation || lb.leaderboardName || lb.leaderboardId;
        const lastMatch = lb.lastMatchTime
          ? Math.floor(new Date(lb.lastMatchTime).getTime() / 1000)
          : 0;
        ratings[name] = {
          rating: lb.rating,
          rank: lb.rank,
          wins: lb.wins,
          losses: lb.losses,
          streak: lb.streak,
          drops: lb.drops,
          highestRating: lb.maxRating || lb.rating || 0,
          lastMatchDate: lastMatch,
          ranktotal: lb.total || 0,
        };
      }

      const matches = companionMatches.slice(0, 50).map((m: CompanionMatch) => {
        let myPlayer = null;
        for (const team of m.teams) {
          const found = team.players.find((p) => p.profileId === pid);
          if (found) { myPlayer = found; break; }
        }

        const startTime = m.started ? Math.floor(new Date(m.started).getTime() / 1000) : 0;
        const endTime = m.finished ? Math.floor(new Date(m.finished).getTime() / 1000) : 0;
        const duration = endTime > startTime ? endTime - startTime : 0;

        const allPlayers = m.teams.flatMap((t) =>
          t.players.map((p) => ({
            profileId: p.profileId,
            name: p.name,
            civ: titleCase(p.civName || p.civ || "Unknown"),
            civId: 0,
            team: t.teamId,
            won: p.won === true,
            ratingChange: p.ratingDiff ?? 0,
            newRating: p.rating ?? 0,
          }))
        );

        return {
          id: m.matchId,
          map: m.mapName || titleCase((m.map || "Unknown").replace(/^rm_/i, "").replace(/_/g, " ")),
          matchType: m.leaderboardId === "rm_1v1" ? "RM 1v1" : m.leaderboardId || "Unknown",
          startTime,
          duration,
          won: myPlayer?.won === true,
          ratingChange: myPlayer?.ratingDiff ?? 0,
          newRating: myPlayer?.rating ?? 0,
          players: allPlayers,
        };
      });

      return NextResponse.json({
        profile: {
          profileId: companionProfile.profileId,
          name: companionProfile.name,
          country: companionProfile.country || "",
        },
        ratings,
        matches,
      });
    }

    if (query) {
      const players = await smartSearch(query, leaderboardId);
      return NextResponse.json({ players });
    }

    const start = (page - 1) * count + 1;
    const data = await getLeaderboard(leaderboardId, start, count);
    return NextResponse.json({
      players: normalizeRelicPlayers(data.statGroups, data.leaderboardStats, leaderboardId),
      total: data.rankTotal || 0,
      page,
    });
  } catch (error) {
    console.error("Players error:", error);
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 });
  }
}

function normalizeRelicPlayers(
  statGroups: RelicStatGroup[],
  leaderboardStats: RelicLeaderboardStat[],
  preferredLb: number,
): unknown[] {
  if (!statGroups?.length && !leaderboardStats?.length) return [];

  const groupMap = new Map<number, RelicStatGroup>();
  for (const sg of statGroups || []) {
    groupMap.set(sg.id, sg);
  }

  const playerMap = new Map<number, {
    profileId: number; name: string; country?: string; level: number;
    rating: number; rank: number; wins: number; losses: number;
    streak: number; drops: number; highestRating: number;
    lastMatchDate: number; leaderboardId: number;
  }>();

  for (const lb of leaderboardStats || []) {
    const group = groupMap.get(lb.statgroup_id);
    const member = group?.members?.[0];
    if (!member) continue;

    const existing = playerMap.get(member.profile_id);
    const isBetter = !existing || lb.leaderboard_id === preferredLb;

    if (isBetter) {
      playerMap.set(member.profile_id, {
        profileId: member.profile_id,
        name: member.alias || `Player ${member.profile_id}`,
        country: member.country || undefined,
        level: member.level,
        rating: lb.rating,
        rank: lb.rank,
        wins: lb.wins,
        losses: lb.losses,
        streak: lb.streak,
        drops: lb.drops,
        highestRating: lb.highestrating ?? lb.rating,
        lastMatchDate: lb.lastmatchdate,
        leaderboardId: lb.leaderboard_id,
      });
    }
  }

  return Array.from(playerMap.values()).sort((a, b) => {
    if (a.rank > 0 && b.rank > 0) return a.rank - b.rank;
    if (a.rank > 0) return -1;
    if (b.rank > 0) return 1;
    return b.rating - a.rating;
  });
}

const COMPANION_LB_MAP: Record<string, number> = {
  rm_1v1: 3, rm_team: 4, ew_1v1: 13, ew_team: 14,
};
const COMPANION_LB_REVERSE: Record<number, string> = {
  3: "rm_1v1", 4: "rm_team", 13: "ew_1v1", 14: "ew_team",
};

function companionToPlayer(
  profile: CompanionProfile,
  leaderboards: CompanionLeaderboard[] | undefined,
  preferredLb: number,
) {
  const preferredKey = COMPANION_LB_REVERSE[preferredLb] || "rm_1v1";
  const lb = leaderboards?.find((l) => l.leaderboardId === preferredKey)
    || leaderboards?.[0];

  const totalGames = Number(profile.games) || 0;
  const lastMatch = lb?.lastMatchTime ? Math.floor(new Date(lb.lastMatchTime).getTime() / 1000) : 0;

  return {
    profileId: profile.profileId,
    name: profile.name,
    country: profile.country || undefined,
    clan: profile.clan || undefined,
    rating: lb?.rating || 0,
    rank: lb?.rank || 0,
    wins: lb?.wins || 0,
    losses: lb?.losses || 0,
    streak: lb?.streak || 0,
    highestRating: lb?.maxRating || lb?.rating || 0,
    lastMatchDate: lastMatch,
    totalGames,
  };
}

function nameSimilarity(query: string, name: string): number {
  const q = query.toLowerCase();
  const n = name.toLowerCase();
  if (n === q) return 1.0;

  const collapse = (s: string) => s.replace(/(.)\1+/g, "$1");
  const qc = collapse(q), nc = collapse(n);

  if (nc === qc) return 0.97;

  if (n.startsWith(q) || q.startsWith(n)) return 0.92;
  if (nc.startsWith(qc) || qc.startsWith(nc)) return 0.88;
  if (n.includes(q) || q.includes(n)) return 0.75;
  if (nc.includes(qc) || qc.includes(nc)) return 0.72;

  let common = 0;
  for (let i = 0; i < Math.min(qc.length, nc.length); i++) {
    if (qc[i] === nc[i]) common++;
    else break;
  }
  return Math.max(0.1, (common / Math.max(qc.length, nc.length)) * 0.6);
}

function generateSearchVariants(query: string): string[] {
  const variants = new Set<string>();
  variants.add(query);

  const single = query.replace(/(.)\1+/g, "$1");
  if (single !== query) variants.add(single);

  const hasRepeats = /(.)\1{2,}/.test(query);
  if (hasRepeats) {
    const match = query.match(/^(.*?)((.)\3{2,})/);
    if (match) {
      const prefix = match[1] + match[3].repeat(3);
      variants.add(prefix);
    }
  }

  if (query.length > 5) {
    variants.add(query.slice(0, Math.ceil(query.length * 0.5)));
  }

  return Array.from(variants);
}

async function smartSearch(query: string, preferredLb: number): Promise<unknown[]> {
  const variants = generateSearchVariants(query);

  const companionSearches = variants.map((v) => searchPlayerCompanion(v));
  const relicSearch = searchPlayer(query);

  const [companionResults, relicResult] = await Promise.all([
    Promise.allSettled(companionSearches),
    relicSearch.then((r) => ({ status: "fulfilled" as const, value: r }))
      .catch(() => ({ status: "rejected" as const, reason: "error" })),
  ]);

  const companionProfiles: CompanionProfile[] = [];
  const seenCompanion = new Set<number>();
  for (const result of companionResults) {
    if (result.status === "fulfilled") {
      for (const p of result.value.profiles) {
        if (!seenCompanion.has(p.profileId)) {
          seenCompanion.add(p.profileId);
          companionProfiles.push(p);
        }
      }
    }
  }

  const enrichLimit = Math.min(companionProfiles.length, 25);
  const enrichResults = await Promise.allSettled(
    companionProfiles.slice(0, enrichLimit).map((p) => getCompanionProfile(p.profileId))
  );

  const enrichedMap = new Map<number, CompanionLeaderboard[]>();
  for (let i = 0; i < enrichResults.length; i++) {
    const r = enrichResults[i];
    if (r.status === "fulfilled" && r.value.leaderboards) {
      enrichedMap.set(companionProfiles[i].profileId, r.value.leaderboards);
    }
  }

  const seen = new Set<number>();
  const players: Array<ReturnType<typeof companionToPlayer>> = [];

  for (const p of companionProfiles) {
    if (!seen.has(p.profileId)) {
      seen.add(p.profileId);
      players.push(companionToPlayer(p, enrichedMap.get(p.profileId), preferredLb));
    }
  }

  if (relicResult.status === "fulfilled") {
    const relic = normalizeRelicPlayers(
      relicResult.value.statGroups, relicResult.value.leaderboardStats, preferredLb,
    ) as Array<{
      profileId: number; name: string; country?: string;
      rating: number; rank: number; wins: number; losses: number;
      streak: number; highestRating: number; lastMatchDate: number;
    }>;
    for (const p of relic) {
      if (!seen.has(p.profileId)) {
        seen.add(p.profileId);
        players.push({ ...p, country: p.country || undefined, totalGames: p.wins + p.losses, clan: undefined });
      }
    }
  }

  const now = Math.floor(Date.now() / 1000);
  return players
    .map((p) => {
      const sim = nameSimilarity(query, p.name);
      const ratingScore = Math.min(p.rating / 2500, 1);
      const activityScore = p.lastMatchDate > 0
        ? Math.max(0, 1 - (now - p.lastMatchDate) / (90 * 86400))
        : 0;
      const gamesScore = Math.min(p.totalGames / 1000, 1);
      const relevance = sim * 0.45 + ratingScore * 0.2 + activityScore * 0.2 + gamesScore * 0.15;
      return { ...p, relevance: Math.round(relevance * 1000) / 1000 };
    })
    .sort((a, b) => b.relevance - a.relevance);
}
