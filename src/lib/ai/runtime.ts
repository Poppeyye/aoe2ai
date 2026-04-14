import { DEFAULT_AI_MODEL, getOpenAIClient, hasOpenAIKey } from "@/lib/ai/openai-client";
import { executeTool, getAllowedTools, getToolDefinitions, surfaceHasWebSearch, type AiLocale, type AiSurface } from "@/lib/ai/tools";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GenerateTextOptions {
  surface: AiSurface;
  locale: AiLocale;
  messages: ChatMessage[];
  context?: unknown;
  model?: string;
}

export interface AssistantStreamEvent {
  type: "text_delta" | "tool_call" | "tool_result" | "done" | "error";
  text?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  output?: string;
  error?: string;
  annotations?: Array<{ type: string; url?: string; title?: string; start_index?: number; end_index?: number }>;
}

const MAX_TOOL_ROUNDS = 6;

function getLocaleInstruction(locale: AiLocale) {
  return locale === "es"
    ? "IDIOMA: Responde SIEMPRE en español. Mantén términos AoE2 estándar en inglés cuando suenen natural (drush, uptime, fast castle, crossbow timing, flush, boom, push, etc.)."
    : "LANGUAGE: Always respond in English. Keep standard AoE2 terminology natural.";
}

function getFormattingRules() {
  return `FORMATTING — follow these rules strictly:
- Use markdown for structure: **bold** for key terms, headings for sections.
- Use emojis sparingly but consistently to improve scanning:
  ⚔️ for matchups/combat, 🏰 for strategies/builds, 🛡️ for defense/counters, 🎯 for tips/recommendations, 📊 for stats/data, 🗺️ for maps, 👑 for winners/top picks, ⏱️ for timings, 💡 for insights, 🔍 for analysis, ⚠️ for warnings/risks, ✅ for advantages, ❌ for disadvantages.
- Start your response with a short bold statement or emoji-prefixed summary line — never jump straight into headers.
- Use ### for sub-sections, not ## (keep it visually lightweight).
- Keep bullet points concise (1-2 lines max). Avoid walls of text.
- When comparing two options, use a clear side-by-side structure or two ### sub-sections.
- End with a 🎯 actionable takeaway or follow-up question when it adds value.
- If you cite web sources, include inline links in markdown: [text](url).
- NEVER dump raw JSON. Always synthesize data into readable prose or clean bullets.
- Avoid repeating yourself. Be direct, precise, and confident.`;
}

function getSurfaceInstruction(surface: AiSurface) {
  switch (surface) {
    case "live":
      return `You are an elite AoE2 ranked coach analyzing an opponent's profile before a match.
Treat the provided scout context as ground truth for all player-specific claims.
Focus on: exploitable habits, civ tendencies, timing windows, map-specific weaknesses, and a concrete counter-strategy.
Be practical and direct — the user needs actionable advice they can apply in the next 30 seconds before queueing.`;
    case "replay":
      return `You are an expert AoE2 replay analyst and caster.
Treat the provided replay context as ground truth for match facts, timestamps, compositions, and outcomes.
Write like a sports analyst reviewing tape: explain WHY moments mattered, highlight decision-making errors and brilliant plays, and suggest concrete improvements.
Never invent events not supported by the replay context.`;
    case "agent":
    default:
      return `You are the definitive AoE2 assistant — the best source of Age of Empires II: Definitive Edition knowledge.
You can answer questions about civilizations, matchups, unit compositions, strategies, build orders, tech trees, player stats, and tournaments.
Use tools when the user asks for player-specific data, tournaments, or authoritative tech-tree details.
Use web search when the user asks about recent patches, meta changes, tournament results, or anything that benefits from up-to-date information.
For pure gameplay knowledge, answer directly from your deep AoE2 expertise.
Adapt every recommendation to the specific map, civ, ELO range, and game phase whenever possible.`;
  }
}

function buildInstructions(surface: AiSurface, locale: AiLocale) {
  return [
    getSurfaceInstruction(surface),
    getLocaleInstruction(locale),
    getFormattingRules(),
  ].join("\n\n");
}

function buildInitialInput(messages: ChatMessage[], context?: unknown) {
  const input: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (context && typeof context === "object" && Object.keys(context as Record<string, unknown>).length > 0) {
    input.push({
      role: "user",
      content: [
        "Authoritative structured context for this conversation:",
        "```json",
        JSON.stringify(context, null, 2),
        "```",
        "Use it whenever the user asks about the current page or current analysis.",
      ].join("\n"),
    });
  }

  for (const message of messages) {
    input.push({
      role: message.role,
      content: message.content,
    });
  }

  return input;
}

