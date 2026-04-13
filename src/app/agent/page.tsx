"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Swords, Loader2 } from "lucide-react";
import { cn, generateId } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { icon: "⚔️", text: "Franks vs Mayans" },
  { icon: "🛡️", text: "Counter: Knights" },
  { icon: "📖", text: "Civ: Byzantines" },
  { icon: "🗺️", text: "Map: Arena" },
  { icon: "📊", text: "Improve timings" },
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: generateId(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: data.content || "Sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Connection error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Swords className="inline w-8 h-8 text-aoe-accent mr-2" />
          The Definitive AoE2 Agent
        </h1>
        <p className="text-gray-400">
          Ask anything about Age of Empires 2. I&apos;ll use real game data to help
          you.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {SUGGESTIONS.map((s) => (
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
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mr-auto card !p-4 max-w-[80%]">
            <Loader2 className="w-5 h-5 animate-spin text-aoe-accent" />
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about matchups, counters, build orders..."
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
    </div>
  );
}
