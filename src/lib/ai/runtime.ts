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
  type: "text_delta" | "tool_call" | "tool_result" | "status" | "done" | "error";
  text?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  output?: string;
  error?: string;
  status?: string;
  annotations?: Array<{ type: string; url?: string; title?: string; start_index?: number; end_index?: number }>;
}

const MAX_TOOL_ROUNDS = 6;

function getLocaleInstruction(locale: AiLocale) {
  if (locale === "es") {
    return `IDIOMA: Responde SIEMPRE en español.

GLOSARIO AoE2 español — usa siempre estos términos traducidos:
- Dark Age → Edad Oscura
- Feudal Age → Edad Feudal
- Castle Age → Edad de los Castillos
- Imperial Age → Edad Imperial
- Town Center → Centro Urbano
- Barracks → Cuartel
- Archery Range → Galería de Tiro
- Stable → Establo
- Siege Workshop → Taller de Asedio
- Monastery → Monasterio
- University → Universidad
- Market → Mercado
- Blacksmith → Herrería
- Lumber Camp → Campamento Maderero
- Mining Camp → Campamento Minero
- Mill → Molino
- Farm → Granja
- House → Casa
- Villager → Aldeano
- Scout → Explorador
- Knight → Caballero
- Archer → Arquero
- Crossbowman → Ballestero
- Pikeman → Piquero
- Skirmisher → Escaramuzador
- Mangonel → Mangonela
- Trebuchet → Trabuco
- Ram → Ariete
- Monk → Monje

Mantén en inglés los términos de la comunidad que no se traducen: drush, flush, fast castle, boom, push, timing, rush, gg, glhf, wp, elo, smush, douche, trush, FC, uptime, pocket, flank.

DATOS EN INGLÉS: Los campos JSON del contexto (llaves y algunos valores) están en inglés. Transforma TODO a español natural en tu respuesta — nunca muestres llaves JSON crudas ni nombres de campo internos al usuario.`;
  }
  return "LANGUAGE: Always respond in English. Keep standard AoE2 terminology natural.";
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

function getSurfaceInstruction(surface: AiSurface, locale?: AiLocale) {
  switch (surface) {
    case "live":
      return `You are an elite AoE2: Definitive Edition Grandmaster Coach delivering real-time in-game tactical guidance and pre-match tactical briefings.
Treat the provided scout context (player civ, enemy civ, map, opponent playstyle, winrates, recent form) as absolute ground truth.

If the user asks an in-game situational question or combat defense emergency (e.g., enemy scout rush, archer push, forward castle, monk+siege push, tower rush, walling for fast castle):
1. **Immediate Spoken Tactical Punchline (First 1-2 sentences)**:
   Start immediately with a concise, punchy 1-2 sentence direct voice order telling the player exactly what to do right this second (e.g., "Siendo Francos contra Bizantinos en Arabia: mete 4 piqueros en tu madera, amuralla tus bayas y sube a Castillos para sacar jinetes con armadura.").
   Keep this opening sentence clean and direct so it can be spoken aloud seamlessly over headphones via Text-to-Speech.
2. **🚨 Respuesta Inmediata / Immediate Defense**:
   Specify exact emergency actions: units to queue (e.g. 3-4 spearmen, skirmishers), quick-walls around woodlines/gold, house small-walls, or Town Center garrison micro.
3. **⚙️ Ajuste Económico / Eco Adjustment**:
   Where to move idle or threatened villagers, farm reallocation, market buy/sell usage, wood vs gold balance.
4. **🔄 Contragolpe & Transición / Counter-Attack & Win Condition**:
   Age-up timing, military transition (e.g. Knights + Siege, Crossbows + Ballistics, Monks), key Blacksmith upgrades, and how to punish the opponent's overcommitment.

If the user asks for a pre-match loading screen analysis:
Provide the sharp, high-impact **30-Second Tactical Briefing**:
1. 👤 **Perfil del Rival / Opponent Profile**: Clear opponent habits and vulnerabilities.
2. ⚔️ **Ventaja de Matchup / Matchup Advantage**: Civ matchup dynamics, power spikes, unique unit interactions.
3. 🎯 **Plan de Juego en 3 Pasos / 3-Step Game Plan**:
   - **Paso 1 (Apertura / Opening)**: Exact pop & opening recommendation (e.g. "19 Pop Scouts to force spears").
   - **Paso 2 (Alerta Temprana / Early Warning)**: Exact timing spike to respect or scout for.
   - **Paso 3 (Condición de Victoria / Win Condition)**: Castle & Imperial transition target.

${locale === "es" ? "IMPORTANTE: El contexto contiene datos con claves en inglés. Traduce todo a español natural usando nombres oficiales del juego en español (Francos, Mayas, Bizantinos, etc.)." : "Keep standard competitive AoE2 terminology clean, sharp and actionable."}`;

    case "replay":
      return `You are an expert AoE2 Grandmaster replay analyst and high-ELO tournament caster.
Treat the provided replay context as ground truth for all facts, age-up timestamps, combat locations, army counts, and final outcome.

When analyzing a replay, you MUST provide a structured **Root-Cause Loss Post-Mortem (Análisis de Causa Raíz)**:
1. 💥 **El Momento Decisivo (Turning Point)**: Pinpoint the exact minute/battle where the game swung irrevocably (e.g. losing archers under Town Center fire, delayed Castle Age transition while opponent had knights in the eco, unpunished forward Castle drop).
2. 📉 **Fuga Económica (Economic Leak)**: Detail where economy lagged behind (e.g. idle Town Center in Feudal, floating 1000+ unspent wood without dropping farms, late Wheelbarrow, unaddressed villager losses).
3. 🛡️ **La Transición que Faltó / Counter Composition**: Identify what military counter was needed but never produced (e.g. failing to transition from Crossbows to Pikemen/Monks when opponent massed Knights).
4. 💡 **Consejo Concreto para la Próxima Partida (Actionable Takeaway)**: One specific, high-leverage habit to practice in the next match.

Never invent events not supported by the replay context. Avoid raw internal identifiers or cell codes.
${locale === "es" ? "IMPORTANTE: Traduce todas las unidades, edades y edificios a español según el glosario proporcionado." : ""}`;

    case "agent":
    default:
      return `You are The Definitive AoE2 Assistant — the world's premier AI coach and strategy authority for Age of Empires II: Definitive Edition.
You possess deep competitive meta knowledge across all patches, DLCs, and civilizations:
- **Unit Counter Triangle & Micro Mechanics**:
  * Crossbowmen/Archers counter infantry; countered by Skirmishers, Knights, Mangonels/Siege.
  * Knights/Cavalry counter archers and siege; countered by Pikemen/Halberdiers, Camels, Monks, Genoese Crossbowmen, Kamayuks.
  * Monks counter expensive heavy units (Knights, Elephants) and lack mobility; countered by Scout/Light Cavalry, Eagle Warriors.
  * Siege (Mangonels/Onagers) counter clumped ranged units; countered by Cavalry, Bombard Cannons, Redemption Monks.
  * Unique counter dynamics: Huskarls (anti-archer infantry), Ghulams (anti-archer fast infantry), Shrivamsha Riders (dodge projectiles), Rattans (pierce armor archers), Camel Archers (anti-cavalry archers).
- **Map Strategy**:
  * *Arabia / Runestones*: Open map, aggressive Feudal (19-21 pop scouts or archers), walling weaknesses, forward resource denial.
  * *Arena / Fortress*: Closed map, Fast Castle (25-28 pop), Monk + Siege rush ("Smush"), Castle drops on gate/walls, relic race.
  * *Nomad / African Clearing*: TC placement on wood + shore fish, fishing ship boom, water control vs fast land castle.
  * *Black Forest / Hideout*: Chokepoint control, booming, fast imperial, Siege Onager tree-cutting surprise attacks.
- **Eco & Timing Benchmarks**:
  * Feudal uptime: 8:30-10:00 (19-22 pop).
  * Fast Castle uptime: 15:00-16:30 (25-28 pop).
  * Fast Imperial uptime: 21:00-24:00 (Turks/Bohemians/Byzantines).
  * Eco rules: Double-Bit Axe upon hitting Feudal; Wheelbarrow around 14-16 farms in Feudal or during Castle transition.

Use tools whenever the user asks for real player profiles, ladder scouting, or exact tech tree statistics.
Tailor your advice directly to the player's civilization, opponent civ, map, and ELO level.`;
  }
}

function buildInstructions(surface: AiSurface, locale: AiLocale) {
  return [
    getSurfaceInstruction(surface, locale),
    getLocaleInstruction(locale),
    getFormattingRules(),
  ].join("\n\n");
}

function buildInitialInput(messages: ChatMessage[], context?: unknown, locale?: AiLocale) {
  const input: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (context && typeof context === "object" && Object.keys(context as Record<string, unknown>).length > 0) {
    const contextNote = locale === "es"
      ? "Contexto estructurado de la página actual (las claves JSON están en inglés — transforma todo a español natural en tu respuesta, nunca muestres nombres de campo internos):"
      : "Authoritative structured context for this conversation:";

    input.push({
      role: "user",
      content: [
        contextNote,
        "```json",
        JSON.stringify(context, null, 2),
        "```",
        locale === "es"
          ? "Usa este contexto siempre que el usuario pregunte sobre la página actual o el análisis en curso."
          : "Use it whenever the user asks about the current page or current analysis.",
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
    input: buildInitialInput(messages, context, locale),
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
    if (round === 0) {
      yield { type: "status", status: "thinking" };
    } else {
      yield { type: "status", status: "analyzing" };
    }

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
    let sawTextDelta = false;

    for await (const event of stream as any) {
      const responseId = extractResponseIdFromEvent(event);
      if (responseId) previousResponseId = responseId;

      if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
        if (!sawTextDelta) {
          sawTextDelta = true;
          yield { type: "status", status: "clear" };
        }
        yield { type: "text_delta", text: event.delta };
      }

      if (event.type === "response.output_item.added" && event.item?.type === "web_search_call") {
        if (!sawWebSearch) {
          sawWebSearch = true;
          yield { type: "status", status: "clear" };
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

    yield { type: "status", status: "clear" };

    const calls = Array.from(functionCalls.values()).map((call) => ({
      ...call,
      parsedArgs: call.arguments ? JSON.parse(call.arguments) : {},
    }));

    for (const call of calls) {
      yield { type: "tool_call", toolName: call.name, args: call.parsedArgs };
    }

    const toolOutputs = await Promise.all(
      calls.map(async (call) => {
        const output = await executeTool(call.name, call.parsedArgs, { locale });
        return { call, output };
      }),
    );

    for (const { call, output } of toolOutputs) {
      yield { type: "tool_result", toolName: call.name, output };
    }

    nextInput = toolOutputs.map(({ call, output }) => ({
      type: "function_call_output" as const,
      call_id: call.call_id,
      output,
    }));
  }

  yield {
    type: "error",
    error: "Too many tool rounds while generating the response.",
  };
}