function extractTextFromResponse(response: any): string {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  const chunks: string[] = [];
  for (const item of response.output || []) {
    if (item.type !== "message") continue;
    for (const part of item.content || []) {
      if (part.type === "output_text" && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("").trim();
}

function getFunctionCalls(response: any) {
  return (response.output || []).filter((item: any) => item.type === "function_call");
}

function buildRequestConfig(
  surface: AiSurface,
  locale: AiLocale,
  messages: ChatMessage[],
  context?: unknown,
  model?: string,
) {
  const tools = getToolDefinitions(surface);

  return {
    model: model || DEFAULT_AI_MODEL,
    instructions: buildInstructions(surface, locale),
    input: buildInitialInput(messages, context),
    tools,
  };
}

function extractResponseIdFromEvent(event: any) {
  return event?.response?.id || event?.response_id || event?.id || null;
}

function collectFunctionCallFromEvent(event: any, items: Map<string, any>) {
  if (event?.type === "response.output_item.done" && event.item?.type === "function_call") {
    const key = event.item.call_id || event.item.id || `${event.item.name}:${items.size}`;
    items.set(key, event.item);
    return;
  }

  if (event?.type === "response.function_call_arguments.done" && event.call_id && event.name) {
    const key = event.call_id || event.item_id || `${event.name}:${items.size}`;
    items.set(key, {
      type: "function_call",
      call_id: event.call_id,
      name: event.name,
      arguments: event.arguments,
    });
  }
}

export async function generateTextResponse({
  surface,
  locale,
  messages,
  context,
  model = DEFAULT_AI_MODEL,
}: GenerateTextOptions) {
  if (!hasOpenAIKey()) {
    throw new Error("OpenAI API key not configured. Add OPENAI_API_KEY to .env");
  }

  const client = getOpenAIClient();
  const config = buildRequestConfig(surface, locale, messages, context, model);

  let response = await client.responses.create({
    model: config.model,
    instructions: config.instructions,
    input: config.input,
    tools: config.tools,
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const functionCalls = getFunctionCalls(response);
    if (functionCalls.length === 0) {
      const text = extractTextFromResponse(response);
      if (text) return text;
      throw new Error("The model did not return any text output.");
    }

    const toolOutputs = await Promise.all(
      functionCalls.map(async (call: any) => {
        const parsedArgs = call.arguments ? JSON.parse(call.arguments) : {};
        const output = await executeTool(call.name, parsedArgs, { locale });
        return {
          type: "function_call_output" as const,
          call_id: call.call_id,
          output,
        };
      }),
    );

    response = await client.responses.create({
      model: config.model,
      previous_response_id: response.id,
      input: toolOutputs,
      tools: config.tools,
    });
  }

  throw new Error("Too many tool rounds while generating the response.");
}

export async function* streamTextResponse({
  surface,
  locale,
  messages,
  context,
  model = DEFAULT_AI_MODEL,
}: GenerateTextOptions): AsyncGenerator<AssistantStreamEvent> {
  if (!hasOpenAIKey()) {
    yield {
      type: "error",
      error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env",
    };
    return;
  }

  const client = getOpenAIClient();
  const config = buildRequestConfig(surface, locale, messages, context, model);

  let previousResponseId: string | null = null;
  let nextInput: any = config.input;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const stream = await client.responses.create({
      model: config.model,
      instructions: previousResponseId ? undefined : config.instructions,
      input: nextInput,
      previous_response_id: previousResponseId || undefined,
      tools: config.tools,
      stream: true,
    });

    const functionCalls = new Map<string, any>();
    let sawWebSearch = false;

    for await (const event of stream as any) {
      const responseId = extractResponseIdFromEvent(event);
      if (responseId) previousResponseId = responseId;

      if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
        yield { type: "text_delta", text: event.delta };
      }

      if (event.type === "response.output_item.added" && event.item?.type === "web_search_call") {
        if (!sawWebSearch) {
          sawWebSearch = true;
          yield { type: "tool_call", toolName: "web_search" };
        }
      }

      if (event.type === "response.output_item.done" && event.item?.type === "web_search_call") {
        yield { type: "tool_result", toolName: "web_search", output: "done" };
      }

      collectFunctionCallFromEvent(event, functionCalls);
    }

    if (functionCalls.size === 0) {
      yield { type: "done" };
      return;
    }

    const toolOutputs = [];
    for (const call of Array.from(functionCalls.values())) {
      const parsedArgs = call.arguments ? JSON.parse(call.arguments) : {};
      yield {
        type: "tool_call",
        toolName: call.name,
        args: parsedArgs,
      };
      const output = await executeTool(call.name, parsedArgs, { locale });
      yield {
        type: "tool_result",
        toolName: call.name,
        output,
      };
      toolOutputs.push({
        type: "function_call_output" as const,
        call_id: call.call_id,
        output,
      });
    }

    nextInput = toolOutputs;
  }

  yield {
    type: "error",
    error: "Too many tool rounds while generating the response.",
  };
}
