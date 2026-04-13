/**
 * AoE2 AI Agent powered by OpenAI Responses API.
 * Provides an AoE2-specialized assistant with tool access to:
 * - Civ matchup analysis
 * - Unit counter lookup
 * - Build order suggestions
 * - Player stats lookup
 * - Real-time game data
 */

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are the Definitive AoE2 Agent — an expert AI assistant for Age of Empires II: Definitive Edition.

You have deep knowledge of:
- All 45+ civilizations, their bonuses, unique units, and unique technologies
- Unit counters and composition strategies
- Build orders for all major map types (Arabia, Arena, Islands, etc.)
- Meta strategies at different ELO ranges
- Map-specific tactics and timings
- Economy management and villager distribution

When answering:
1. Be specific with numbers (e.g., "Franks get +20% HP on cavalry" not "Franks have good cavalry")
2. Reference specific ages and timings when discussing build orders
3. Consider the ELO context — advice for 800 ELO differs from 1600 ELO
4. When discussing matchups, cover early, mid, and late game
5. Use game terminology naturally (TC, boom, flush, drush, FC, etc.)

You have access to tools that let you look up real-time data. Use them when the user asks about specific players, current leaderboards, or live game data.

Respond in the same language the user writes in (Spanish or English).`;

function tool(name: string, description: string, parameters: Record<string, unknown>): OpenAI.Responses.Tool {
  return {
    type: "function" as const,
    name,
    description,
    parameters,
    strict: false,
  };
}

export const AGENT_TOOLS: OpenAI.Responses.Tool[] = [
  tool("lookup_civ_matchup", "Get detailed information about a civilization matchup, including win rates, key strategies, and counter units.", {
    type: "object",
    properties: {
      civ1: { type: "string", description: "First civilization name" },
      civ2: { type: "string", description: "Second civilization name" },
      map: { type: "string", description: "Map name (optional)" },
      elo_range: { type: "string", description: "ELO range like '1000-1200' (optional)" },
    },
    required: ["civ1", "civ2"],
  }),
  tool("lookup_unit_counters", "Find the best counter units and strategies against a specific unit or unit composition.", {
    type: "object",
    properties: {
      unit: { type: "string", description: "The unit to find counters for" },
      player_civ: { type: "string", description: "Player's civilization (optional)" },
    },
    required: ["unit"],
  }),
  tool("get_build_order", "Get a specific build order with step-by-step instructions.", {
    type: "object",
    properties: {
      strategy: { type: "string", description: "Strategy name (e.g., 'scout rush', 'fast castle', 'drush FC')" },
      civ: { type: "string", description: "Civilization (optional)" },
      map: { type: "string", description: "Map (optional)" },
    },
    required: ["strategy"],
  }),
  tool("lookup_player", "Look up a player's stats, rating, and recent matches from the official leaderboard.", {
    type: "object",
    properties: {
      query: { type: "string", description: "Player name or profile ID" },
    },
    required: ["query"],
  }),
  tool("get_civ_info", "Get detailed information about a specific civilization including bonuses, unique units, and tech tree.", {
    type: "object",
    properties: {
      civ: { type: "string", description: "Civilization name" },
    },
    required: ["civ"],
  }),
];

export interface AgentStreamEvent {
  type: "text" | "tool_call" | "tool_result" | "done" | "error";
  content: string;
  toolName?: string;
}

export async function* runAgent(
  messages: { role: "user" | "assistant"; content: string }[]
): AsyncGenerator<AgentStreamEvent> {
  if (!process.env.OPENAI_API_KEY) {
    yield { type: "error", content: "OpenAI API key not configured. Add OPENAI_API_KEY to .env" };
    return;
  }

  try {
    const input: OpenAI.Responses.ResponseInputItem[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await openai.responses.create({
      model: "gpt-4o",
      instructions: SYSTEM_PROMPT,
      input,
      tools: AGENT_TOOLS,
      stream: true,
    });

    for await (const event of response) {
      if (event.type === "response.output_text.delta") {
        yield { type: "text", content: event.delta };
      } else if (event.type === "response.function_call_arguments.done") {
        const ev = event as unknown as { arguments: string; name: string };
        yield {
          type: "tool_call",
          content: ev.arguments,
          toolName: ev.name,
        };

        const toolResult = await executeToolCall(ev.name, JSON.parse(ev.arguments));
        yield {
          type: "tool_result",
          content: toolResult,
          toolName: ev.name,
        };
      } else if (event.type === "response.completed") {
        yield { type: "done", content: "" };
      }
    }
  } catch (error) {
    yield {
      type: "error",
      content: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function executeToolCall(name: string, args: Record<string, string>): Promise<string> {
  switch (name) {
    case "lookup_civ_matchup":
      return executeCivMatchup(args.civ1, args.civ2, args.map);
    case "lookup_unit_counters":
      return executeUnitCounters(args.unit, args.player_civ);
    case "get_build_order":
      return executeBuildOrder(args.strategy, args.civ, args.map);
    case "lookup_player":
      return executePlayerLookup(args.query);
    case "get_civ_info":
      return executeCivInfo(args.civ);
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

async function executeCivMatchup(civ1: string, civ2: string, map?: string): Promise<string> {
  // In production this would fetch from a matchup database or compute from replay data
  return JSON.stringify({
    civ1,
    civ2,
    map: map || "Arabia",
    note: "Matchup data computed from game knowledge. For statistical win rates, replay database integration is needed.",
  });
}

async function executeUnitCounters(unit: string, playerCiv?: string): Promise<string> {
  return JSON.stringify({
    unit,
    playerCiv,
    note: "Counter data from game knowledge base.",
  });
}

async function executeBuildOrder(strategy: string, civ?: string, map?: string): Promise<string> {
  return JSON.stringify({ strategy, civ, map });
}

async function executePlayerLookup(query: string): Promise<string> {
  try {
    const { searchPlayer } = await import("@/lib/api/relic");
    const data = await searchPlayer(query);
    return JSON.stringify(data);
  } catch (e) {
    return JSON.stringify({ error: "Failed to lookup player", details: String(e) });
  }
}

async function executeCivInfo(civ: string): Promise<string> {
  try {
    const { getTechTreeData, getCivData } = await import("@/lib/api/techtree");
    const data = await getTechTreeData();
    const civData = getCivData(data, civ);
    return JSON.stringify(civData || { error: `Civ "${civ}" not found` });
  } catch (e) {
    return JSON.stringify({ error: "Failed to get civ info", details: String(e) });
  }
}
