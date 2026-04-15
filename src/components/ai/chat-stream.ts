export type AssistantSurface = "agent" | "live" | "replay";
export type AssistantLocale = "en" | "es";

export interface StreamPayload {
  surface: AssistantSurface;
  locale: AssistantLocale;
  context?: unknown;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ClientAssistantStreamEvent {
  type: "text_delta" | "tool_call" | "tool_result" | "status" | "done" | "error";
  text?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  output?: string;
  error?: string;
  status?: string;
}

export async function readAssistantStream(
  payload: StreamPayload,
  onEvent: (event: ClientAssistantStreamEvent) => void,
) {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to generate response");
  }

  if (!res.body) {
    throw new Error("Streaming response body is missing.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) {
        const event = JSON.parse(line) as ClientAssistantStreamEvent;
        onEvent(event);
      }
      newlineIndex = buffer.indexOf("\n");
    }

    if (done) break;
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer.trim()) as ClientAssistantStreamEvent);
  }
}
