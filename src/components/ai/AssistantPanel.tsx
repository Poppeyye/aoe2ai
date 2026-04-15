"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Send, Sparkles, LogIn, ArrowDown, Square, Brain } from "lucide-react";
import Link from "next/link";
import { cn, generateId } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSmartScroll } from "@/hooks/useSmartScroll";
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

export interface AssistantPanelProps {
  surface: AssistantSurface;
  locale: AssistantLocale;
  context?: unknown;
  title: string;
  placeholder: string;
  emptyHint?: string;
  suggestions?: string[] | { icon: string; text: string }[];
  initialPrompt?: string;
  initialPromptLabel?: string;
  initialPromptDescription?: string;
  fullscreen?: boolean;
}

const STATUS_LABELS = {
  thinking: { en: "Thinking…", es: "Pensando…" },
  analyzing: { en: "Analyzing tool results…", es: "Analizando resultados…" },
} as const;

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
  fullscreen = false,
}: AssistantPanelProps) {
  const { isAuthenticated, loginUrl } = useRequireAuth();
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ToolActivity[]>([]);
  const [initialSent, setInitialSent] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const contextRef = useRef(context);
  contextRef.current = context;

  const { containerRef, scrollToBottom, userScrolledUpRef } = useSmartScroll([messages, activities, loading, statusText]);

  useEffect(() => {
    setMessages([]);
    setActivities([]);
    setInitialSent(false);
    setLoading(false);
    setStatusText(null);
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
    setStatusText(null);

    const abort = new AbortController();
    abortRef.current = abort;

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
          if (abort.signal.aborted) return;

          if (event.type === "status") {
            if (event.status === "clear") {
              setStatusText(null);
            } else {
              const labels = STATUS_LABELS[event.status as keyof typeof STATUS_LABELS];
              setStatusText(labels ? (locale === "es" ? labels.es : labels.en) : null);
            }
            return;
          }

          if (event.type === "text_delta") {
            setStatusText(null);
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
            setStatusText(null);
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
      if (!abort.signal.aborted) {
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
      }
    } finally {
      setLoading(false);
      setStatusText(null);
      abortRef.current = null;
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

  function stopGeneration() {
    abortRef.current?.abort();
    setLoading(false);
    setStatusText(null);
    setActivities((prev) => prev.map((a) => ({ ...a, status: "done" })));
  }

  if (!isAuthenticated) {
    return (
      <div className={fullscreen ? "flex flex-col items-center justify-center min-h-[40vh]" : "card"}>
        {!fullscreen && (
          <h3 className="section-title flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            {title}
          </h3>
        )}
        <div className="rounded-lg border border-aoe-border/60 bg-aoe-dark/40 p-6 text-center max-w-sm mx-auto">
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
  const visibleMessages = messages.filter((m) => !m.hidden);
  const showScrollDown = userScrolledUpRef.current && loading;

  const chatAreaClass = fullscreen
    ? "flex-1 overflow-y-auto space-y-4 min-h-0"
    : "space-y-3 max-h-[520px] overflow-y-auto";

  return (
    <div className={fullscreen ? "flex flex-col h-full" : "card"}>
      {!fullscreen && (
        <h3 className="section-title flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {title}
        </h3>
      )}

      <div className={fullscreen ? "flex flex-col flex-1 min-h-0 gap-4" : "space-y-4"}>
        {/* Initial analysis button */}
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

        {/* Empty state with suggestions */}
        {!showInitialButton && messages.length === 0 && !loading && (
          <div className={cn(
            fullscreen ? "flex flex-col items-center justify-center flex-1" : "",
          )}>
            {emptyHint && (
              <div className={cn(
                "rounded-lg border border-aoe-border/60 bg-aoe-dark/40 p-4",
                fullscreen && "max-w-xl mx-auto"
              )}>
                <p className="text-sm text-gray-400 leading-relaxed">{emptyHint}</p>
              </div>
            )}
            {suggestions.length > 0 && (
              <div className={cn("flex flex-wrap gap-2", fullscreen ? "justify-center mt-6" : "mt-4")}>
                {suggestions.map((s) => {
                  const text = typeof s === "string" ? s : s.text;
                  const icon = typeof s === "string" ? null : s.icon;
                  return (
                    <button
                      key={text}
                      onClick={() => sendMessage(text)}
                      className={cn(
                        "border border-aoe-border transition-colors hover:border-aoe-accent/50 hover:text-white",
                        fullscreen
                          ? "card !p-3 text-sm cursor-pointer"
                          : "rounded-full px-3 py-1.5 text-xs text-gray-300"
                      )}
                    >
                      {icon && <span className="mr-2">{icon}</span>}
                      {text}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat area */}
        <div ref={containerRef} className={chatAreaClass}>
          {/* Tool activity — placed inside the scroll area */}
          <ToolActivityPanel activities={activities} locale={locale} />

          {/* Status indicator */}
          {statusText && (
            <div className="flex items-center gap-2.5 rounded-lg bg-aoe-dark/50 border border-aoe-border/40 px-4 py-2.5 mr-auto max-w-[85%]">
              <Brain className="w-4 h-4 text-aoe-accent animate-pulse shrink-0" />
              <span className="text-sm text-gray-400">{statusText}</span>
            </div>
          )}

          {/* Messages */}
          {visibleMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "rounded-xl p-4 text-sm leading-relaxed",
                fullscreen ? "max-w-[80%]" : "max-w-[90%]",
                message.role === "user"
                  ? "ml-auto bg-aoe-accent/20 text-white"
                  : cn("mr-auto", fullscreen ? "card" : "bg-aoe-dark border border-aoe-border text-gray-200")
              )}
            >
              {message.role === "assistant" ? (
                <MarkdownMessage content={message.content} />
              ) : (
                <span className="whitespace-pre-wrap">{message.content}</span>
              )}
            </div>
          ))}

          {/* Loading spinner (only when no tool activity and no status) */}
          {loading && visibleMessages.filter((m) => m.role === "assistant").length === 0 && activities.length === 0 && !statusText && (
            <div className={cn("mr-auto rounded-xl border border-aoe-border bg-aoe-dark p-4", fullscreen ? "max-w-[80%]" : "")}>
              <Loader2 className="w-5 h-5 animate-spin text-aoe-accent" />
            </div>
          )}
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollDown && (
          <div className="flex justify-center -mt-2 mb-1">
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1.5 rounded-full bg-aoe-card border border-aoe-border/60 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors shadow-lg"
            >
              <ArrowDown className="w-3 h-3" />
              {locale === "es" ? "Ir al final" : "Scroll to bottom"}
            </button>
          </div>
        )}

        {/* Input area */}
        {(initialSent || !hasInitialPrompt || messages.length > 0) && (
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              disabled={loading}
              placeholder={placeholder}
              className="input-field flex-1"
            />
            {loading ? (
              <button
                onClick={stopGeneration}
                className="btn-primary !px-4 !bg-red-600/80 hover:!bg-red-600"
                title={locale === "es" ? "Detener" : "Stop"}
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => void sendMessage()}
                disabled={!input.trim()}
                className="btn-primary !px-4 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
