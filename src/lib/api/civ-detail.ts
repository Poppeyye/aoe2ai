import {
  getCivBonuses,
  resolveUnit,
  resolveTech,
  resolveBuilding,
  getAgeNames,
  type RawTechTreeData,
  type RawCivData,
  type ResolvedUnit,
  type ResolvedTech,
  type ResolvedBuilding,
} from "@/lib/api/techtree";

export interface CivDetail {
  name: string;
  displayName: string;
  description: string;
  era: string;
  bonuses: string[];
  teamBonus: string;
  uniqueUnits: ResolvedUnit[];
  uniqueTechs: ResolvedTech[];
  units: ResolvedUnit[];
  techs: ResolvedTech[];
  buildings: ResolvedBuilding[];
  disabledCounts: { units: number; techs: number; buildings: number };
  totals: { units: number; techs: number; buildings: number };
  availableUnits: number;
  availableTechs: number;
  availableBuildings: number;
}

export function civKeyToSlug(key: string): string {
  return key.toLowerCase();
}

export function findCivBySlug(
  data: RawTechTreeData,
  slug: string,
): { key: string; civ: RawCivData } | null {
  const target = slug.toLowerCase();
  for (const [key, civ] of Object.entries(data.civs)) {
    if (key.toLowerCase() === target) return { key, civ };
  }
  return null;
}

export function buildCivDetail(
  data: RawTechTreeData,
  strings: Record<string, string>,
  civName: string,
  civ: RawCivData,
): CivDetail {
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

  // Unique units/techs: only this civ or very few civs have them
  const unitCivCounts = new Map<number, number>();
  for (const c of Object.values(data.civs)) {
    for (const uid of c.Unit) {
      unitCivCounts.set(uid, (unitCivCounts.get(uid) || 0) + 1);
    }
  }
  const uniqueUnits = units.filter((u) => (unitCivCounts.get(u.id) || 0) <= 3);

  const techCivCounts = new Map<number, number>();
  for (const c of Object.values(data.civs)) {
    for (const tid of c.Tech) {
      techCivCounts.set(tid, (techCivCounts.get(tid) || 0) + 1);
    }
  }
  const uniqueTechs = techs.filter((t) => (techCivCounts.get(t.id) || 0) <= 3);

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
