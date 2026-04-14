import { NextRequest, NextResponse } from "next/server";
import { hasOpenAIKey } from "@/lib/ai/openai-client";
import { buildScoutReport } from "@/lib/scout/opponent";
import type { AiLocale } from "@/lib/ai/tools";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const nameParam = params.get("name");
    const profileIdParam = params.get("profileId");
    const locale = (params.get("locale") === "es" ? "es" : "en") as AiLocale;

    let profileId: number | undefined;

    if (profileIdParam) {
      profileId = parseInt(profileIdParam, 10);
      if (Number.isNaN(profileId)) {
        return NextResponse.json({ error: "Invalid profileId" }, { status: 400 });
      }
    } else {
      if (!nameParam) {
        return NextResponse.json(
          { error: "Provide either 'name' or 'profileId' query parameter" },
          { status: 400 },
        );
      }
    }

    const scoutReport = await buildScoutReport({
      profileId,
      name: nameParam || undefined,
    });

    return NextResponse.json({
      ...scoutReport,
      aiAnalysis: null,
      aiEnabled: hasOpenAIKey(),
    });
  } catch (error) {
    console.error("Opponent scout error:", error);
    return NextResponse.json(
      { error: "Failed to fetch opponent data" },
      { status: 500 },
    );
  }
}
