import { generateTextResponse, type ChatMessage } from "@/lib/ai/runtime";
import type { AiLocale } from "@/lib/ai/tools";

export async function runAgent(
  messages: ChatMessage[],
  locale: AiLocale,
  context?: Record<string, unknown>,
) {
  return generateTextResponse({
    surface: "agent",
    locale,
    messages,
    context,
  });
}
