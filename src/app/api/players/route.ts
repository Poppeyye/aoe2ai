import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, searchPlayer } from "@/lib/api/relic";
import { LEADERBOARD_IDS, type LeaderboardType } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q");
    const type = (req.nextUrl.searchParams.get("type") || "rm_1v1") as LeaderboardType;
    const leaderboardId = LEADERBOARD_IDS[type] ?? 3;

    if (query) {
      const data = await searchPlayer(query);
      return NextResponse.json({
        players: normalizeRelicPlayers(data),
      });
    }

    const data = await getLeaderboard(leaderboardId);
    return NextResponse.json({
      players: normalizeRelicPlayers(data),
    });
  } catch (error) {
    console.error("Players error:", error);
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 });
  }
}

function normalizeRelicPlayers(data: unknown): unknown[] {
  // Relic API returns nested statGroups + leaderboardStats
  // Normalize to a flat player array
  const raw = data as Record<string, unknown>;
  const statGroups = (raw.statGroups || []) as Record<string, unknown>[];
  const lbStats = (raw.leaderboardStats || []) as Record<string, unknown>[];

  if (statGroups.length === 0 && lbStats.length === 0) return [];

  return lbStats.map((lb, i) => {
    const group = statGroups[i] as Record<string, unknown> | undefined;
    const members = (group?.members || []) as Record<string, unknown>[];
    const member = members[0] || {};

    return {
      profileId: member.profile_id || lb.profile_id || 0,
      name: (member.alias as string) || `Player ${i + 1}`,
      rating: lb.rating || 0,
      rank: lb.rank || i + 1,
      wins: lb.wins || 0,
      losses: lb.losses || 0,
      streak: lb.streak || 0,
      highestRating: lb.highestrating || lb.rating || 0,
      country: (member.country as string) || undefined,
    };
  });
}
