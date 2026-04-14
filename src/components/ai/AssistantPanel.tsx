"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import ToolActivityPanel, { type ToolActivity } from "@/components/ai/ToolActivityPanel";
import { readAssistantStream } from "@/components/ai/chat-stream";
import MarkdownMessage from "@/components/ai/MarkdownMessage";

type AssistantSurface = "agent" | "live" | "replay";
type AssistantLocale = "en" | "es";

interface PanelMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AssistantPanelProps {
  surface: AssistantSurface;
  locale: AssistantLocale;
  context?: unknown;
  title: string;
  placeholder: string;
  emptyHint?: string;
  suggestions?: string[];
}

export default function AssistantPanel({
  surface,
  locale,
  context,
  title,
  placeholder,
  emptyHint,
  suggestions = [],
}: AssistantPanelProps) {
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ToolActivity[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(prefilled?: string) {
    const content = (prefilled || input).trim();
    if (!content || loading) return;

    const userMessage: PanelMessage = {
      id: generateId(),
      role: "user",
      content,
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setActivities([]);

    try {
      const assistantId = generateId();
      let created = false;
      await readAssistantStream(
        {
          surface,
          locale,
          context,
          messages: [...messages, userMessage].map((message) => ({
            role: message.role,
            content: message.content,
          })),
        },
        (event) => {
          if (event.type === "text_delta") {
            if (!created) {
              created = true;
              setMessages((prev) => [
                ...prev,
                { id: assistantId, role: "assistant", content: event.text || "" },
              ]);
              return;
            }
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + (event.text || "") }
                  : message
              )
            );
          }

          if (event.type === "tool_call" && event.toolName) {
            const toolName = event.toolName;
            setActivities((prev) => [
              ...prev,
              { id: `${toolName}-${prev.length}`, toolName, status: "running" },
            ]);
          }

          if (event.type === "tool_result" && event.toolName) {
            const toolName = event.toolName;
            setActivities((prev) =>
              prev.map((activity) =>
                activity.toolName === toolName && activity.status === "running"
                  ? { ...activity, status: "done" }
                  : activity
              )
            );
          }

          if (event.type === "error") {
            throw new Error(
              event.error || (locale === "es" ? "Ha ocurrido un error al consultar la IA." : "An error occurred while querying the AI.")
            );
          }
        },
      );

      setActivities((prev) => prev.map((activity) => ({ ...activity, status: "done" })));
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: error instanceof Error
            ? error.message
            : locale === "es"
              ? "Ha ocurrido un error al consultar la IA."
              : "An error occurred while querying the AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3 className="section-title flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        {title}
      </h3>

      <div className="space-y-4">
        <ToolActivityPanel activities={activities} locale={locale} />

        {messages.length === 0 && (
          <div className="rounded-lg border border-aoe-border/60 bg-aoe-dark/40 p-4">
            {emptyHint && <p className="text-sm text-gray-400 leading-relaxed">{emptyHint}</p>}
            {suggestions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-full border border-aoe-border px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-aoe-accent/50 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[90%] rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap",
                message.role === "user"
                  ? "ml-auto bg-aoe-accent/20 text-white"
                  : "mr-auto bg-aoe-dark border border-aoe-border text-gray-200"
              )}
            >
              {message.role === "assistant" ? (
                <MarkdownMessage content={message.content} />
              ) : (
                message.content
              )}
            </div>
          ))}

          {loading && (
            <div className="mr-auto rounded-xl border border-aoe-border bg-aoe-dark p-4">
              <Loader2 className="w-5 h-5 animate-spin text-aoe-accent" />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void sendMessage();
            }}
            disabled={loading}
            placeholder={placeholder}
            className="input-field flex-1"
          />
          <button
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-primary !px-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
