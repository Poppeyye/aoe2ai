import { NextRequest, NextResponse } from "next/server";
import { getPlayerStats, getMatchHistory } from "@/lib/api/relic";

export async function GET(req: NextRequest) {
  try {
    const profileId = req.nextUrl.searchParams.get("profileId");
    if (!profileId) {
      return NextResponse.json({ error: "profileId required" }, { status: 400 });
    }

    const pid = parseInt(profileId, 10);
    if (isNaN(pid)) {
      return NextResponse.json({ error: "Invalid profileId" }, { status: 400 });
    }

    const [stats, history] = await Promise.all([
      getPlayerStats(pid),
      getMatchHistory(pid),
    ]);

    // Extract current game if available from recent match history
    const raw = history as unknown as Record<string, unknown>;
    const matches = (raw.matchHistoryStats || []) as Record<string, unknown>[];

    if (matches.length === 0) {
      return NextResponse.json({
        player: extractPlayerFromStats(stats, pid),
        opponent: null,
        analysis: "No active game found. Start a ranked match and check back.",
        tips: [],
      });
    }

    const lastMatch = matches[0] as Record<string, unknown>;
    const matchMembers = (lastMatch.matchhistorymember || []) as Record<string, unknown>[];

    const playerEntry = matchMembers.find((m) => m.profile_id === pid);
    const opponentEntry = matchMembers.find((m) => m.profile_id !== pid);

    return NextResponse.json({
      player: {
        name: "You",
        rating: playerEntry?.oldrating || 0,
        civ: `Civ ${playerEntry?.race_id || "?"}`,
        wins: 0,
        losses: 0,
      },
      opponent: opponentEntry
        ? {
            name: `Opponent (${opponentEntry.profile_id})`,
            rating: opponentEntry.oldrating || 0,
            civ: `Civ ${opponentEntry.race_id || "?"}`,
            wins: 0,
            losses: 0,
          }
        : null,
      analysis: "Matchup analysis based on recent match data.",
      tips: [
        "Check your opponent's recent civ picks for patterns",
        "Adapt your strategy to the map pool",
      ],
    });
  } catch (error) {
    console.error("Live tracker error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live data" },
      { status: 500 }
    );
  }
}

function extractPlayerFromStats(data: unknown, _pid: number) {
  return {
    name: "Player",
    rating: 0,
    civ: "Unknown",
    wins: 0,
    losses: 0,
  };
}
