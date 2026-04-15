"use client";

import {
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
  args?: Record<string, unknown>;
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

function getToolLabel(toolName: string, locale: "en" | "es", args?: Record<string, unknown>): string {
  const meta = TOOL_META[toolName as keyof typeof TOOL_META];
  const base = meta ? (locale === "es" ? meta.es : meta.en) : (locale === "es" ? "Procesando solicitud..." : "Processing request...");

  if (!args) return base;

  if (toolName === "get_civilization_details" && args.civilization) {
    return `${base}: ${String(args.civilization)}`;
  }
  if (toolName === "compare_civilizations" && args.civ1 && args.civ2) {
    return `${base}: ${String(args.civ1)} vs ${String(args.civ2)}`;
  }
  if (toolName === "lookup_player_profiles" && args.name) {
    return `${base}: ${String(args.name)}`;
  }
  if (toolName === "scout_opponent" && args.name) {
    return `${base}: ${String(args.name)}`;
  }

  return base;
}

function getToolIcon(toolName: string) {
  const meta = TOOL_META[toolName as keyof typeof TOOL_META];
  return meta?.icon || ScrollText;
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
          const Icon = getToolIcon(activity.toolName);
          const label = getToolLabel(activity.toolName, locale, activity.args);
          const isDone = activity.status === "done";

          return (
            <div
              key={activity.id}
              className={cn(
                "aoe-tool-card flex items-center gap-3 rounded-lg border px-3 py-2",
                isDone
                  ? "border-aoe-border/60 bg-aoe-card/60"
                  : "border-aoe-accent/30 bg-aoe-accent/5"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border shrink-0",
                  isDone
                    ? "border-green-500/30 text-green-400"
                    : "border-aoe-accent/40 text-aoe-accent"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-200 truncate">{label}</div>
                <div className="text-xs text-gray-500">
                  {isDone
                    ? (locale === "es" ? "✓ Completado" : "✓ Complete")
                    : (locale === "es" ? "Obteniendo resultados..." : "Fetching results...")}
                </div>
              </div>
              {isDone ? (
                <div className="flex items-center gap-1">
                  <span className="aoe-tool-dot aoe-tool-dot-done" />
                  <span className="aoe-tool-dot aoe-tool-dot-done" />
                  <span className="aoe-tool-dot aoe-tool-dot-done" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="aoe-tool-dot" />
                  <span className="aoe-tool-dot aoe-tool-dot-delay-1" />
                  <span className="aoe-tool-dot aoe-tool-dot-delay-2" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
