import { NextRequest, NextResponse } from "next/server";
import { fetchTechTreeData, fetchStrings, getCivListLocalized } from "@/lib/api/techtree";
import { buildCivDetail } from "@/lib/api/civ-detail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, resetAt } = checkRateLimit(`techtree:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } },
      );
    }
    const locale = req.nextUrl.searchParams.get("locale") || "en";
    const [data, strings] = await Promise.all([fetchTechTreeData(), fetchStrings(locale)]);
    const civName = req.nextUrl.searchParams.get("civ");
    const compareCivs = req.nextUrl.searchParams.get("compare");

    if (compareCivs) {
      const [c1, c2] = compareCivs.split(",").map((s) => s.trim());
      const civ1 = data.civs[c1];
      const civ2 = data.civs[c2];
      if (!civ1 || !civ2) {
        return NextResponse.json({ error: "One or both civilizations not found" }, { status: 404 });
      }
      return NextResponse.json({
        civ1: buildCivDetail(data, strings, c1, civ1),
        civ2: buildCivDetail(data, strings, c2, civ2),
      });
    }

    if (civName) {
      const civ = data.civs[civName];
      if (!civ) {
        return NextResponse.json({ error: "Civilization not found" }, { status: 404 });
      }
      return NextResponse.json(buildCivDetail(data, strings, civName, civ));
    }

    return NextResponse.json({ civs: getCivListLocalized(data, strings) });
  } catch (error) {
    console.error("Tech tree error:", error);
    return NextResponse.json({ error: "Failed to fetch tech tree data" }, { status: 500 });
  }
}
