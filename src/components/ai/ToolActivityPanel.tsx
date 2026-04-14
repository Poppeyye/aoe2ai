"use client";

import {
  BookOpen,
  Globe,
  Radio,
  ScrollText,
  Shield,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolActivity {
  id: string;
  toolName: string;
  status: "running" | "done";
}

const TOOL_META = {
  lookup_player_profiles: {
    icon: Users,
    en: "Looking up player profiles",
    es: "Buscando perfiles de jugadores",
  },
  scout_opponent: {
    icon: Radio,
    en: "Scouting opponent stats & habits",
    es: "Analizando estadísticas del rival",
  },
  get_civilization_details: {
    icon: Shield,
    en: "Reading civilization tech tree",
    es: "Consultando árbol tecnológico",
  },
  compare_civilizations: {
    icon: Swords,
    en: "Comparing civilizations head-to-head",
    es: "Comparando civilizaciones cara a cara",
  },
  list_tournaments: {
    icon: Trophy,
    en: "Fetching tournament data",
    es: "Obteniendo datos de torneos",
  },
  web_search: {
    icon: Globe,
    en: "Searching the web for latest info",
    es: "Buscando información actualizada",
  },
  web_search_preview: {
    icon: Globe,
    en: "Searching the web for latest info",
    es: "Buscando información actualizada",
  },
} as const;

function getToolMeta(toolName: string, locale: "en" | "es") {
  const meta = TOOL_META[toolName as keyof typeof TOOL_META];
  if (meta) return meta;

  return {
    icon: ScrollText,
    en: "Processing request...",
    es: "Procesando solicitud...",
  };
}

export default function ToolActivityPanel({
  activities,
  locale,
}: {
  activities: ToolActivity[];
  locale: "en" | "es";
}) {
  if (activities.length === 0) return null;

  return (
    <div className="rounded-xl border border-aoe-border/70 bg-aoe-dark/60 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-aoe-accent/80">
        <div className="aoe-tool-orb" />
        {locale === "es" ? "Herramientas activas" : "Active tools"}
      </div>
      <div className="space-y-2">
        {activities.map((activity) => {
          const meta = getToolMeta(activity.toolName, locale);
          const Icon = meta.icon;
          return (
            <div
              key={activity.id}
              className={cn(
                "aoe-tool-card flex items-center gap-3 rounded-lg border px-3 py-2",
                activity.status === "running"
                  ? "border-aoe-accent/30 bg-aoe-accent/5"
                  : "border-aoe-border/60 bg-aoe-card/60"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border",
                  activity.status === "running"
                    ? "border-aoe-accent/40 text-aoe-accent"
                    : "border-green-500/30 text-green-400"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-200">
                  {locale === "es" ? meta.es : meta.en}
                </div>
                <div className="text-xs text-gray-500">
                  {activity.status === "running"
                    ? locale === "es"
                      ? "Obteniendo resultados..."
                      : "Fetching results..."
                    : locale === "es"
                      ? "✓ Completado"
                      : "✓ Complete"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={cn("aoe-tool-dot", activity.status === "done" && "bg-green-400")} />
                <span className={cn("aoe-tool-dot aoe-tool-dot-delay-1", activity.status === "done" && "bg-green-400")} />
                <span className={cn("aoe-tool-dot aoe-tool-dot-delay-2", activity.status === "done" && "bg-green-400")} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
