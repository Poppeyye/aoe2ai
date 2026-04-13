/**
 * Tech Tree data from SiegeEngineers aoe2techtree project.
 * Fetches the master data.json which contains all civs, units, techs, buildings.
 * Ref: https://github.com/SiegeEngineers/aoe2techtree
 */

const TECHTREE_DATA_URL = "https://aoe2techtree.net/data/data.json";

let cachedData: TechTreeData | null = null;

export interface TechTreeData {
  data: {
    civilizations: Record<string, CivData>;
    units: Record<string, UnitData>;
    techs: Record<string, TechData>;
    buildings: Record<string, BuildingData>;
  };
  strings: Record<string, Record<string, string>>;
}

export interface CivData {
  name: string;
  gameplayHelpStringId: number;
  uniqueUnits: number[];
  uniqueTechs: number[];
  teamBonus: string;
  civBonuses: string[];
  disables: {
    units: number[];
    techs: number[];
    buildings: number[];
  };
}

export interface UnitData {
  id: number;
  name: string;
  cost: { Food?: number; Wood?: number; Gold?: number; Stone?: number };
  HP: number;
  Attack: number;
  MeleeArmor: number;
  PierceArmor: number;
  Range?: number;
  LineOfSight: number;
  Speed: number;
  TrainTime: number;
  Age: number;
}

export interface TechData {
  id: number;
  name: string;
  cost: { Food?: number; Wood?: number; Gold?: number; Stone?: number };
  ResearchTime: number;
  Age: number;
}

export interface BuildingData {
  id: number;
  name: string;
  cost: { Food?: number; Wood?: number; Gold?: number; Stone?: number };
  HP: number;
  Age: number;
}

export async function getTechTreeData(): Promise<TechTreeData> {
  if (cachedData) return cachedData;

  const res = await fetch(TECHTREE_DATA_URL, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch tech tree data");
  cachedData = await res.json();
  return cachedData!;
}

export function getCivList(data: TechTreeData): string[] {
  return Object.keys(data.data?.civilizations ?? {}).sort();
}

export function getCivData(data: TechTreeData, civName: string): CivData | undefined {
  return data.data?.civilizations?.[civName];
}
