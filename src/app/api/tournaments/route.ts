import { NextRequest, NextResponse } from "next/server";
import { getTournaments } from "@/lib/api/liquipedia";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, resetAt } = checkRateLimit(`tournaments:${ip}`, 15, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } },
      );
    }
    const tournaments = await getTournaments();
    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error("Tournaments error:", error);
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}
