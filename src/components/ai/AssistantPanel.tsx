"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Send, Sparkles, LogIn } from "lucide-react";
import Link from "next/link";
import { cn, generateId } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ToolActivityPanel, { type ToolActivity } from "@/components/ai/ToolActivityPanel";
import { readAssistantStream } from "@/components/ai/chat-stream";
import MarkdownMessage from "@/components/ai/MarkdownMessage";

type AssistantSurface = "agent" | "live" | "replay";
type AssistantLocale = "en" | "es";

interface PanelMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
}

interface AssistantPanelProps {
  surface: AssistantSurface;
  locale: AssistantLocale;
  context?: unknown;
  title: string;
  placeholder: string;
  emptyHint?: string;
  suggestions?: string[];
  initialPrompt?: string;
  initialPromptLabel?: string;
  initialPromptDescription?: string;
}

export default function AssistantPanel({
  surface,
  locale,
  context,
  title,
  placeholder,
  emptyHint,
  suggestions = [],
  initialPrompt,
  initialPromptLabel,
  initialPromptDescription,
}: AssistantPanelProps) {
  const { isAuthenticated, loginUrl } = useRequireAuth();
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ToolActivity[]>([]);
  const [initialSent, setInitialSent] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef(context);
  contextRef.current = context;

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    setMessages([]);
    setActivities([]);
    setInitialSent(false);
    setLoading(false);
  }, [context]);

  const doSend = useCallback(async (content: string, opts?: { hidden?: boolean }) => {
    if (!content || loading) return;

    const userMessage: PanelMessage = {
      id: generateId(),
      role: "user",
      content,
      hidden: opts?.hidden,
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setActivities([]);

    try {
      const assistantId = generateId();
      let created = false;
      const allMessages = [...messages, userMessage];

      await readAssistantStream(
        {
          surface,
          locale,
          context: contextRef.current,
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
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
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + (event.text || "") }
                  : m
              )
            );
          }

          if (event.type === "tool_call" && event.toolName) {
            const toolName = event.toolName;
            setActivities((prev) => [
              ...prev,
              { id: `${toolName}-${prev.length}`, toolName, status: "running", args: event.args },
            ]);
          }

          if (event.type === "tool_result" && event.toolName) {
            const toolName = event.toolName;
            setActivities((prev) =>
              prev.map((a) =>
                a.toolName === toolName && a.status === "running"
                  ? { ...a, status: "done" }
                  : a
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

      setActivities((prev) => prev.map((a) => ({ ...a, status: "done" })));
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
  }, [loading, messages, surface, locale]);

  function sendMessage(prefilled?: string) {
    const content = (prefilled || input).trim();
    void doSend(content);
  }

  function triggerInitialAnalysis() {
    if (!initialPrompt || initialSent) return;
    setInitialSent(true);
    void doSend(initialPrompt, { hidden: true });
  }

  if (!isAuthenticated) {
    return (
      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {title}
        </h3>
        <div className="rounded-lg border border-aoe-border/60 bg-aoe-dark/40 p-6 text-center">
          <LogIn className="w-8 h-8 text-aoe-accent mx-auto mb-3" />
          <p className="text-sm text-gray-300 mb-4">
            {locale === "es"
              ? "Inicia sesión para utilizar las herramientas de IA"
              : "Sign in to use AI features"}
          </p>
          <Link href={loginUrl} className="btn-primary inline-flex items-center gap-2 text-sm">
            <LogIn className="w-4 h-4" />
            {locale === "es" ? "Iniciar sesión" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  const hasInitialPrompt = Boolean(initialPrompt);
  const showInitialButton = hasInitialPrompt && !initialSent && messages.length === 0;

  return (
    <div className="card">
      <h3 className="section-title flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        {title}
      </h3>

      <div className="space-y-4">
        {showInitialButton && (
          <div className="text-center py-4">
            {initialPromptDescription && (
              <p className="text-sm text-gray-500 mb-4">{initialPromptDescription}</p>
            )}
            <button onClick={triggerInitialAnalysis} className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {initialPromptLabel || (locale === "es" ? "Analizar con IA" : "Analyze with AI")}
            </button>
          </div>
        )}

        <ToolActivityPanel activities={activities} locale={locale} />

        {!showInitialButton && messages.length === 0 && !loading && (
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

        <div ref={scrollContainerRef} className="space-y-3 max-h-[520px] overflow-y-auto">
          {messages.filter((m) => !m.hidden).map((message) => (
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

          {loading && messages.filter((m) => !m.hidden && m.role === "assistant").length === 0 && activities.length === 0 && (
            <div className="mr-auto rounded-xl border border-aoe-border bg-aoe-dark p-4">
              <Loader2 className="w-5 h-5 animate-spin text-aoe-accent" />
            </div>
          )}
        </div>

        {(initialSent || !hasInitialPrompt || messages.length > 0) && (
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
        )}
      </div>
    </div>
  );
}
