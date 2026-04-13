import { NextRequest, NextResponse } from "next/server";
import { getTechTreeData, getCivList, getCivData } from "@/lib/api/techtree";

export async function GET(req: NextRequest) {
  try {
    const data = await getTechTreeData();
    const civName = req.nextUrl.searchParams.get("civ");

    if (civName) {
      const civ = getCivData(data, civName);
      if (!civ) {
        return NextResponse.json({ error: "Civilization not found" }, { status: 404 });
      }

      const strings = data.strings?.["en"] ?? {};

      return NextResponse.json({
        name: civName,
        expansion: "",
        bonuses: civ.civBonuses || [],
        uniqueUnits: (civ.uniqueUnits || []).map(
          (id) => strings[String(id)] || `Unit ${id}`
        ),
        uniqueTechs: (civ.uniqueTechs || []).map(
          (id) => strings[String(id)] || `Tech ${id}`
        ),
        teamBonus: civ.teamBonus || "",
      });
    }

    return NextResponse.json({ civs: getCivList(data) });
  } catch (error) {
    console.error("Tech tree error:", error);
    return NextResponse.json({ error: "Failed to fetch tech tree data" }, { status: 500 });
  }
}
