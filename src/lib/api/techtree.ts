/**
 * Tech Tree data from SiegeEngineers aoe2techtree project.
 * Fetches data.json (civs + unit/tech/building stats) and strings.json (localized names).
 * Ref: https://github.com/SiegeEngineers/aoe2techtree
 */

const DATA_URL = "https://aoe2techtree.net/data/data.json";
const STRINGS_BASE = "https://aoe2techtree.net/data/locales";

let cachedData: RawTechTreeData | null = null;
const cachedStrings = new Map<string, Record<string, string>>();

export interface RawTechTreeData {
  age_names: Record<string, string[]>;
  civs: Record<string, RawCivData>;
  data: {
    Building: Record<string, RawEntityData>;
    Tech: Record<string, RawEntityData>;
    Unit: Record<string, RawEntityData>;
    unit_upgrades: Record<string, RawUpgradeData>;
  };
  tech_tree_strings: Record<string, string>;
}

export interface RawCivData {
  Building: number[];
  Tech: number[];
  Unit: number[];
  era: string;
  help_string_id: number;
  internal_name: string;
  meta: Record<string, unknown>;
  name_string_id: number;
}

export interface RawEntityData {
  ID: number;
  LanguageNameId: number;
  internal_name: string;
  HP?: number;
  Attack?: number;
  MeleeArmor?: number;
  PierceArmor?: number;
  Range?: number;
  MinRange?: number;
  LineOfSight?: number;
  Speed?: number;
  TrainTime?: number;
  ResearchTime?: number;
  Cost?: Record<string, number>;
  GarrisonCapacity?: number;
  AccuracyPercent?: number;
  ReloadTime?: number;
  Attacks?: Array<{ Amount: number; Class: number }>;
  Armours?: Array<{ Amount: number; Class: number }>;
}

export interface RawUpgradeData {
  ID: number;
  Cost: Record<string, number>;
  ResearchTime: number;
  internal_name: string;
}

// Resolved types for API responses
export interface ResolvedUnit {
  id: number;
  name: string;
  hp: number;
  attack: number;
  meleeArmor: number;
  pierceArmor: number;
  range: number;
  speed: number;
  trainTime: number;
  cost: Record<string, number>;
  age: string;
  lineOfSight: number;
  accuracy: number;
  reloadTime: number;
}

export interface ResolvedTech {
  id: number;
  name: string;
  cost: Record<string, number>;
  researchTime: number;
  age: string;
}

export interface ResolvedBuilding {
  id: number;
  name: string;
  hp: number;
  cost: Record<string, number>;
  age: string;
  garrisonCapacity: number;
}

