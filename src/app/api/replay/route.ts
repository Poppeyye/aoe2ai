import { NextRequest, NextResponse } from "next/server";
import { parseReplay } from "@/lib/replay/parser";
import { analyzeReplay } from "@/lib/ai/replay-analyzer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("replay") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No replay file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".aoe2record")) {
      return NextResponse.json({ error: "Invalid file type. Expected .aoe2record" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const replayData = await parseReplay(buffer);
    const analysis = await analyzeReplay(replayData);

    return NextResponse.json({
      chronicle: analysis.chronicle,
      map: replayData.map.name,
      duration: replayData.duration,
      players: replayData.players.map((p) => ({
        name: p.name,
        civ: p.civ,
        winner: p.winner,
        rating: p.rating,
        feudalTime: p.feudalTime,
        castleTime: p.castleTime,
        imperialTime: p.imperialTime,
      })),
      battles: replayData.battles,
      timeline: replayData.timeline,
    });
  } catch (error) {
    console.error("Replay error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze replay" },
      { status: 500 }
    );
  }
}
