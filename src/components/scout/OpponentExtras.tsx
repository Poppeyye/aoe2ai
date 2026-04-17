"use client";

import { cn } from "@/lib/utils";
import { Swords, Target, Users as UsersIcon, Flame, Zap, Anchor, Shield, Sword, Sparkles } from "lucide-react";

type PlaystyleTag =
  | "cavalry"
  | "archers"
  | "infantry"
  | "camels"
  | "siege"
  | "gunpowder"
  | "navy"
  | "flex"
  | "boom";

const PLAYSTYLE_META: Record<PlaystyleTag, { en: string; es: string; icon: typeof Swords; color: string }> = {
  cavalry: { en: "Cavalry player", es: "Jugador de caballería", icon: Swords, color: "text-red-400 bg-red-500/10 border-red-500/30" },
  archers: { en: "Archer player", es: "Jugador de arqueros", icon: Target, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  infantry: { en: "Infantry player", es: "Jugador de infantería", icon: Shield, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  camels: { en: "Camel player", es: "Jugador de camellos", icon: UsersIcon, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  siege: { en: "Siege player", es: "Jugador de asedio", icon: Flame, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  gunpowder: { en: "Gunpowder player", es: "Jugador de pólvora", icon: Zap, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  navy: { en: "Navy player", es: "Jugador naval", icon: Anchor, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  flex: { en: "Flex player", es: "Jugador flexible", icon: Sparkles, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  boom: { en: "Booming player", es: "Jugador económico", icon: Sword, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
};

export function PlaystyleBadge({ tag, locale }: { tag: PlaystyleTag; locale: "en" | "es" }) {
  const meta = PLAYSTYLE_META[tag];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", meta.color)}>
      <Icon className="w-3 h-3" />
      {locale === "es" ? meta.es : meta.en}
    </span>
  );
}

export function RatingSparkline({ points, width = 100, height = 30 }: { points: number[]; width?: number; height?: number }) {
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const stepX = width / (points.length - 1);
  const toY = (v: number) => height - ((v - min) / range) * height;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${toY(p)}`)
    .join(" ");

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const isUp = lastPoint >= firstPoint;

  return (
    <svg width={width} height={height} className="inline-block">
      <path
        d={path}
        fill="none"
        stroke={isUp ? "#4ade80" : "#f87171"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function formatRelativeTime(timestamp: number, locale: "en" | "es"): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return locale === "es" ? "Ahora mismo" : "Just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return locale === "es" ? `Hace ${m} min` : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return locale === "es" ? `Hace ${h}h` : `${h}h ago`;
  }
  if (diff < 2592000) {
    const d = Math.floor(diff / 86400);
    return locale === "es" ? `Hace ${d}d` : `${d}d ago`;
  }
  const mo = Math.floor(diff / 2592000);
  return locale === "es" ? `Hace ${mo} meses` : `${mo}mo ago`;
}