export async function fetchTechTreeData(): Promise<RawTechTreeData> {
  if (cachedData) return cachedData;
  const res = await fetch(DATA_URL, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch tech tree data");
  cachedData = await res.json();
  return cachedData!;
}

export async function fetchStrings(locale = "en"): Promise<Record<string, string>> {
  const lang = locale === "es" ? "es" : "en";
  const cached = cachedStrings.get(lang);
  if (cached) return cached;
  const res = await fetch(`${STRINGS_BASE}/${lang}/strings.json`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Failed to fetch strings for ${lang}`);
  const data: Record<string, string> = await res.json();
  cachedStrings.set(lang, data);
  return data;
}

const NAME_OFFSETS = [9000, 10000, 0];

export function resolveName(
  entity: RawEntityData,
  strings: Record<string, string>,
): string {
  const nameId = entity.LanguageNameId;
  if (nameId) {
    for (const offset of NAME_OFFSETS) {
      const resolved = strings[String(nameId + offset)];
      if (resolved) return resolved.replace(/<br\s*\/?>\n?/gi, " ").replace(/\s+/g, " ").trim();
    }
  }
  return formatInternalName(entity.internal_name);
}

function formatInternalName(name: string): string {
  if (!name) return "Unknown";
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .replace(/^\s/, "")
    .replace(/\s?(Age\d|alt)$/, "")
    .trim();
}

export function getCivList(data: RawTechTreeData): string[] {
  return Object.keys(data.civs).sort();
}

export function getCivListLocalized(
  data: RawTechTreeData,
  strings: Record<string, string>,
): { key: string; name: string }[] {
  return Object.entries(data.civs)
    .map(([key, civ]) => ({
      key,
      name: strings[String(civ.name_string_id)] || key,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCivBonuses(
  data: RawTechTreeData,
  civName: string,
  strings: Record<string, string>,
): { bonuses: string[]; teamBonus: string; description: string } {
  const civ = data.civs[civName];
  if (!civ) return { bonuses: [], teamBonus: "", description: "" };

  const helpStr = strings[String(civ.help_string_id)] || "";
  const lines = helpStr
    .replace(/<br\s*\/?>/gi, "\n")
    .split("\n")
    .map((l) => l.replace(/<\/?[^>]+>/g, "").trim())
    .filter(Boolean);

  const bonuses: string[] = [];
  let teamBonus = "";
  let description = "";
  let section: "desc" | "bonuses" | "unique" | "team" = "desc";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("team bonus") || lower.includes("bonificación de equipo")) {
      section = "team";
      const after = line
        .replace(/.*[Tt]eam [Bb]onus:?\s*/i, "")
        .replace(/.*[Bb]onificación de equipo:?\s*/i, "")
        .trim();
      if (after) teamBonus = after;
      continue;
    }
    if (lower.includes("unique unit") || lower.includes("unique tech") ||
        lower.includes("unidad única") || lower.includes("tecnología") && lower.includes("única")) {
      section = "unique";
      continue;
    }
    const bullet = line.match(/^[•\-]\s*(.*)/);
    if (bullet) {
      const text = bullet[1].trim();
      if (section === "team") {
        teamBonus = teamBonus ? teamBonus + " " + text : text;
      } else if (section === "desc" || section === "bonuses") {
        section = "bonuses";
        bonuses.push(text);
      }
      continue;
    }
    if (section === "team" && !teamBonus) {
      teamBonus = line;
    } else if (section === "desc" && !description) {
      description = line;
    }
  }

  return { bonuses, teamBonus: teamBonus.trim(), description };
}

export function resolveUnit(
  id: number,
  data: RawTechTreeData,
  strings: Record<string, string>,
  ageNames: string[],
): ResolvedUnit | null {
  const raw = data.data.Unit[String(id)];
  if (!raw) return null;
  const age = guessAge(raw, data, ageNames);
  return {
    id,
    name: resolveName(raw, strings),
    hp: raw.HP || 0,
    attack: raw.Attack || 0,
    meleeArmor: raw.MeleeArmor || 0,
    pierceArmor: raw.PierceArmor || 0,
    range: raw.Range || 0,
    speed: raw.Speed || 0,
    trainTime: raw.TrainTime || 0,
    cost: raw.Cost || {},
    age,
    lineOfSight: raw.LineOfSight || 0,
    accuracy: raw.AccuracyPercent || 0,
    reloadTime: raw.ReloadTime || 0,
  };
}

export function resolveTech(
  id: number,
  data: RawTechTreeData,
  strings: Record<string, string>,
  ageNames: string[],
): ResolvedTech | null {
  const raw = data.data.Tech[String(id)];
  if (!raw) return null;
  const age = guessAge(raw, data, ageNames);
  return {
    id,
    name: resolveName(raw, strings),
    cost: raw.Cost || {},
    researchTime: raw.ResearchTime || 0,
    age,
  };
}

export function resolveBuilding(
  id: number,
  data: RawTechTreeData,
  strings: Record<string, string>,
  ageNames: string[],
): ResolvedBuilding | null {
  const raw = data.data.Building[String(id)];
  if (!raw) return null;
  const age = guessAge(raw, data, ageNames);
  return {
    id,
    name: resolveName(raw, strings),
    hp: raw.HP || 0,
    cost: raw.Cost || {},
    age,
    garrisonCapacity: raw.GarrisonCapacity || 0,
  };
}

function guessAge(
  _entity: RawEntityData,
  _data: RawTechTreeData,
  ageNames: string[],
): string {
  // Age is not directly stored per entity in the new data format.
  // We use a heuristic: cheap/low-hp = earlier age.
  // For a more accurate tree, the full tech tree graph would be needed.
  // For now, return a reasonable default.
  return ageNames[0] || "Unknown";
}

export function getAgeNames(
  data: RawTechTreeData,
  strings: Record<string, string>,
  era = "base",
): string[] {
  const ids = data.age_names?.[era] || data.age_names?.["base"] || [];
  return ids.map((id) => strings[String(id)] || `Age ${id}`);
}
