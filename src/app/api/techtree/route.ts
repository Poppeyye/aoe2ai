import { NextRequest, NextResponse } from "next/server";
import {
  fetchTechTreeData, fetchStrings, getCivListLocalized, getCivBonuses,
  resolveUnit, resolveTech, resolveBuilding, getAgeNames,
  type RawTechTreeData, type RawCivData,
  type ResolvedUnit, type ResolvedTech, type ResolvedBuilding,
} from "@/lib/api/techtree";

export async function GET(req: NextRequest) {
  try {
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

function buildCivDetail(
  data: RawTechTreeData,
  strings: Record<string, string>,
  civName: string,
  civ: RawCivData,
) {
  const ageNames = getAgeNames(data, strings, civ.era);
  const { bonuses, teamBonus, description } = getCivBonuses(data, civName, strings);

  const allUnitIds = Object.keys(data.data.Unit).map(Number);
  const allTechIds = Object.keys(data.data.Tech).map(Number);
  const allBuildingIds = Object.keys(data.data.Building).map(Number);

  const civUnitSet = new Set(civ.Unit);
  const civTechSet = new Set(civ.Tech);
  const civBuildingSet = new Set(civ.Building);

  const units: ResolvedUnit[] = [];
  for (const id of civ.Unit) {
    const u = resolveUnit(id, data, strings, ageNames);
    if (u) units.push(u);
  }

  const techs: ResolvedTech[] = [];
  for (const id of civ.Tech) {
    const t = resolveTech(id, data, strings, ageNames);
    if (t) techs.push(t);
  }

  const buildings: ResolvedBuilding[] = [];
  for (const id of civ.Building) {
    const b = resolveBuilding(id, data, strings, ageNames);
    if (b) buildings.push(b);
  }

  // Unique units: units this civ has that fewer than half of civs have
  const civCount = Object.keys(data.civs).length;
  const unitCivCounts = new Map<number, number>();
  for (const c of Object.values(data.civs)) {
    for (const uid of c.Unit) {
      unitCivCounts.set(uid, (unitCivCounts.get(uid) || 0) + 1);
    }
  }
  const uniqueUnits = units.filter((u) => {
    const count = unitCivCounts.get(u.id) || 0;
    return count <= 3;
  });

  // Unique techs: techs only this civ or very few civs have
  const techCivCounts = new Map<number, number>();
  for (const c of Object.values(data.civs)) {
    for (const tid of c.Tech) {
      techCivCounts.set(tid, (techCivCounts.get(tid) || 0) + 1);
    }
  }
  const uniqueTechs = techs.filter((t) => {
    const count = techCivCounts.get(t.id) || 0;
    return count <= 3;
  });

  const disabledUnits = allUnitIds.filter((id) => !civUnitSet.has(id)).length;
  const disabledTechs = allTechIds.filter((id) => !civTechSet.has(id)).length;
  const disabledBuildings = allBuildingIds.filter((id) => !civBuildingSet.has(id)).length;

  const displayName = strings[String(civ.name_string_id)] || civName;
  return {
    name: civName,
    displayName,
    description,
    era: civ.era,
    bonuses,
    teamBonus,
    uniqueUnits,
    uniqueTechs,
    units: units.sort((a, b) => a.name.localeCompare(b.name)),
    techs: techs.sort((a, b) => a.name.localeCompare(b.name)),
    buildings: buildings.sort((a, b) => a.name.localeCompare(b.name)),
    disabledCounts: {
      units: disabledUnits,
      techs: disabledTechs,
      buildings: disabledBuildings,
    },
    totals: {
      units: allUnitIds.length,
      techs: allTechIds.length,
      buildings: allBuildingIds.length,
    },
    availableUnits: units.length,
    availableTechs: techs.length,
    availableBuildings: buildings.length,
  };
}
