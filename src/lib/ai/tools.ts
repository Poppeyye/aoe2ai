import OpenAI from "openai";
import { getTournaments } from "@/lib/api/liquipedia";
import {
  fetchStrings,
  fetchTechTreeData,
  getAgeNames,
  getCivBonuses,
  resolveTech,
  resolveUnit,
  type RawCivData,
  type RawTechTreeData,
} from "@/lib/api/techtree";
import { buildScoutReport } from "@/lib/scout/opponent";
import { searchPlayerCompanion } from "@/lib/api/relic";

export type AiLocale = "en" | "es";
export type AiSurface = "agent" | "live" | "replay";
export type AiToolName =
  | "lookup_player_profiles"
  | "scout_opponent"
  | "get_civilization_details"
  | "compare_civilizations"
  | "list_tournaments";

interface ToolContext {
  locale: AiLocale;
}

interface RegisteredTool {
  definition: OpenAI.Responses.Tool;
  execute: (args: Record<string, unknown>, context: ToolContext) => Promise<string>;
}

function defineTool(
  name: AiToolName,
  description: string,
  parameters: Record<string, unknown>,
  execute: RegisteredTool["execute"],
): RegisteredTool {
  return {
    definition: {
      type: "function",
      name,
      description,
      parameters,
      strict: false,
    },
    execute,
  };
}

function normalizeLocale(locale: string): AiLocale {
  return locale === "es" ? "es" : "en";
}

