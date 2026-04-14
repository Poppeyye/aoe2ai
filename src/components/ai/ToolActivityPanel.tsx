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
}

function getToolMeta(toolName: string, locale: "en" | "es") {
  const map = {
    lookup_player_profiles: {
      icon: Users,
      en: "Looking up players",
      es: "Buscando jugadores",
    },
    scout_opponent: {
      icon: Radio,
      en: "Scouting opponent",
      es: "Escouteando rival",
    },
    get_civilization_details: {
      icon: Shield,
      en: "Reading civilization data",
      es: "Leyendo datos de civilización",
    },
    compare_civilizations: {
      icon: Swords,
      en: "Comparing civilizations",
      es: "Comparando civilizaciones",
    },
    list_tournaments: {
      icon: Trophy,
      en: "Checking tournaments",
      es: "Consultando torneos",
    },
    web_search: {
      icon: Globe,
      en: "Searching the web",
      es: "Buscando en internet",
    },
  } as const;

  const fallback = {
    icon: ScrollText,
    en: toolName,
    es: toolName,
  };

  return map[toolName as keyof typeof map] || fallback;
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
                      ? "Consultando datos..."
                      : "Consulting data..."
                    : locale === "es"
                      ? "Listo"
                      : "Done"}
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
