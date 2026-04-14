---
name: ai-layer
description: >-
  Work with the AoE2.ai AI layer: OpenAI Responses API, tool calling, streaming,
  locale-aware prompts. Use when adding AI features, modifying tools, changing
  prompts, debugging AI responses, or working with the agent/live/replay AI surfaces.
---

# AI Layer

## Architecture Overview

```
API Route (src/app/api/agent/route.ts)
  → buildRequestConfig()        # system prompt + tools + context
  → OpenAI Responses API        # streaming, multi-turn with tool calls
  → TransformStream → NDJSON    # chunk-by-chunk to client
```

Client components consume the stream via `src/components/ai/useStreamedAssistant.ts`.

## Key Files

| File | Role |
|------|------|
| `src/lib/ai/openai-client.ts` | OpenAI client singleton, model selection |
| `src/lib/ai/runtime.ts` | Core: prompt building, tool dispatch, streaming loop |
| `src/lib/ai/tools.ts` | Tool definitions and executors |
| `src/lib/ai/agent.ts` | Agent surface wrapper |
| `src/lib/ai/replay-analyzer.ts` | Replay-specific AI context and chronicle |
| `src/app/api/agent/route.ts` | Streaming API endpoint (all AI surfaces) |
| `src/components/ai/AssistantPanel.tsx` | Chat UI component |
| `src/components/ai/ToolActivityPanel.tsx` | Tool call visualization |
| `src/components/ai/useStreamedAssistant.ts` | Client-side NDJSON stream consumer |

## Adding a New Tool

1. Define the tool in `src/lib/ai/tools.ts`:

```typescript
{
  name: "my_tool",
  description: "What it does — be specific for the AI",
  parameters: { type: "object", properties: { ... }, required: [...] },
}
```

2. Add the executor in the same file's `executeTool` function:

```typescript
case "my_tool":
  return await myToolFunction(args);
```

3. Add display metadata in `src/components/ai/ToolActivityPanel.tsx` (`TOOL_META`):

```typescript
my_tool: { icon: Sword, label: "My Tool", sub: "Doing the thing..." },
```

4. If the tool is surface-specific, conditionally include it in `runtime.ts` → `getToolsForSurface()`.

## Streaming Protocol

The API returns NDJSON (newline-delimited JSON). Each line is one of:

```json
{"type":"text","content":"partial text chunk"}
{"type":"tool_start","tool":"search_player","args":{...}}
{"type":"tool_end","tool":"search_player"}
{"type":"done"}
{"type":"error","content":"error message"}
```

The stream uses `TransformStream` (not `ReadableStream.start()`) for reliable chunk flushing. The `X-Accel-Buffering: no` header prevents Nginx from buffering.

## Locale-Aware Prompts

`runtime.ts` → `getLocaleInstruction(locale)` injects:
- For `es`: A glossary of AoE2 terms in Spanish (ages, buildings, units) plus community terms kept in English
- For `en`: Standard English instructions

`getSurfaceInstruction(surface, locale)` adds surface-specific guidance (e.g., how to present scout data, replay analysis format).

## Context Injection

Each surface passes domain data as context:

- **Agent**: Conversation history only (tools fetch data on demand)
- **Live Scout**: Player stats, civ/map data, opponent profile via `buildScoutReport()`
- **Replay**: Parsed replay data + `gameKnowledge` benchmarks via `buildReplayAiContext()`

## Model Configuration

Set `OPENAI_MODEL` env var. Default: `gpt-5-mini`. The model is read in `src/lib/ai/openai-client.ts`.

## Debugging

- Check streaming works: `curl -N -X POST https://aoe2.ai/api/agent -H "Content-Type: application/json" -d '{"messages":[...]}'`
- AI returns full response at once? Check `TransformStream` usage and `X-Accel-Buffering` header
- Tool not being called? Check the tool is included in `getToolsForSurface()` and the system prompt mentions it
- Wrong language in response? Check `getLocaleInstruction()` and verify `locale` is passed through the chain