function normalizeCivInput(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveCivKey(data: RawTechTreeData, strings: Record<string, string>, value: string) {
  const target = normalizeCivInput(value);

  for (const [key, civ] of Object.entries(data.civs)) {
    const localizedName = strings[String(civ.name_string_id)] || key;
    if (normalizeCivInput(key) === target || normalizeCivInput(localizedName) === target) {
      return key;
    }
  }

  return null;
}

function buildCivSummary(
  data: RawTechTreeData,
  strings: Record<string, string>,
  civKey: string,
  civ: RawCivData,
) {
  const ageNames = getAgeNames(data, strings, civ.era);
  const { bonuses, teamBonus, description } = getCivBonuses(data, civKey, strings);
  const displayName = strings[String(civ.name_string_id)] || civKey;

  const uniqueUnits = civ.Unit
    .slice(0, 8)
    .map((id) => resolveUnit(id, data, strings, ageNames))
    .filter(Boolean)
    .slice(0, 4)
    .map((unit) => ({
      name: unit!.name,
      attack: unit!.attack,
      range: unit!.range,
      speed: unit!.speed,
      armor: {
        melee: unit!.meleeArmor,
        pierce: unit!.pierceArmor,
      },
    }));

  const uniqueTechs = civ.Tech
    .slice(0, 8)
    .map((id) => resolveTech(id, data, strings, ageNames))
    .filter(Boolean)
    .slice(0, 4)
    .map((tech) => ({
      name: tech!.name,
      cost: tech!.cost,
      researchTime: tech!.researchTime,
    }));

  return {
    key: civKey,
    name: displayName,
    description,
    bonuses,
    teamBonus,
    uniqueUnits,
    uniqueTechs,
    availability: {
      units: civ.Unit.length,
      techs: civ.Tech.length,
      buildings: civ.Building.length,
    },
  };
}

const tools: Record<AiToolName, RegisteredTool> = {
  lookup_player_profiles: defineTool(
    "lookup_player_profiles",
    "Search Age of Empires II player profiles by name and return the most relevant ladder matches with profile IDs, ratings, and records.",
    {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Player name or partial player name to search for.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    async (args) => {
      const query = String(args.query || "").trim();
      if (!query) return JSON.stringify({ error: "query is required" });

      const data = await searchPlayerCompanion(query);
      return JSON.stringify({
        query,
        profiles: (data.profiles || []).slice(0, 5).map((profile) => ({
          profileId: profile.profileId,
          name: profile.name,
          country: profile.country,
          clan: profile.clan,
        })),
      });
    },
  ),
  scout_opponent: defineTool(
    "scout_opponent",
    "Fetch ranked 1v1 scouting data for an opponent, including profile, civ tendencies, map tendencies, recent form, and recommended counter civilizations.",
    {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Opponent identifier. It can be either a profile ID like 123456 or a player name like TheViper.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    async (args) => {
      const query = String(args.query || "").trim();
      if (!query) {
        return JSON.stringify({ error: "query is required" });
      }

      const numeric = Number(query);
      const profileId = Number.isFinite(numeric) && /^\d+$/.test(query) ? numeric : undefined;
      const name = profileId ? undefined : query;

      const report = await buildScoutReport({ profileId, name });
      return JSON.stringify(report);
    },
  ),
  get_civilization_details: defineTool(
    "get_civilization_details",
    "Return authoritative civilization data from the AoE2 tech tree: bonuses, team bonus, unique units, unique techs, and overall availability.",
    {
      type: "object",
      properties: {
        civ: {
          type: "string",
          description: "Civilization name, for example Franks, Mayans, Bizantinos, or Britons.",
        },
      },
      required: ["civ"],
      additionalProperties: false,
    },
    async (args, context) => {
      const civInput = String(args.civ || "").trim();
      if (!civInput) return JSON.stringify({ error: "civ is required" });

      const locale = normalizeLocale(context.locale);
      const [data, strings] = await Promise.all([fetchTechTreeData(), fetchStrings(locale)]);
      const civKey = resolveCivKey(data, strings, civInput);
      if (!civKey) return JSON.stringify({ error: `Civilization "${civInput}" not found` });

      return JSON.stringify(buildCivSummary(data, strings, civKey, data.civs[civKey]));
    },
  ),
  compare_civilizations: defineTool(
    "compare_civilizations",
    "Compare two civilizations using authoritative tech tree data, including bonuses, unique options, and availability breadth.",
    {
      type: "object",
      properties: {
        civ1: { type: "string", description: "First civilization name." },
        civ2: { type: "string", description: "Second civilization name." },
      },
      required: ["civ1", "civ2"],
      additionalProperties: false,
    },
    async (args, context) => {
      const civ1Input = String(args.civ1 || "").trim();
      const civ2Input = String(args.civ2 || "").trim();
      if (!civ1Input || !civ2Input) {
        return JSON.stringify({ error: "civ1 and civ2 are required" });
      }

      const locale = normalizeLocale(context.locale);
      const [data, strings] = await Promise.all([fetchTechTreeData(), fetchStrings(locale)]);
      const civ1Key = resolveCivKey(data, strings, civ1Input);
      const civ2Key = resolveCivKey(data, strings, civ2Input);
      if (!civ1Key || !civ2Key) {
        return JSON.stringify({ error: "One or both civilizations were not found" });
      }

      return JSON.stringify({
        civ1: buildCivSummary(data, strings, civ1Key, data.civs[civ1Key]),
        civ2: buildCivSummary(data, strings, civ2Key, data.civs[civ2Key]),
      });
    },
  ),
  list_tournaments: defineTool(
    "list_tournaments",
    "List important AoE2 tournaments with names, tiers, dates, status, prize pools, and Liquipedia URLs.",
    {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["upcoming", "ongoing", "completed", "all"],
          description: "Optional tournament status filter.",
        },
      },
      required: ["status"],
      additionalProperties: false,
    },
    async (args) => {
      const status = typeof args.status === "string" ? args.status : "all";
      const tournaments = await getTournaments();
      return JSON.stringify({
        status,
        tournaments: tournaments
          .filter((item) => status === "all" || item.status === status)
          .slice(0, 12),
      });
    },
  ),
};

const toolSets: Record<AiSurface, AiToolName[]> = {
  agent: [
    "lookup_player_profiles",
    "scout_opponent",
    "get_civilization_details",
    "compare_civilizations",
    "list_tournaments",
  ],
  live: [
    "scout_opponent",
    "get_civilization_details",
    "compare_civilizations",
  ],
  replay: [
    "get_civilization_details",
    "compare_civilizations",
  ],
};

const WEB_SEARCH_SURFACES = new Set<AiSurface>(["agent"]);

export function getToolDefinitions(surface: AiSurface): OpenAI.Responses.Tool[] {
  const defs: OpenAI.Responses.Tool[] = toolSets[surface].map((name) => tools[name].definition);
  if (WEB_SEARCH_SURFACES.has(surface)) {
    defs.push({ type: "web_search_preview" } as any);
  }
  return defs;
}

export function getAllowedTools(surface: AiSurface) {
  const allowed: Array<{ type: string; name?: string }> = toolSets[surface].map((name) => ({
    type: "function" as const,
    name,
  }));
  if (WEB_SEARCH_SURFACES.has(surface)) {
    allowed.push({ type: "web_search_preview" });
  }
  return allowed;
}

export function surfaceHasWebSearch(surface: AiSurface) {
  return WEB_SEARCH_SURFACES.has(surface);
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolContext,
) {
  const tool = tools[name as AiToolName];
  if (!tool) {
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }

  try {
    return await tool.execute(args, context);
  } catch (error) {
    return JSON.stringify({
      error: `Tool ${name} failed`,
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
