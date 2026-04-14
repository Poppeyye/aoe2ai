import { NextRequest, NextResponse } from "next/server";
import { parseReplay } from "@/lib/replay/parser";
import type { PlayerStats } from "@/lib/replay/parser";
import { analyzeReplay, buildReplayAiContext } from "@/lib/ai/replay-analyzer";
import { hasOpenAIKey } from "@/lib/ai/openai-client";
import type { AiLocale } from "@/lib/ai/tools";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, resetAt } = checkRateLimit(`replay:${ip}`, MAX_REQUESTS, WINDOW_MS);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } },
      );
    }
    const locale = (req.nextUrl.searchParams.get("locale") === "es" ? "es" : "en") as AiLocale;
    const formData = await req.formData();
    const file = formData.get("replay") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No replay file provided" }, { status: 400 });
    }
    if (!file.name.endsWith(".aoe2record")) {
      return NextResponse.json({ error: "Invalid file type. Expected .aoe2record" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const data = await parseReplay(buffer);
    const extra = data as unknown as Record<string, unknown>;

    // Extract age-up timings from chat messages BEFORE analysis
    const chats = (extra.chats || []) as Array<{ timeSec: number; player: number; message: string }>;
    const ageUps: Array<{ time: number; playerId: number; type: string; description: string }> = [];
    const playerChats: typeof chats = [];

    for (const c of chats) {
      const feudalMatch = c.message.match(/player_id,(\d+),\d+> advanced to the Feudal Age/);
      const castleMatch = c.message.match(/player_id,(\d+),\d+> advanced to the Castle Age/);
      const impMatch = c.message.match(/player_id,(\d+),\d+> advanced to the Imperial Age/);
      if (feudalMatch) {
        const pid = parseInt(feudalMatch[1]);
        const p = data.players.find((pl) => pl.index === pid);
        ageUps.push({ time: c.timeSec, playerId: pid, type: "age_up", description: `${p?.name || `Player ${pid}`} advanced to Feudal Age` });
        if (p) p.feudalTime = c.timeSec;
      } else if (castleMatch) {
        const pid = parseInt(castleMatch[1]);
        const p = data.players.find((pl) => pl.index === pid);
        ageUps.push({ time: c.timeSec, playerId: pid, type: "age_up", description: `${p?.name || `Player ${pid}`} advanced to Castle Age` });
        if (p) p.castleTime = c.timeSec;
      } else if (impMatch) {
        const pid = parseInt(impMatch[1]);
        const p = data.players.find((pl) => pl.index === pid);
        ageUps.push({ time: c.timeSec, playerId: pid, type: "age_up", description: `${p?.name || `Player ${pid}`} advanced to Imperial Age` });
        if (p) p.imperialTime = c.timeSec;
      } else if (!c.message.startsWith("<")) {
        playerChats.push(c);
      }
    }

    const timeline = [...ageUps, ...data.timeline].sort((a, b) => a.time - b.time);

    const aiEnabled = hasOpenAIKey();
    const analysis = aiEnabled
      ? { chronicle: "", aiContext: buildReplayAiContext(data, extra), raw: data }
      : await analyzeReplay(data, locale);
    const playerStats = (extra.playerStats || {}) as Record<number, PlayerStats>;

    return NextResponse.json({
      chronicle: analysis.chronicle,
      aiContext: analysis.aiContext,
      aiEnabled,
      version: data.version,
      map: data.map.name,
      mapSize: data.map.size,
      duration: data.duration,
      players: data.players.map((p) => ({
        name: p.name,
        civ: p.civ,
        civId: p.civId,
        color: p.color,
        winner: p.winner,
        feudalTime: p.feudalTime,
        castleTime: p.castleTime,
        imperialTime: p.imperialTime,
      })),
      battles: data.battles,
      timeline,
      chats: playerChats,
      gameSettings: extra.gameSettings || {},
      actionCounts: extra.actionCounts || {},
      heatmapData: extra.heatmapData || [],
      militaryEvents: extra.militaryEvents || [],
      playerStats,
    });
  } catch (error) {
    console.error("Replay error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze replay" },
      { status: 500 }
    );
  }
}
