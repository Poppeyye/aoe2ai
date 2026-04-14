import { NextRequest, NextResponse } from "next/server";
import { hasOpenAIKey } from "@/lib/ai/openai-client";
import { buildScoutReport } from "@/lib/scout/opponent";
import type { AiLocale } from "@/lib/ai/tools";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, resetAt } = checkRateLimit(`live:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } },
      );
    }
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
