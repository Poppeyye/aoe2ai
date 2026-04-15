"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Swords, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { cn, generateId } from "@/lib/utils";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ToolActivityPanel, { type ToolActivity } from "@/components/ai/ToolActivityPanel";
import { readAssistantStream } from "@/components/ai/chat-stream";
import MarkdownMessage from "@/components/ai/MarkdownMessage";
import KofiHint from "@/components/ui/KofiHint";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AgentPage() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.agent;
  const { isAuthenticated, isLoading: authLoading, loginUrl } = useRequireAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ToolActivity[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const suggestions = locale === "es"
    ? [
      { icon: "⚔️", text: "Francos vs Mayas en Arabia" },
      { icon: "🛡️", text: "Cómo contrarrestar caballeros" },
      { icon: "📖", text: "Explícame Bizantinos" },
      { icon: "🗺️", text: "Plan de mapa para Arena" },
      { icon: "📊", text: "Cómo mejorar mis timings" },
    ]
    : [
      { icon: "⚔️", text: "Franks vs Mayans on Arabia" },
      { icon: "🛡️", text: "How do I counter knights?" },
      { icon: "📖", text: "Explain Byzantines to me" },
      { icon: "🗺️", text: "Arena game plan" },
      { icon: "📊", text: "How do I improve my uptimes?" },
    ];

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: generateId(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setActivities([]);

    try {
      const assistantId = generateId();
      let created = false;

      await readAssistantStream(
        {
          locale: locale === "es" ? "es" : "en",
          surface: "agent",
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
        (event) => {
          if (event.type === "text_delta") {
            if (!created) {
              created = true;
              setMessages((prev) => [
                ...prev,
                {
                  id: assistantId,
                  role: "assistant",
                  content: event.text || "",
                },
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
              { id: `${toolName}-${prev.length}`, toolName, status: "running", args: event.args },
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
            throw new Error(event.error || d.error_response);
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
          content: error instanceof Error ? error.message : d.error_connection,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-aoe-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Swords className="w-12 h-12 text-aoe-accent mb-4" />
        <h1 className="text-2xl font-medieval font-bold gold-gradient mb-2">{d.title}</h1>
        <p className="text-gray-400 mb-6">{d.subtitle}</p>
        <div className="card max-w-sm w-full text-center p-6">
          <LogIn className="w-8 h-8 text-aoe-accent mx-auto mb-3" />
          <p className="text-sm text-gray-300 mb-4">
            {locale === "es"
              ? "Inicia sesión para chatear con el asistente de IA"
              : "Sign in to chat with the AI assistant"}
          </p>
          <Link href={loginUrl} className="btn-primary inline-flex items-center gap-2 text-sm">
            <LogIn className="w-4 h-4" />
            {locale === "es" ? "Iniciar sesión" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Swords className="inline w-8 h-8 text-aoe-accent mr-2" />
          {d.title}
        </h1>
        <p className="text-gray-400">{d.subtitle}</p>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        <ToolActivityPanel activities={activities} locale={locale === "es" ? "es" : "en"} />

        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {suggestions.map((s) => (
              <button
                key={s.text}
                onClick={() => sendMessage(s.text)}
                className="card !p-3 hover:border-aoe-accent/50 transition-colors cursor-pointer text-sm"
              >
                <span className="mr-2">{s.icon}</span>
                {s.text}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[80%] rounded-xl p-4",
              msg.role === "user"
                ? "ml-auto bg-aoe-accent/20 text-white"
                : "mr-auto card"
            )}
          >
            {msg.role === "assistant" ? (
              <MarkdownMessage content={msg.content} />
            ) : (
              <div className="text-sm leading-relaxed">{msg.content}</div>
            )}
          </div>
        ))}

        {loading && (
          <div className="mr-auto card !p-4 max-w-[80%]">
            <Loader2 className="w-5 h-5 animate-spin text-aoe-accent" />
          </div>
        )}

      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={d.placeholder}
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-primary !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {messages.length > 0 && <div className="mt-3"><KofiHint /></div>}
    </div>
  );
}
