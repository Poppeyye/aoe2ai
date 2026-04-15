"use client";

import { Swords } from "lucide-react";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import AssistantPanel from "@/components/ai/AssistantPanel";
import KofiHint from "@/components/ui/KofiHint";

export default function AgentPage() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.agent;

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Swords className="inline w-8 h-8 text-aoe-accent mr-2" />
          {d.title}
        </h1>
        <p className="text-gray-400">{d.subtitle}</p>
      </div>

      <div className="flex-1 min-h-0">
        <AssistantPanel
          surface="agent"
          locale={locale === "es" ? "es" : "en"}
          title={d.title}
          placeholder={d.placeholder}
          suggestions={suggestions}
          fullscreen
        />
      </div>

      <div className="mt-3 shrink-0">
        <KofiHint />
      </div>
    </div>
  );
}
